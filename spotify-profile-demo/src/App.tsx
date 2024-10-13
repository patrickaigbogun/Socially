
import './App.css'



const clientId = '0a6559e6a10645af85095801965a40f5'; // Replace with your client id
const code = undefined;

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    populateUI(profile);
}

async function redirectToAuthCodeFlow(clientId: string) {
    // TODO: Redirect to Spotify authorization page
}

async function getAccessToken(clientId: string, code: string) {
  // TODO: Get access token for code
}

async function fetchProfile(token: string): Promise<any> {
    // TODO: Call Web API
}

function populateUI(profile: any) {
    // TODO: Update UI with profile data
}

function App() {
	

	return (
		<div>
			<h1>Display your Spotify profile data</h1>

			<section id="profile">
				<h2>Logged in as <span id="displayName"></span></h2>
				<span id="avatar"></span>
				<ul>
					<li>User ID: <span id="id"></span></li>
					<li>Email: <span id="email"></span></li>
					<li>Spotify URI: <a id="uri" href="#"></a></li>
					<li>Link: <a id="url" href="#"></a></li>
					<li>Profile Image: <span id="imgUrl"></span></li>
				</ul>
			</section>

		</div>
	)
}

export default App
