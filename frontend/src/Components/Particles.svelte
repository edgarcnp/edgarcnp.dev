<script>
	import { particlesInit } from '@tsparticles/svelte';
	import { onMount } from 'svelte';
	//import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
	import { loadSlim } from '@tsparticles/slim'; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.

	let ParticlesComponent;

	onMount(async () => {
		const module = await import('@tsparticles/svelte');

		ParticlesComponent = module.default;
	});


	let particlesConfig = {
			particlesInit: {
				selector: "#home",
			},
			particles: {
				number: {
					value: 250,
					density: {
						enable: true,
						width: 1920,
						height: 1080,
					},
				},

				color: {
					value: "#ffffff",
				},
				shape: {
					type: "circle",
					options:{
						stroke: {
							width: 5,
							color: "#ffffff",
						},
						polygon: {
							nbSides: 5,
						},
						image: {
							src: "img/github.svg",
							width: 100,
							height: 100,
						},
					}
				},
				opacity: {
					value: {
						min:0.1,
						max:0.5
					},
					animation: {
						startValue: "random",
						enable: true,
						speed: 1,
						opacityMin: 0.1,
						sync: false,
					},
				},
				size: {
					value: {
						min:2,
						max:5
					},
					random: true,
					animation: {
						enable: false,
						speed: 30,
						sizeMin: 1,
						sync: false,
					},
				},
				links: {
					enable: true,
					distance: 150,
					color: "#ffffff",
					opacity: 0.4,
					frequency: 1,
				},
				move: {
					enable: true,
					speed: 3,
					direction: "none",
					random: false,
					straight: false,
					outMode: "out",
					attract: {
						enable: false,
						rotateX: 600,
						rotateY: 1200,
					},
				},
			},
			interactivity: {
				detectsOn: "canvas",
				events: {
					onHover: {
						enable: true,
						mode: "repulse",
					},
					parallax: {
						enable: true,
						speed: 20,
					},
				},
				mode: {
					particles: {
						distance:	200,
						duration:	0.4,
						factor:100,
						speed:1,
						maxSpeed:50
					}
				}
			},
			detectRetina: true,
			// background:{
			// 	color: "#b61924",
			// 	image: "",
			// 	position: "50% 50%",
			// 	repeat: "no-repeat",
			// 	size: "cover",
			// },
				configDemo: {
					hideCard: false,
					
				},
		}

	let onParticlesLoaded = (event) => {
		const particlesContainer = event.detail.particles;
		// you can use particlesContainer to call all the Container class
		// (from the core library) methods like play, pause, refresh, start, stop
	};

	void particlesInit(async (engine) => {
		await loadSlim(engine);
	});
</script>

<svelte:component
	this="{ParticlesComponent}"
	id="tsparticles"
	class="position-absolute"
	style={{
            position: "absolute",
          }}
	options="{particlesConfig}"
	on:particlesLoaded="{onParticlesLoaded}"
/>

