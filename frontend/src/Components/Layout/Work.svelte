<script>
    import { Row } from "@sveltestrap/sveltestrap";
    const works = [
        {
            categories: ["webdesign", "wordpress"],
            imageSrc: "../../assets/images/works/1.jpg",
            alt: "work-img",
            title: "Project Title"
        },
        {
            categories: ["work", "webdesign", "seo"],
            imageSrc: "../../assets/images/works/2.jpg",
            alt: "work-img",
            title: "Project Title"
        },
        {
            categories: ["seo","wordpress"],
            imageSrc: "../../assets/images/works/3.jpg",
            alt: "work-img",
            title: "Project Title"
        },
        {
            categories: ["wordpress", "work", "webdesign"],
            imageSrc: "../../assets/images/works/4.jpg",
            alt: "work-img",
            title: "Project Title"
        },
        {
            categories: ["seo", "webdesign"],
            imageSrc: "../../assets/images/works/5.jpg",
            alt: "work-img",
            title: "Project Title"
        },
        {
            categories: ["devlopment","webdesign"],
            imageSrc: "../../assets/images/works/6.jpg",
            alt: "work-img",
            title: "Project Title"
        }
    ];
    let activeLink = "all";
    
</script>


<section class="section text-center" id="portfolio">
    <div class="container">
        <Row class="row justify-content-center">
            <div class="col-lg-12">
                <div class="text-center">
                    <h2>Our <span class="fw-bold">Works</span></h2>
                    <p class="text-muted mx-auto section-subtitle mt-3">It is a long established fact that a reader will be of a page when established fact looking at its layout.</p>
                </div>
            </div>
        </Row>
        <div class="row mt-5 ">
            <ul class="col list-unstyled list-inline mb-0 text-uppercase work_menu" id="menu-filter">
                <li class="list-inline-item"><a on:click={()=>activeLink = "all"} class={`${activeLink=== "all" ? "active" : ""}`} href="#!">All</a></li>
                <li class="list-inline-item"><a on:click={()=>activeLink = "seo"} class={`${activeLink=== "seo" ? "active" : ""}`} href="#!">Seo</a></li>
                <li class="list-inline-item"><a on:click={()=>activeLink = "webdesign"} class={`${activeLink=== "webdesign" ? "active" : ""}`} href="#!">Webdesign</a></li>
                <li class="list-inline-item"><a on:click={()=>activeLink = "work"} class={`${activeLink=== "work" ? "active" : ""}`} href="#!">Work</a></li>
                <li class="list-inline-item"><a on:click={()=>activeLink = "wordpress"} class={`${activeLink=== "wordpress" ? "active" : ""}`} href="#!">Wordpress</a></li>
            </ul>
        </div>
    </div>
    <div class="container">
        <div class="row mt-4 work-filter">
            {#each works as work (work.categories)}
                <div class={`col-lg-4 work_item ${!(work.categories.includes(activeLink) || activeLink == "all") ? "hide d-none" : ""}`}>
                    <a href="assets/images/works/1.jpg" class="img-zoom">
                        <div class="work_box">
                            <div class="work_img">
                                <img src="assets/images/works/1.jpg" class="img-fluid mx-auto d-block rounded" alt="work-img">
                            </div>
                            <div class="work_detail">
                                <p class="mb-2">Category</p>
                                <h4 class="mb-0">Project Title</h4>
                            </div>
                        </div>
                    </a>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .work_item {
        opacity: 1;
        transition: all 1s ease-in-out;
    }
    .work_item.hide {
        opacity: 0;
    }
</style>