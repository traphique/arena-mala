const _config = {
  supabaseUrl:  process.env.SUPABASE_URL         || '',
  supabaseKey:  process.env.SUPABASE_SERVICE_KEY || '',
  capeUrl:      process.env.CAPE_API_URL         || 'http://localhost:8000',
  capeKey:      process.env.CAPE_API_KEY         || '',
};

export function getRuntimeConfig() {
  return { ..._config };
}

export function setRuntimeConfig(overrides = {}) {
  if (overrides.supabaseUrl  !== undefined) _config.supabaseUrl  = overrides.supabaseUrl;
  if (overrides.supabaseKey  !== undefined) _config.supabaseKey  = overrides.supabaseKey;
  if (overrides.capeUrl      !== undefined) _config.capeUrl      = overrides.capeUrl;
  if (overrides.capeKey      !== undefined) _config.capeKey      = overrides.capeKey;
}
