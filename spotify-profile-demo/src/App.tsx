import React, { useEffect, useState } from 'react';

export interface UserProfile {
	country: string;
	display_name: string;
	email: string;
	explicit_content: {
		filter_enabled: boolean;
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
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");

		const fetchData = async () => {
			if (!code) {
				await redirectToAuthCodeFlow(clientId);
			} else {
				try {
					const tokens = await getAccessToken(clientId, code);
					setAccessToken(tokens.access_token);
					const profileData = await fetchProfile(tokens.access_token);
					setProfile(profileData);
					console.log("Access Token:", tokens.access_token);
				} catch (err) {
					console.error("Error during authentication flow: ", err);
				}
			}
		};

		fetchData();
	}, []);

	async function redirectToAuthCodeFlow(clientId: string) {
		const verifier = generateCodeVerifier(128);
		const challenge = await generateCodeChallenge(verifier);
		sessionStorage.setItem("verifier", verifier); // Ensure this line is executed

		const params = new URLSearchParams();
		params.append("client_id", clientId);
		params.append("response_type", "code");
		params.append("redirect_uri", "http://localhost:5173/callback");
		params.append("scope", "user-read-private user-read-email");
		params.append("code_challenge_method", "S256");
		params.append("code_challenge", challenge);

		window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
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

	async function getAccessToken(clientId: string, code: string): Promise<{ access_token: string; refresh_token: string }> {
		const verifier = sessionStorage.getItem("verifier");
		if (!verifier) {
			throw new Error("Verifier not found in localStorage.");
		}

		const params = new URLSearchParams();
		params.append("client_id", clientId);
		params.append("grant_type", "authorization_code");
		params.append("code", code);
		params.append("redirect_uri", "http://localhost:5173/callback");
		params.append("code_verifier", verifier);

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

		const { access_token, refresh_token } = await result.json();

		// Store the tokens in local storage
		sessionStorage.setItem('access_token', access_token);
		sessionStorage.setItem('refresh_token', refresh_token);

		return { access_token, refresh_token };
	}

	async function getRefreshToken() {
		const refreshToken = sessionStorage.getItem('refresh_token');
		const url = "https://accounts.spotify.com/api/token";

		const payload = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken!,
				client_id: clientId
			}),
		};

		const response = await fetch(url, payload);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Failed to refresh token: ${errorData.error} - ${errorData.error_description}`);
		}

		const data = await response.json();
		sessionStorage.setItem('access_token', data.access_token);

		return data.access_token;
	}

	async function fetchProfile(token: string): Promise<UserProfile> {
		console.log("Fetching profile with access token:", token);

		const result = await fetch("https://api.spotify.com/v1/me", {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!result.ok) {
			const errorData = await result.json();
			if (errorData.error === "invalid_token") {
				console.log("Access token expired, refreshing...");
				const newAccessToken = await getRefreshToken();
				return fetchProfile(newAccessToken); // Retry fetching profile with new token
			}
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
};

export default App;
