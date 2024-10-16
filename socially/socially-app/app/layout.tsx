import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
	title: "Socially",
	description: "Social Spotify Platform by Patrick Aigbogun, Oti",
};

interface children{
	children: React.ReactNode
}

export default function RootLayout({children}:children) {
	return (
		<html lang="en">
			<body>
				{children}
			</body>
		</html>
	);
}
