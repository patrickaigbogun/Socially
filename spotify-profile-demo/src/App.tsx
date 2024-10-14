import React, { useEffect, useState } from 'react';

export interface UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean;
    };
    external_urls: { spotify: string; };
    followers: { href: string; total: number; };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

export interface Image {
    url: string;
    height: number;
    width: number;
}

const clientId = '0a6559e6a10645af85095801965a40f5'; // Replace with your client id


const App: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
            redirectToAuthCodeFlow(clientId);
        } else {
            getAccessToken(clientId, code).then(async (accessToken) => {
                const profileData = await fetchProfile(accessToken);
                setProfile(profileData);
				console.log("Access Token:", accessToken);
            }).catch(err => {
                console.error("Error during authentication flow: ", err);
            });
        }
    }, []);

    async function redirectToAuthCodeFlow(clientId: string) {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);
		localStorage.setItem("verifier", verifier); // Ensure this line is executed

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", "http://localhost:5173/callback");
        params.append("scope", "user-read-private user-read-email");
        params.append("code_challenge_method", "S256");
        params.append("code_challenge", challenge);

        document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    function generateCodeVerifier(length: number) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    async function generateCodeChallenge(codeVerifier: string) {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

	async function getAccessToken(clientId: string, code: string): Promise<string> {
		const verifier = localStorage.getItem("verifier");
		const params = new URLSearchParams();
		params.append("client_id", clientId);
		params.append("grant_type", "authorization_code");
		params.append("code", code);
		params.append("redirect_uri", "http://localhost:5173/callback");
		params.append("code_verifier", verifier!);
	
		console.log("Token Request Params:", {
			clientId,
			code,
			redirect_uri: "http://localhost:5173/callback",
			code_verifier: verifier
		});
	
		const result = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params
		});
	
		if (!result.ok) {
			const errorData = await result.json();
			throw new Error(`Failed to get access token: ${errorData.error} - ${errorData.error_description}`);
		}
	
		const { access_token } = await result.json();
		return access_token;
	}
	

	async function fetchProfile(token: string): Promise<UserProfile> {
		console.log("Fetching profile with access token:", token); // Log the token
	
		const result = await fetch("https://api.spotify.com/v1/me", {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` }
		});
	
		if (!result.ok) {
			const errorData = await result.json();
			throw new Error(`Failed to fetch profile: ${errorData.error} - ${errorData.error_description}`);
		}
	
		return await result.json();
	}
	
	

    return (
    <div>
        <h1>Display your Spotify profile data</h1>
        {profile ? (
            <section id="profile">
                <h2>Logged in as <span>{profile.display_name}</span></h2>
                <span id="avatar">
                    {profile.images && profile.images.length > 0 ? (
                        <img src={profile.images[0].url} alt="Profile" style={{ width: 200, height: 200 }} />
                    ) : (
                        <span>No Profile Image Available</span>
                    )}
                </span>
                <ul>
                    <li>User ID: <span>{profile.id}</span></li>
                    <li>Email: <span>{profile.email}</span></li>
                    <li>Spotify URI: <a href={profile.external_urls.spotify}>{profile.uri}</a></li>
                    <li>Link: <a href={profile.href}>{profile.href}</a></li>
                    <li>Profile Image: <span>{profile.images?.[0]?.url ?? '(no profile image)'}</span></li>
                </ul>
            </section>
        ) : (
            <p>Loading...</p>
        )}
    </div>
);

	
}

export default App;
