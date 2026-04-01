# Artemis II Mission Tracker

A modern Next.js application that tracks the Artemis II mission using real-time data from the NASA JPL Horizons API.

## Features

- **Real-time Telemetry**: Fetches spacecraft position and velocity data from NASA JPL Horizons API
- **CORS Bypass**: Uses Next.js API routes to avoid browser CORS restrictions
- **Fallback Physics Model**: Estimates distance and speed if API is unavailable
- **Dark Mode Dashboard**: Monospaced, data-focused UI with Tailwind CSS
- **SVG Visualization**: Interactive orbital map showing Earth, Moon, and Orion spacecraft
- **MET Ticker**: Mission Elapsed Time display updating every second
- **Auto-polling**: Refreshes data every 60 seconds

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
artemis2/
├── app/
│   ├── api/
│   │   └── horizons/
│   │       └── route.ts          # NASA API proxy endpoint
│   ├── globals.css               # Tailwind CSS imports
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard component
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## API Routes

### `/api/horizons`

Server-side proxy that fetches data from NASA JPL Horizons API to bypass CORS restrictions.

**Request:** `GET /api/horizons`

**Response:**
```json
{
  "success": true,
  "data": {
    "distance": 12345.6,
    "speed": 28000.0,
    "x": 1000.0,
    "y": 2000.0,
    "z": 3000.0,
    "vx": 5.0,
    "vy": 6.0,
    "vz": 7.0,
    "calendarDate": "2026-04-02 12:00:00"
  }
}
```

## NASA JPL Horizons API Configuration

- **Spacecraft ID**: -5 (Orion spacecraft)
- **Reference Frame**: Earth geocenter (500@399)
- **Data Type**: Vectors with CSV format
- **Time Range**: Current time to +1 minute
- **Step Size**: 1 minute

## Physics Model (Fallback)

When the NASA API is unavailable, the application uses a physics-based estimation:

1. **Days 0-10**: Low Earth Orbit phase
   - Distance: 6,371 + (days × 100) km
   - Speed: 28,000 - (days × 100) km/h

2. **Days 10-26**: Trans-lunar injection and transit
   - Distance: 7,000 to 391,400 km (linear interpolation)
   - Speed: 39,000 to 44,000 km/h (linear interpolation)

3. **Days 26+**: Lunar orbit
   - Distance: 391,400 km (Moon distance)
   - Speed: 1,680 km/h

## Build for Production

```bash
npm run build
npm start
```

## Deployment

⚠️ **Important**: This application uses Next.js API routes which require server-side functionality. **GitHub Pages does not support Next.js API routes**.

### Recommended Hosting Options:

1. **Vercel** (Recommended for Next.js):
   - Free tier available
   - Built for Next.js applications
   - Automatic deployment from GitHub
   - Supports API routes and server-side rendering

2. **Netlify**:
   - Free tier available
   - Supports Next.js with serverless functions
   - Automatic deployment from GitHub

3. **Railway**, **Render**, or **AWS Amplify**:
   - Various hosting options with serverless support

To deploy to Vercel:
1. Push your code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

## Technologies Used

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **NASA JPL Horizons API**: Spacecraft telemetry data source

## License

This project is for educational purposes. NASA data is in the public domain.
