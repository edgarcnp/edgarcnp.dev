<script>
	import { onDestroy, onMount } from "svelte";
    import {fade} from "svelte/transition";
    const textItems = ["Kerri Deo Rao.", "A Graphic Designer.", "A Photographer."];
    let currentIndex = 0;
    let interval;
    onMount(() => {
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % textItems.length;
        }, 6000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

</script>

{#if currentIndex ===0}
<span class="element fw-bold" in:fade={{ delay:200, duration: 1800, easing:'ease' }} >{textItems[currentIndex]}</span> 
{/if}
{#if currentIndex ===1}
<span class="element fw-bold" in:fade={{ delay:200, duration: 1800 }} >{textItems[currentIndex]}</span> 
{/if}
{#if currentIndex ===2}
<span class="element fw-bold" in:fade={{ delay:200, duration: 1800 }}>{textItems[currentIndex]}</span> 
{/if}
