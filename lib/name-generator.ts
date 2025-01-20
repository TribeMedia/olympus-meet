const adjectives = [
  'swift', 'bright', 'cosmic', 'digital', 'epic', 'fluid', 
  'golden', 'hyper', 'iconic', 'jade', 'keen', 'lunar', 
  'mystic', 'noble', 'omega', 'prime', 'quantum', 'rapid', 
  'solar', 'tech', 'ultra', 'vivid', 'wave', 'xenon', 
  'yield', 'zero'
];

const nouns = [
  'aurora', 'beacon', 'cosmos', 'delta', 'echo', 'flux',
  'galaxy', 'horizon', 'ion', 'jet', 'kinetic', 'light',
  'matrix', 'nexus', 'orbit', 'pulse', 'quasar', 'radius',
  'stream', 'time', 'unity', 'vector', 'wave', 'xray',
  'yield', 'zone'
];

export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}-${noun}-${number}`;
}

export function generateRandomUsername(): string {
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `user-${noun}-${number}`;
}

export function generateDisplayName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

export function sanitizeDisplayName(name: string): string {
  // Remove any non-alphanumeric characters except spaces and hyphens
  let sanitized = name.replace(/[^a-zA-Z0-9\s-]/g, '');
  // Replace multiple spaces with a single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  // Trim spaces from start and end
  sanitized = sanitized.trim();
  // Ensure the name is not empty and has a reasonable length
  if (!sanitized || sanitized.length < 2) {
    return generateDisplayName();
  }
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50).trim();
  }
  return sanitized;
}
