// 환경 변수 검증 및 설정
export const validateEnv = () => {
  const requiredEnvVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }

  return true;
};

export const getEnvConfig = () => {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://gmujzyyvdllvapbphtnw.supabase.co',
    supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0',
    youtubeApiKey: import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyCI4u_TwWS0PENQOUtPS-409lk5hIHA5YA',
    siteUrl: import.meta.env.VITE_SITE_URL || 'https://moim-vote.vercel.app',
  };
};
