import { NextResponse } from 'next/server';

export async function GET() {
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

    const response = await fetch(nasaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArtemisTracker/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`NASA API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error('No result in NASA API response');
    }

    const lines = data.result.split('\n');
    const soeIndex = lines.findIndex(line => line.includes('$$SOE'));

    if (soeIndex === -1 || lines[soeIndex + 2] === undefined) {
      throw new Error('Could not parse ephemeris data');
    }

    const dataLine = lines[soeIndex + 2].trim();
    const parts = dataLine.split(',').map(p => p.trim());

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

    return NextResponse.json({
      success: true,
      data: {
        distance,
        speed,
        x,
        y,
        z,
        vx,
        vy,
        vz,
        calendarDate: parts[1]
      }
    });

  } catch (error) {
    console.error('NASA API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
