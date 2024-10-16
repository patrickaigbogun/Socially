



export default function Home() {
	return (
		<>
			<section className="bg-black space-y-9 h-screen font-bold text-white p-4" >
				<h1 className=" text-5xl font-extrabold w-[80%] mx-auto text-center" >
					Welcome to the demo for Socially
				</h1>

				<section className=" flex flex-col w-[80%] mx-auto gap-y-6 " >
				<p className="text-center" >
					Authorise your Socially with a click of a button to begin your social Spotify journey
					
				</p>
				<button onClick={Authorise} className="border border-[1.5px] p-2 rounded-lg justify-center w-fit mx-auto hover:border-green-400 hover:scale-105 transition ease-in-out " >
					Authorise with Spotify
				</button>
				</section>
			</section>
		</>
	);
}
