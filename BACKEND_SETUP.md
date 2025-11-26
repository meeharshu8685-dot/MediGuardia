# Backend Setup Guide - Hospital Finder Module

This guide explains how to set up and run the Hospital Finder backend API.

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   └── hospitals/
│   │       ├── hospital.routes.ts      # API routes
│   │       ├── hospital.controller.ts  # Request handlers
│   │       ├── hospital.service.ts     # Business logic
│   │       └── overpass.client.ts      # OpenStreetMap API client
│   ├── middleware/
│   │   └── auth.middleware.ts         # JWT authentication
│   ├── utils/
│   │   └── distance.util.ts            # Haversine formula
│   └── server.ts                       # Express server
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### 4. Test the API

```bash
# Health check (no auth required)
curl http://localhost:3001/health

# Get hospitals (auth required)
curl -X GET "http://localhost:3001/api/hospitals?lat=18.5204&lng=73.8567&radius=5000" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

## 📡 API Endpoint

### GET /api/hospitals

**Authentication:** Required (Supabase JWT)

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in meters (100-50000, default: 5000)

**Response Format:**
```json
[
  {
    "name": "City Hospital",
    "distance_km": 1.3,
    "address": "Sector 4 Main Road, Pune",
    "lat": 18.9912,
    "lng": 72.8321,
    "fields": ["General", "Emergency"],
    "google_maps_url": "https://www.google.com/maps/dir/?api=1&destination=18.9912,72.8321"
  }
]
```

## 🔧 Features

### 1. OpenStreetMap Integration
- Uses Overpass API to fetch real hospital data
- Supports nodes, ways, and relations
- No API key required

### 2. Distance Calculation
- Haversine formula for accurate distance
- Returns distance in kilometers
- Sorted by proximity

### 3. Hospital Classification
- Rule-based AI classification
- Identifies specialties from name and tags
- Fields: Pediatrics, Emergency, Cardiology, etc.

### 4. Authentication
- Supabase JWT validation
- Secure endpoint access
- User context available in requests

### 5. Error Handling
- Input validation
- Proper HTTP status codes
- Detailed error messages

## 🏗️ Architecture

### Request Flow

```
Client Request
    ↓
Auth Middleware (JWT validation)
    ↓
Route Handler
    ↓
Controller (validation)
    ↓
Service (business logic)
    ↓
Overpass Client (API call)
    ↓
Distance Calculation
    ↓
Classification
    ↓
Response (JSON)
```

### Key Components

**Overpass Client:**
- Handles OpenStreetMap API calls
- Builds Overpass QL queries
- Parses response

**Hospital Service:**
- Transforms API data
- Calculates distances
- Classifies hospitals
- Generates Google Maps URLs

**Auth Middleware:**
- Validates Supabase tokens
- Attaches user to request
- Handles authentication errors

## 🔒 Security

- JWT token validation
- Input sanitization
- Rate limiting (recommended for production)
- CORS configuration

## 📦 Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Set in your hosting platform:
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Recommended Platforms

- **Vercel**: Serverless functions
- **Railway**: Easy deployment
- **Render**: Free tier
- **Heroku**: Traditional hosting

## 🐛 Troubleshooting

**Overpass API Timeout:**
- Increase timeout in `overpass.client.ts`
- Reduce search radius
- Add retry logic

**No Hospitals Found:**
- Check coordinates are valid
- Increase radius
- Verify Overpass API is accessible

**Authentication Errors:**
- Verify Supabase credentials
- Check token expiration
- Ensure token is sent in Authorization header

## 📚 Next Steps

1. Integrate with frontend (see `FRONTEND_INTEGRATION.md`)
2. Add caching layer (Redis recommended)
3. Add rate limiting
4. Add logging/monitoring
5. Add unit tests

## 📝 Notes

- Overpass API is free but has rate limits
- Consider caching results for better performance
- Hospital classification can be improved with ML models
- Address extraction depends on OSM data quality

