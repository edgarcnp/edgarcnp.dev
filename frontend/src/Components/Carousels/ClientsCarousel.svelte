<script>
	import { onMount } from "svelte";
	import { register } from "swiper/element/bundle";
	register();
    import 'swiper/css';
    const items =[
        {
            src:"assets/images/testi/testi-1.jpg",
            qoute:"It is a long established fact that a reader will be of a page when established fact looking at its layout.",
            user:"Ebony verty",
            company:"Envato"
        },
        {
            src:"assets/images/testi/testi-2.jpg",
            qoute:"It is a long established fact that a reader will be of a page when established fact looking at its layout.",
            user:"Ebony verty",
            company:"Envato"
        },
        {
            src:"assets/images/testi/testi-3.jpg",
            qoute:"It is a long established fact that a reader will be of a page when established fact looking at its layout.",
            user:"Ebony verty",
            company:"Envato"
        },
    ]

	onMount(() => {
		const swiperEl = document.getElementById("sponser-swiper2");
		// swiper parameters
		// we need to create object with all parameters
		const swiperParams = {
			slidesPerView: 1,
			loop: true,
            pagination: {
                clickable: true,
            },
            // autoplay: {
            //     duration: 3000
            // },
		};
		// now we need to assign all parameters to Swiper element
		Object.assign(swiperEl, swiperParams);
		// and now initialize it
		swiperEl.initialize();
	});
</script>

<swiper-container id="sponser-swiper2" init="false" pagination="true" dir="ltr">
	{#each items as item, i}
    <swiper-slide>
        <div class="text-center testi_boxes mx-auto">
            <div class="tam_testi_icon text-primary">
                <i class="mbri-quote-left"></i>
            </div>
            <div class="mt-2">
                <div class="img_testi">
                    <img src={item.src} alt="" class="mx-auto img-thumbnail img-fluid rounded-circle">
                </div>
                <p class="client_review fst-italic mt-4 text-center text-muted">" {item.qoute}"</p>
                <p class="client_name text-center mb-0 mt-4">- {item.user}, <span class="fw-bold">{item.company}</span></p>
            </div>
        </div>
    </swiper-slide>
    {/each}
</swiper-container>



