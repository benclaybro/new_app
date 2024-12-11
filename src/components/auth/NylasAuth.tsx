

const NylasAuth = () => {
    const handleLogin = async () => {
      const clientId = import.meta.env.VITE_NYLAS_CLIENT_ID;
      const callbackUri = import.meta.env.VITE_CALLBACK_URL;
  
      const authUrl = `https://api.us.nylas.com/v3/connect/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        callbackUri
      )}`;
  
      window.open(authUrl, '_blank');
    };
  
    return (
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Connect with Nylas
      </button>
    );
  };
  
  export default NylasAuth;
  