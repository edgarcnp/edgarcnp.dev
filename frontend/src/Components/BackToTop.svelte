
<style>
    .showBTT{
        display: block;
    }
</style>

<script>
    import { onMount } from 'svelte';

    let isScrolled=false;

    onMount(() => {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                isScrolled = true;
            } else{
                isScrolled = false;
            }
        })
    })
</script>

<!-- Back To Top -->
<a href="#home" class={`back_top ${isScrolled ? "showBTT" : ""}`} > <i class="mdi mdi-chevron-up"> </i> </a>
