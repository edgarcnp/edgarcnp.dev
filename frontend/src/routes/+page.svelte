<script>
	import { Col, Container, Row } from '@sveltestrap/sveltestrap';

	import About from '../Components/Layout/About.svelte';
</script>

<svelte:head>
	<!-- Youtube Background -->
	<link rel="stylesheet" href="assets/css/ytplayer.css" />
</svelte:head>

<section class="section header-bg-img h-100vh align-items-center d-flex" id="home">
	<div class="bg-overlay"></div>
	<video id="video" muted="muted" autoplay="true" loop="true" disablepictureinpicture="true">
		<source src="assets/Office Team Meeting.mp4" type="video/mp4" />
	</video>
	<Container class="z-2">
		<Row class="justify-content-center">
			<Col lg="12">
				<div class="text-center header-content mx-auto">
					<h4 class="text-white first-title mb-4">Welcome</h4>
					<h1 class="header-name text-white text-capitalize mb-0">
						<span class="fw-bold">I'M Kerri Deo.</span>
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
</section>

<About />

<style>
	#home {
		background: transparent;
	}
	#video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: -1;
		background: none;
	}
</style>
