const handleGoogleCalendarConnect = async () => {
  setLoading(true);
  setError(null);
  setSuccess(false);
  
  try {
    if (!window.gapi) {
      throw new Error('Google API not loaded. Please refresh the page and try again.');
    }
    
    await initializeGoogleCalendar();
    await authenticateCalendar();
    setSuccess(true);
    setCalendarId('primary');
  } catch (err) {
    const errorMessage = err instanceof Error 
      ? `Google Calendar Error: ${err.message}`
      : 'Failed to connect to Google Calendar. Please check your internet connection and try again.';
    console.error('Calendar connection error:', err);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }