# MediGuardia Backend API

Backend API for MediGuardia Hospital Finder module.

## Features

- ✅ Hospital Finder API using OpenStreetMap Overpass API
- ✅ Distance calculation using Haversine formula
- ✅ AI-based hospital classification (rule-based)
- ✅ Supabase JWT authentication
- ✅ Google Maps URL generation for directions

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `PORT`: Server port (default: 3001)

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### GET /api/hospitals

Get nearby hospitals.

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in meters (default: 5000, max: 50000)

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/hospitals?lat=18.5204&lng=73.8567&radius=5000" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

**Example Response:**
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

### GET /health

Health check endpoint (no authentication required).

## Architecture

```
src/
├── modules/
│   └── hospitals/
│       ├── hospital.routes.ts      # Route definitions
│       ├── hospital.controller.ts   # Request handlers
│       ├── hospital.service.ts     # Business logic
│       └── overpass.client.ts      # Overpass API client
├── middleware/
│   └── auth.middleware.ts          # JWT authentication
├── utils/
│   └── distance.util.ts            # Haversine formula
└── server.ts                       # Express app setup
```

## Hospital Classification

The service uses a rule-based classification system to identify hospital specialties:

- **Pediatrics**: Contains "children", "pediatric", "kids"
- **Emergency/Surgery**: Contains "emergency", "trauma", "surgery"
- **Cardiology**: Contains "cardiac", "cardiology", "heart"
- **Orthopedics**: Contains "orthopedic", "bone"
- **Maternity**: Contains "maternity", "obstetric", "women"
- **Mental Health**: Contains "mental", "psychiatric"
- **Oncology**: Contains "cancer", "oncology", "tumor"
- **Ophthalmology**: Contains "eye", "ophthalmic", "vision"
- **General**: Default if no specific fields match

## Error Handling

All endpoints return proper HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `500`: Internal server error

## Deployment

### Environment Variables

Make sure to set these in your production environment:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PORT`

### Recommended Platforms

- **Vercel**: Serverless functions
- **Railway**: Easy deployment
- **Render**: Free tier available
- **Heroku**: Traditional hosting
- **AWS Lambda**: Serverless

## Frontend Integration

See `FRONTEND_INTEGRATION.md` for detailed integration instructions.

