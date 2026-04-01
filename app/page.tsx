'use client';

import { useEffect, useState, useRef } from 'react';

interface HorizonsData {
  distance: number;
  speed: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  calendarDate: string;
}

const LAUNCH_EPOCH = 1743547712000;

export default function Home() {
  const [horizonsData, setHorizonsData] = useState<HorizonsData | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const metDisplayRef = useRef<HTMLDivElement>(null);
  const metRef = useRef<string>('');

  const formatMET = (met: number): string => {
    const days = Math.floor(met / 86400);
    const hours = Math.floor((met % 86400) / 3600);
    const minutes = Math.floor((met % 3600) / 60);
    const seconds = Math.floor(met % 60);
    return `T+ ${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateFallbackPhysics = (met: number): { distance: number; speed: number } => {
    const days = met / 86400;
    
    if (days < 10) {
      return {
        distance: 6371 + (days * 100),
        speed: 28000 - (days * 100)
      };
    } else if (days < 26) {
      const transitProgress = (days - 10) / 16;
      return {
        distance: 7000 + (transitProgress * 384400),
        speed: 39000 + (transitProgress * 5000)
      };
    } else {
      return {
        distance: 391400,
        speed: 1680
      };
    }
  };

  const fetchHorizonsData = async () => {
    try {
      const now = new Date();
      const startTime = now.toISOString().replace('T', ' ').substring(0, 16);
      const stopTime = new Date(now.getTime() + 60000).toISOString().replace('T', ' ').substring(0, 16);

      const params = new URLSearchParams({
        format: 'json',
        "COMMAND": "'-5'",
        "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'VECTORS'",
        "CENTER": "'500@399'",
        "START_TIME": `'${startTime}'`,
        "STOP_TIME": `'${stopTime}'`,
        "STEP_SIZE": "'1m'",
        "VEC_TABLE": "'1'",
        "CSV_FORMAT": "'YES'"
      });

      const nasaUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`;
      const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(nasaUrl)}`;

      const response = await fetch(corsProxyUrl);
      const proxyResult = await response.json();

      if (!proxyResult.contents) {
        throw new Error('No response from CORS proxy');
      }

      const data = JSON.parse(proxyResult.contents);

      if (!data.result) {
        throw new Error('No result in NASA API response');
      }

      const lines = data.result.split('\n');
      const soeIndex = lines.findIndex((line: string) => line.includes('$$SOE'));

      if (soeIndex === -1 || lines[soeIndex + 2] === undefined) {
        throw new Error('Could not parse ephemeris data');
      }

      const dataLine = lines[soeIndex + 2].trim();
      const parts = dataLine.split(',').map((p: string) => p.trim());

      if (parts.length < 8) {
        throw new Error('Invalid data format');
      }

      const x = parseFloat(parts[2]);
      const y = parseFloat(parts[3]);
      const z = parseFloat(parts[4]);
      const vx = parseFloat(parts[5]);
      const vy = parseFloat(parts[6]);
      const vz = parseFloat(parts[7]);

      const distance = Math.sqrt(x * x + y * y + z * z);
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz) * 3600;

      setHorizonsData({
        distance,
        speed,
        x,
        y,
        z,
        vx,
        vy,
        vz,
        calendarDate: parts[1]
      });
      setUseFallback(false);

    } catch (error) {
      console.error('NASA API Error:', error);
      setUseFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHorizonsData();
    const interval = setInterval(fetchHorizonsData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateMET = () => {
      const now = Date.now();
      const met = Math.max(0, now - LAUNCH_EPOCH) / 1000;
      metRef.current = formatMET(met);
      
      if (metDisplayRef.current) {
        metDisplayRef.current.textContent = metRef.current;
      }
    };

    updateMET();
    const interval = setInterval(updateMET, 1000);
    return () => clearInterval(interval);
  }, []);

  const met = Math.max(0, Date.now() - LAUNCH_EPOCH) / 1000;
  const fallbackData = calculateFallbackPhysics(met);
  const displayData = useFallback ? {
    ...fallbackData,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    calendarDate: new Date().toISOString()
  } : horizonsData;

  const distancePercentage = Math.min(100, (displayData?.distance || 0) / 384400 * 100);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 font-mono p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">ARTEMIS II MISSION TRACKER</h1>
          <p className="text-zinc-400 text-sm">Real-time spacecraft telemetry from NASA JPL Horizons API</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">MISSION ELAPSED TIME</h2>
              <div className="text-3xl font-bold text-green-400" ref={metDisplayRef}>
                {metRef.current || formatMET(met)}
              </div>
              <div className="text-xs text-zinc-500 mt-2">Launch: Apr 1 2026 22:35:12 UTC</div>
            </div>

            {isLoading && !displayData ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="text-zinc-400">Loading telemetry data...</div>
              </div>
            ) : (
              <>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-zinc-100 mb-4">DISTANCE FROM EARTH</h2>
                  <div className="text-4xl font-bold text-cyan-400">
                    {displayData?.distance.toFixed(1)} <span className="text-xl">km</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">
                    {useFallback && '[Physics Model] '}
                    Earth-Moon Distance: 384,400 km
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-zinc-100 mb-4">SPACECRAFT VELOCITY</h2>
                  <div className="text-4xl font-bold text-yellow-400">
                    {displayData?.speed.toFixed(1)} <span className="text-xl">km/h</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">
                    {useFallback && '[Physics Model] '}
                    Relative to Earth
                  </div>
                </div>

                {displayData && !useFallback && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-zinc-100 mb-4">POSITION VECTOR (km)</h2>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-zinc-500">X</div>
                        <div className="text-cyan-300">{displayData.x.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Y</div>
                        <div className="text-cyan-300">{displayData.y.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Z</div>
                        <div className="text-cyan-300">{displayData.z.toFixed(3)}</div>
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-100 mt-4 mb-2">VELOCITY VECTOR (km/s)</h2>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-zinc-500">VX</div>
                        <div className="text-yellow-300">{displayData.vx.toFixed(6)}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">VY</div>
                        <div className="text-yellow-300">{displayData.vy.toFixed(6)}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">VZ</div>
                        <div className="text-yellow-300">{displayData.vz.toFixed(6)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">ORBITAL VISUALIZATION</h2>
            <svg viewBox="0 0 400 400" className="w-full">
              <defs>
                <radialGradient id="earthGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e40af" />
                </radialGradient>
                <radialGradient id="moonGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d4d4d4" />
                  <stop offset="100%" stopColor="#71717a" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle cx="200" cy="200" r="180" fill="none" stroke="#27272a" strokeWidth="1" />
              
              <circle cx="200" cy="200" r="15" fill="url(#earthGradient)" />
              <text x="200" y="235" textAnchor="middle" className="text-xs" fill="#71717a">EARTH</text>

              <circle cx="340" cy="200" r="6" fill="url(#moonGradient)" />
              <text x="340" y="220" textAnchor="middle" className="text-xs" fill="#71717a">MOON</text>

              <line x1="200" y1="200" x2="340" y2="200" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />

              <circle 
                cx={200 + (distancePercentage / 100) * 140 * Math.cos(met * 0.001)}
                cy={200 + (distancePercentage / 100) * 140 * Math.sin(met * 0.001)}
                r="8" 
                fill="#22c55e" 
                filter="url(#glow)"
              />
              <text 
                x={200 + (distancePercentage / 100) * 140 * Math.cos(met * 0.001)}
                y={200 + (distancePercentage / 100) * 140 * Math.sin(met * 0.001) - 15}
                textAnchor="middle" 
                className="text-xs" 
                fill="#22c55e"
              >
                ORION
              </text>

              <text x="20" y="380" className="text-xs" fill="#71717a">Scale: 1px ≈ 2,135 km</text>
              <text x="20" y="395" className="text-xs" fill="#71717a">Distance: {displayData?.distance.toFixed(0)} km ({distancePercentage.toFixed(1)}%)</text>
            </svg>
          </div>
        </div>

        <footer className="mt-8 border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500">
          Data Source: NASA JPL Horizons System via CORS Proxy | Updated every 60 seconds | {useFallback && 'Fallback Physics Model Active'}
        </footer>
      </div>
    </main>
  );
}
