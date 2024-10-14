<script>
    import {
        Container,
        Row,
        Col,
		Carousel,
		CarouselItem,
        Button
    } from '@sveltestrap/sveltestrap';
	import ClientsCarousel from '../Carousels/ClientsCarousel.svelte';
</script>

<section class="section bg-light" id="client">
    <Container>
        <Row class="justify-content-center">
            <Col lg="12">
                <div class="text-center">
                    <h2>Our <span class="fw-bold">Client</span></h2>
                    <p class="text-muted mx-auto section-subtitle mt-3">It is a long established fact that a reader will be of a page when established fact looking at its layout.</p>
                </div>
            </Col>
        </Row>
        <Row class="mt-4 pt-4">
            <Col lg="12">
                <ClientsCarousel/>
            </Col>
        </Row>
    </Container>
</section>