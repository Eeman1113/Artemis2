# Artemis II Mission Tracker

A modern Next.js application that tracks the Artemis II mission using real-time data from the NASA JPL Horizons API.

## Features

- **Real-time Telemetry**: Fetches spacecraft position and velocity data from NASA JPL Horizons API
- **CORS Bypass**: Uses public CORS proxy service to avoid browser CORS restrictions
- **Static Deployment**: Optimized for GitHub Pages with static export
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
│   ├── globals.css               # Tailwind CSS imports
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard component
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions deployment workflow
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
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
```

This creates a static export in the `out` directory optimized for GitHub Pages.

## Deployment to GitHub Pages

The application is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Automatic Deployment

When you push to the `main` branch, GitHub Actions will:
1. Install dependencies
2. Build the static export
3. Deploy to GitHub Pages

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `out` folder to GitHub Pages:
```bash
gh-pages -d out
```

### Live Demo

The application is available at: **https://eeman1113.github.io/Artemis2/**

### Technical Notes

- **Static Export**: Uses `next export` to generate static HTML/CSS/JS files
- **CORS Proxy**: Uses allorigins.win public service to bypass browser CORS restrictions
- **GitHub Pages**: Serves the static files with no server-side functionality
- **Fallback Physics**: If the API fails, the app uses physics-based calculations

## Technologies Used

- **Next.js 14**: React framework with App Router (Static Export)
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **NASA JPL Horizons API**: Spacecraft telemetry data source
- **AllOrigins CORS Proxy**: Public CORS proxy service
- **GitHub Pages**: Static site hosting

## License

This project is for educational purposes. NASA data is in the public domain.
