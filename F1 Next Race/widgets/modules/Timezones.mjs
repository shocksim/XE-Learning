// Shared timezone helper for iCUE widget meta-properties.
// Keeps all Sports Scores widgets aligned on a single implementation.
// Fallback list is offset-focused (one representative per zone where possible).

function autoLabel() {
  return typeof tr === 'function' ? tr('Auto (System)') : 'Auto (System)';
}

// Fixed offsets keep the list lightweight and avoid runtime calculations.
const FALLBACK_OPTIONS = [
  { key: 'auto', value: autoLabel() },
  { key: 'UTC', value: 'UTC (UTC+0)' },

  // Americas (representative time zones)
  { key: 'America/Los_Angeles', value: 'Los Angeles/Seattle (UTC-8)' }, // Pacific
  { key: 'America/Denver', value: 'Denver/Edmonton (UTC-7)' }, // Mountain
  { key: 'America/Chicago', value: 'Chicago/Dallas (UTC-6)' }, // Central
  { key: 'America/New_York', value: 'New York/Toronto (UTC-5)' }, // Eastern
  { key: 'America/Anchorage', value: 'Anchorage/Juneau (UTC-9)' }, // Alaska
  { key: 'Pacific/Honolulu', value: 'Honolulu/Hilo (UTC-10)' }, // Hawaii
  { key: 'America/Phoenix', value: 'Phoenix/Tucson (UTC-7)' }, // Mountain (no DST)
  { key: 'America/Sao_Paulo', value: 'Sao Paulo/Rio (UTC-3)' }, // Brazil
  { key: 'America/Argentina/Buenos_Aires', value: 'Buenos Aires/Montevideo (UTC-3)' }, // Argentina

  // Europe (representative time zones)
  { key: 'Europe/London', value: 'London/Dublin (UTC+0)' }, // GMT/BST
  { key: 'Europe/Paris', value: 'Paris/Berlin (UTC+1)' }, // CET/CEST
  { key: 'Europe/Athens', value: 'Athens/Helsinki (UTC+2)' }, // EET/EEST
  { key: 'Europe/Istanbul', value: 'Istanbul/Kharkiv (UTC+3)' }, // TRT

  // Africa + Middle East (representative time zones)
  { key: 'Africa/Cairo', value: 'Cairo/Tripoli (UTC+2)' }, // EET
  { key: 'Africa/Johannesburg', value: 'Johannesburg/Harare (UTC+2)' }, // SAST
  { key: 'Asia/Dubai', value: 'Dubai/Abu Dhabi (UTC+4)' }, // Gulf

  // Asia-Pacific (representative time zones)
  { key: 'Asia/Kolkata', value: 'Kolkata/Mumbai (UTC+5:30)' }, // IST
  { key: 'Asia/Bangkok', value: 'Bangkok/Jakarta (UTC+7)' }, // ICT
  { key: 'Asia/Shanghai', value: 'Shanghai/Hong Kong (UTC+8)' }, // China Standard
  { key: 'Asia/Tokyo', value: 'Tokyo/Osaka (UTC+9)' }, // JST
  { key: 'Australia/Perth', value: 'Perth/Port Hedland (UTC+8)' }, // AWST
  { key: 'Australia/Sydney', value: 'Sydney/Melbourne (UTC+10)' }, // AEST/AEDT
  { key: 'Pacific/Auckland', value: 'Auckland/Wellington (UTC+12)' } // NZ
];

export function getAvailableTimezones() {
  // Fallback list covers common offsets with minimal duplication.
  return FALLBACK_OPTIONS;
}

export function getDefaultTimezoneKey() {
  // Always default to system time via "auto".
  return 'auto';
}
