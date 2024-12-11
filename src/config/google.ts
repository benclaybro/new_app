const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  scopes: REQUIRED_SCOPES
};

export function validateGoogleConfig() {
  const missingKeys = [];
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!clientId) {
    missingKeys.push('VITE_GOOGLE_CLIENT_ID');
  }
  if (!apiKey) {
    missingKeys.push('VITE_GOOGLE_API_KEY');
  }
  
  if (missingKeys.length > 0) {
    const message = `Missing required Google configuration: ${missingKeys.join(', ')}. ` +
      'Please ensure these environment variables are set in your deployment settings.';
    console.error(message);
    throw new Error(message);
  }
  
  // Validate format of Client ID and API Key
  if (clientId && !clientId.endsWith('.apps.googleusercontent.com')) {
    throw new Error('Invalid Google Client ID format. Please check your configuration.');
  }

  if (apiKey && apiKey.length < 20) {
    throw new Error('Invalid Google API Key format. Please check your configuration.');
  }

  return true;
}