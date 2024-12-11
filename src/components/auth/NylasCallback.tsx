import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';

export const Callback = () => {
    const { profile } = useAuthStore();
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    // Extract 'code' query parameter and initiate token fetch
    const fetchCodeFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');

        if (authCode) {
            setCode(authCode); // Save the code in the state
            fetchAccessToken(authCode); // Fetch the access token
        } else {

            setError('Authorization code not found in the URL.');
            setLoading(false);
        }
    };

    // Fetch access token
    const fetchAccessToken = async (authCode: string) => {
        if (!profile?.id) {
            alert("Profile not found");
            setError("Profile not found");
            setLoading(false);
            return;
        }
        console.log('Authorization code:', authCode);
        try {
            const response = await fetch('https://kygjwkdbapvvqjaedxqv.supabase.co/functions/v1/make-a-req', {
                method: 'POST',
                body: JSON.stringify({
                    endpoint: "https://api.us.nylas.com/v3/connect/token",
                    body: {
                        client_id: import.meta.env.VITE_NYLAS_CLIENT_ID,
                        client_secret: import.meta.env.VITE_NYLAS_API_SECRET_KEY,
                        grant_type: 'authorization_code',
                        code: authCode,
                        redirect_uri: import.meta.env.VITE_CALLBACK_URL,
                        code_verifier: 'nylas',
                    },
                    headers: { "Content-Type": "application/json" },
                }),
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to exchange code for access token. Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Access Token:', data);

            if (data.grant_id) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        nylas_grant_id: data.grant_id,
                        nylas_grant_email: data.email,
                    })
                    .eq('id', profile?.id);
                if (updateError) {
                    setError(updateError.message);
                } else {
                    alert("Profile updated successfully!");
                    setSuccess(true)
                    setError('success')
                }
            }

            setLoading(false); // Finish loading after the token fetch
        } catch (error: any) {
            console.error('Error during token fetch:', error);
            setError(error.message || 'An error occurred while fetching the access token.');
            setLoading(false);
        }
    };

    // UseEffect to fetch the token on mount and handle URL changes
    useEffect(() => {
        fetchCodeFromUrl(); // Initialize fetch process

        // Re-check URL params on popstate (URL change)
        const handlePopState = () => fetchCodeFromUrl();
        window.addEventListener('popstate', handlePopState);

        return () => window.removeEventListener('popstate', handlePopState); // Cleanup on unmount
    }, []); // Run once on mount

    // Ensure token fetch happens after profile is available
    useEffect(() => {
        if (profile?.id && code) {
            fetchAccessToken(code);
        }
    }, [profile, code]); // Fetch token if profile or code changes

    // Handle loading state
    if (success) {

    }

    if (loading) {
        return <div>Loading...</div>;
    }

    // Handle error state
    if (error && error !== 'success') {
        return <div>Error: {error}</div>;
    }



    // Handle success state
    return (
        <div>

            {success ? (
                <h1>Authentication Successfull, You can close this tab. </h1>
            ) : (
                <>
                    <h1>OAuth Callback</h1>
                    <p>Authorization code received: {code}</p>
                </>)
            }

        </div>
    );
};
