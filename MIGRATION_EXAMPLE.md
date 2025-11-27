# Migration Example: Converting sosService.ts from Firestore to Supabase

This document shows a practical example of migrating a service from Firebase Firestore to Supabase PostgreSQL.

## Before (Firestore)

```typescript
// features/sos/sosService.ts (OLD - Firestore)
import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { SOSLog } from '../../types';

export const createSOSLog = async (
    latitude: number,
    longitude: number,
    address?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const sosRef = collection(db, 'sos_logs', user.id, 'logs');
        const docRef = await addDoc(sosRef, {
            userId: user.id,
            latitude,
            longitude,
            address: address || '',
            timestamp: new Date().toISOString(),
            status: 'active',
            emergencyContactNotified: false,
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error creating SOS log:', error);
        return { success: false, error: error.message || 'Failed to create SOS log' };
    }
};

export const getSOSLogs = async (): Promise<SOSLog[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const sosRef = collection(db, 'sos_logs', user.id, 'logs');
        const q = query(sosRef, orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as SOSLog[];
    } catch (error) {
        console.error('Error fetching SOS logs:', error);
        return [];
    }
};
```

## After (Supabase)

```typescript
// features/sos/sosService.ts (NEW - Supabase)
import { supabase } from '../../lib/supabase';
import { SOSLog } from '../../types';

export const createSOSLog = async (
    latitude: number,
    longitude: number,
    address?: string,
    emergencyCategory?: string,
    emergencyMessage?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from('sos_logs')
            .insert({
                user_id: user.id,
                latitude,
                longitude,
                address: address || null,
                emergency_category: emergencyCategory || null,
                emergency_message: emergencyMessage || null,
                status: 'active',
                emergency_contact_notified: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating SOS log:', error);
            return { success: false, error: error.message || 'Failed to create SOS log' };
        }

        return { success: true, id: data.id };
    } catch (error: any) {
        console.error('Error creating SOS log:', error);
        return { success: false, error: error.message || 'Failed to create SOS log' };
    }
};

export const getSOSLogs = async (): Promise<SOSLog[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('sos_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching SOS logs:', error);
            return [];
        }

        // Map Supabase column names to your SOSLog type
        return data.map(log => ({
            id: log.id,
            userId: log.user_id,
            latitude: log.latitude,
            longitude: log.longitude,
            address: log.address,
            emergencyCategory: log.emergency_category,
            emergencyMessage: log.emergency_message,
            timestamp: log.timestamp,
            status: log.status,
            emergencyContactNotified: log.emergency_contact_notified,
        })) as SOSLog[];
    } catch (error) {
        console.error('Error fetching SOS logs:', error);
        return [];
    }
};
```

## Key Differences

### 1. **Imports**
- ❌ Remove: `import { collection, addDoc, ... } from 'firebase/firestore'`
- ❌ Remove: `import { db } from '../../lib/firebase'`
- ✅ Keep: `import { supabase } from '../../lib/supabase'`

### 2. **Creating Records**
- **Firestore**: `collection(db, 'table_name')` → `addDoc(ref, data)`
- **Supabase**: `supabase.from('table_name').insert(data)`

### 3. **Reading Records**
- **Firestore**: `query(collection(...), orderBy(...), limit(...))` → `getDocs(q)`
- **Supabase**: `supabase.from('table_name').select().eq(...).order(...).limit(...)`

### 4. **Column Naming**
- **Firestore**: Uses camelCase (e.g., `userId`, `emergencyContactNotified`)
- **Supabase**: Uses snake_case (e.g., `user_id`, `emergency_contact_notified`)
- **Solution**: Map between formats in your service layer

### 5. **Timestamps**
- **Firestore**: Automatically handles timestamps
- **Supabase**: Uses `TIMESTAMPTZ` - returns ISO strings, same format

## Using the Helper Functions

You can also use the helper functions from `lib/supabaseDb.ts`:

```typescript
import { createRecord, getUserRecords } from '../../lib/supabaseDb';

// Create SOS log
export const createSOSLog = async (lat: number, lng: number) => {
    const result = await createRecord('sos_logs', {
        latitude: lat,
        longitude: lng,
        status: 'active',
    });
    return result;
};

// Get SOS logs
export const getSOSLogs = async (): Promise<SOSLog[]> => {
    return await getUserRecords<SOSLog>('sos_logs', 'timestamp', 'desc', 50);
};
```

## Common Patterns

### Pattern 1: Simple CRUD

```typescript
// Create
const { data, error } = await supabase
    .from('table_name')
    .insert({ field: value })
    .select()
    .single();

// Read
const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', userId);

// Update
const { data, error } = await supabase
    .from('table_name')
    .update({ field: newValue })
    .eq('id', recordId)
    .eq('user_id', userId);

// Delete
const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId);
```

### Pattern 2: Upsert (Insert or Update)

```typescript
const { data, error } = await supabase
    .from('medical_profiles')
    .upsert(
        { user_id: userId, name: 'John' },
        { onConflict: 'user_id' }
    )
    .select()
    .single();
```

### Pattern 3: Filtering and Sorting

```typescript
const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })
    .limit(10);
```

## Testing Your Migration

1. **Test Create**: Create a new record and verify it appears in Supabase Dashboard
2. **Test Read**: Fetch records and verify data structure
3. **Test Update**: Update a record and verify changes
4. **Test Delete**: Delete a record and verify removal
5. **Test RLS**: Try accessing another user's data (should fail)

## Troubleshooting

### Error: "new row violates row-level security policy"
- **Solution**: Check that RLS policies are set up correctly
- Verify `auth.uid() = user_id` in your policies

### Error: "column does not exist"
- **Solution**: Check column names match your SQL schema
- Remember: Supabase uses snake_case, not camelCase

### Error: "relation does not exist"
- **Solution**: Verify table was created in SQL Editor
- Check table name spelling (case-sensitive)

### Data not appearing
- **Solution**: Check RLS policies allow your user to read
- Verify `user_id` matches authenticated user

