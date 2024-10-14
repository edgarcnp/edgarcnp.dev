<script>
	import { fly, fade } from 'svelte/transition';
	import { Col, Container, Row } from '@sveltestrap/sveltestrap';
	import FadeAnim from '../../Components/FadeAnim.svelte';
	import About from '../../Components/Layout/About.svelte';

	// states for the page
	let show = false;
	let by = 0;
</script>

<svelte:window bind:scrollY={by} />
<section class="section header-bg-img h-100vh align-items-center d-flex" id="home">
	<div class="bg-overlay"></div>
	<Container class="z-2">
		<Row class="justify-content-center">
			<Col lg="12">
				<div class="text-center header-content mx-auto">
					<h4 class="text-white first-title mb-4">Welcome</h4>
					<h1 class="header-name text-white text-capitalize mb-0">
						I'M
						<FadeAnim />
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
	{#if by > 100}
		<div class="scroll_down" in:fly={{ delay: 0, duration: 1300, y: 100, opacity: 0.5 }} out:fade>
			<a href="#about" class="scroll">
				<i class="text-white"></i>
			</a>
		</div>
	{/if}
</section>
<About />
