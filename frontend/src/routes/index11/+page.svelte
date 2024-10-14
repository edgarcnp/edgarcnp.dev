<script>
	import { fly } from 'svelte/transition';
	import { Col, Container, Row } from '@sveltestrap/sveltestrap';
	import TypeWriter from '../../Components/TypeWriter.svelte';
	import About from '../../Components/Layout/About.svelte';
	// states for the page
	let by = 0;
	let show = false;
	setTimeout(() => {
		show = true;
	}, 1000);
</script>

<svelte:window bind:scrollY={by} />
{#if show}
	<section
		class="section header-bg-img h-100vh align-items-center d-flex"
		id="home"
		style="background-image: url('assets/images/header-bg.jpg');
            z-index: 0;
            background-attachment: scroll;
            background-position-y:{by / 1}px;"
		in:fly={{ delay: 250, duration: 1300, y: 700, opacity: 0.5 }}
	>
		<div class="bg-overlay"></div>
		<Container class="z-2">
			<Row class="justify-content-center">
				<Col lg="12">
					<div class="text-center header-content mx-auto">
						<h4 class="text-white first-title mb-4">Welcome</h4>
						<h1 class="header-name text-white text-capitalize mb-0">
							I'M
							<TypeWriter />
						</h1>
						<p class="text-white mx-auto header-desc mt-4">
							It is a long established fact that a reader will be of a page when established fact
							looking at its layout.
						</p>
						<div class="mt-4 pt-2">
							<a href="#!" class="btn btn-outline-white rounded-pill">Download Cv</a>
						</div>
					</div>
				</Col>
			</Row>
		</Container>
		<div class="scroll_down">
			<a href="#about" class="scroll">
				<i class="text-white"></i>
			</a>
		</div>
		<div class="curv-img">
			<svg
				version="1.1"
				id="Layer_1"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				x="0px"
				y="0px"
				viewBox="0 0 1920 238"
				enable-background="new 0 0 1920 238"
				xml:space="preserve"
			>
				<path fill="#fff" d="M0,0c0,0,888.955,518.735,1920,0c-0.5,149.535,0,238,0,238H0V0z" />
			</svg>
		</div>
	</section>
	<About />
{/if}
<!-- <style>
        #home {
            background-image: url('assets/images/header-bg.jpg');
            z-index: 0;
            background-attachment: scroll;
        }
    </style> -->
