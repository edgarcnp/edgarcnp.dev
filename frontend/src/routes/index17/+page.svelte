<script>
	import { Col, Container, Row } from '@sveltestrap/sveltestrap';

	import About from '../../Components/Layout/About.svelte';
</script>

<section class="section header-bg-img h-100vh align-items-center d-flex" id="home">
	<div class="bg-overlay"></div>
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

<svg viewBox="0 0 1320 240">
	<path
		fill-opacity="1"
		d="
	M0,192
	C120,120,220,120,330,192
	C440,260,550,260,660,192
	C770,120,880,120,990,192
	C1100,260,1210,260,1320,192

	L1320 240
	L0 240
	"
		fill="#000"
	/>
</svg>

<About />

<style>
	svg {
		transform: rotate(180deg);
		top: -1px;
	}

	svg path {
		animation: pathAnim2 7s;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}
	svg path:nth-child(2) {
		animation-delay: 1s;
	}

	@keyframes pathAnim2 {
		0% {
			d: path(
				'M0,192 C120,120,220,120,330,192 C440,260,550,260,660,192 C770,120,880,120,990,192 C1100,260,1210,260,1320,192 L1320 240 L0 240 '
			);
		}
		50% {
			d: path(
				'M0,192 C120,260,220,260,330,192 C440,120,550,120,660,192 C770,260,880,260,990,192 C1100,120,1210,120,1320,192 L1320 240 L0 240 '
			);
		}
		100% {
			d: path(
				'M0,192 C120,120,220,120,330,192 C440,260,550,260,660,192 C770,120,880,120,990,192 C1100,260,1210,260,1320,192 L1320 240 L0 240 '
			);
		}
	}
</style>
