<script>
    import { Col, Container, Row } from "@sveltestrap/sveltestrap";

    //props
    let by = 0;
    
</script>
<svelte:window  bind:scrollY={by}/>

<section class="section header-bg-img" id="about" style="background-position-y:{by/1}px;">
    <Container>
        <Row class="align-items-center">
            <Col lg="6">
                <div class="mt-3">
                    <img src="assets/images/about.jpg" alt="" class="img-fluid mx-auto d-block img-thumbnail">
                </div>
            </Col>
            <Col lg="6">
                <div class="mt-3">
                    <h2 class="text-white"><span class="fw-bold">About</span> Me</h2>
                    <h4 class="mt-4 text-white">Hello! <span class="text-primary fw-bold">I'M Kerri Deo.</span></h4>
                    <p class="text-white mt-4">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. </p>
                    <p class="text-white mt-2">The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>
                    <p class="text-white mt-2">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>
                    <div>
                        <ul class="mb-0 about-social list-inline mt-4 text-white">
                            <li class="list-inline-item"><a href="#!"><i class="mdi mdi-dribbble"></i></a></li>
                            <li class="list-inline-item"><a href="#!"><i class="mdi mdi-facebook"></i></a></li>
                            <li class="list-inline-item"><a href="#!"><i class="mdi mdi-linkedin"></i></a></li>
                            <li class="list-inline-item"><a href="#!"><i class="mdi mdi-twitter"></i></a></li>
                        </ul>
                    </div>
                </div>
            </Col>
        </Row>
    </Container>
</section>