<!-- index: 13, 15, 18 -->
<script>
	import NavbarCustom from '../Components/Layout/NavbarCustom.svelte';
	import About from '../Components/Layout/About.svelte';
	import Services from '../Components/Layout/Services.svelte';
	import Sta from '../Components/Layout/Sta.svelte';
	import Client from '../Components/Layout/Client.svelte';
	import Blog from '../Components/Layout/Blog.svelte';
	import Contact from '../Components/Layout/Contact.svelte';
	import Footer from '../Components/Layout/Footer.svelte';
	import Work from '../Components/Layout/Work.svelte';
	import Settings from '../Components/Layout/Settings.svelte';
	import Loader from '../Components/Layout/Loader.svelte';
</script>

<svelte:head>
	<link rel="stylesheet" href="assets/css/bootstrap.min.css" />
	<link rel="stylesheet" href="assets/css/materialdesignicons.min.css" />

	<!-- Animate Css -->
	<link rel="stylesheet" type="text/css" href="assets/css/animate.min.css" />

	<!-- Magnific-popup -->
	<link rel="stylesheet" type="text/css" href="assets/css/magnific-popup.css" />

	<!-- Mobirise icons Css -->
	<link rel="stylesheet" type="text/css" href="assets/css/mobiriseicons.css" />

	<link rel="stylesheet" href="assets/css/style.css" />
</svelte:head>

<!-- Loader -->
<!-- <Loader/> -->

<!-- Start Navbar -->
<NavbarCustom />

<!-- START HOME & ABOUT-->
<slot />

<!-- START SERVICES -->
<Services />

<!-- START CTA -->
<Sta />

<!-- START CLIENT -->
<Client />

<!-- START WORK -->
<Work />

<!-- START BLOG -->
<Blog />

<!-- START CONTACT -->
<Contact />
<!--START FOOTER-->
<Footer />

<!-- SETTINGS -->
<Settings />

<style global lang="scss">
	//@import '$lib/assets/css/style.css';
</style>
