# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for file uploads (profile pictures, documents, etc.).

## 📋 Step-by-Step Setup

### Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard
2. Navigate to **Storage** (left sidebar)
3. Click **"New bucket"**

#### Create `avatars` Bucket (for profile pictures)

- **Name**: `avatars`
- **Public**: ✅ **Yes** (so images can be accessed via URL)
- **File size limit**: 5 MB (or your preference)
- **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
- Click **"Create bucket"**

#### Create `documents` Bucket (for medical documents)

- **Name**: `documents`
- **Public**: ❌ **No** (private - only accessible by authenticated users)
- **File size limit**: 10 MB (or your preference)
- **Allowed MIME types**: `application/pdf, image/jpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Click **"Create bucket"**

### Step 2: Set Up Storage Policies (RLS)

Go to **Storage** → **Policies** tab for each bucket.

#### For `avatars` Bucket (Public Read, User Write)

```sql
-- Allow public to read avatars
CREATE POLICY "Public Avatar Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

#### For `documents` Bucket (Private - User Only)

```sql
-- Allow users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Verify Setup

1. Go to **Storage** → **avatars** bucket
2. Click **"Upload file"** (test upload)
3. Verify file appears
4. Check that the URL is accessible (for public bucket)

## 📝 Usage in Code

See `lib/supabaseStorage.ts` for helper functions.

### Upload Avatar Example

```typescript
import { uploadAvatar } from '../lib/supabaseStorage';

const handleAvatarUpload = async (file: File) => {
    const { data, error } = await uploadAvatar(file);
    if (error) {
        console.error('Upload failed:', error);
        return;
    }
    // data.url contains the public URL
    console.log('Avatar URL:', data.url);
};
```

### Upload Document Example

```typescript
import { uploadDocument } from '../lib/supabaseStorage';

const handleDocumentUpload = async (file: File) => {
    const { data, error } = await uploadDocument(file);
    if (error) {
        console.error('Upload failed:', error);
        return;
    }
    // data.path contains the file path
    console.log('Document path:', data.path);
};
```

## 🔒 Security Notes

- ✅ **Public buckets** (`avatars`): Anyone can view, but only owner can upload/delete
- ✅ **Private buckets** (`documents`): Only owner can access
- ✅ **RLS policies** ensure users can only manage their own files
- ✅ **File size limits** prevent abuse
- ✅ **MIME type restrictions** prevent malicious uploads

## 🆘 Troubleshooting

### Error: "new row violates row-level security policy"
- **Solution**: Check that storage policies are created correctly
- Verify bucket name matches in policy

### Error: "Bucket not found"
- **Solution**: Ensure bucket is created in Supabase Dashboard
- Check bucket name spelling (case-sensitive)

### Error: "File too large"
- **Solution**: Increase file size limit in bucket settings
- Or compress file before upload

### Can't access uploaded file
- **Public bucket**: Use the public URL from `getPublicUrl()`
- **Private bucket**: Use `createSignedUrl()` for temporary access

