<script>
    let flag = true;
    // // Toggle Dark Function
    function toggleDark(){
        const body = document.body;
        if (flag) {
            body.setAttribute('data-bs-theme','dark');
        } else {
            body.setAttribute('data-bs-theme','');
        }
        flag = !flag;
    };

    function togleRtl(){
        const html = document.documentElement;
        if (html.getAttribute('dir') === 'rtl') {
            html.setAttribute('dir','ltr');
        } else {
            html.setAttribute('dir','rtl');
        }
    }

</script>


<!-- Dark and RTL Button -->
<div class="position-fixed start-0 translate-middle-y rounded-start-2 z-3" style="top: 244px;">
    <button on:click={toggleDark} type="button" class="dark-light-btn border-0 rounded-0 rounded-end-2 fs-5 d-flex align-items-center justify-content-center" id="dataTheme">
        {#if flag}
        <i class="mdi mdi-weather-night"></i> 
        {:else}
        <i class="mdi mdi-weather-sunny"></i>
        {/if}
    </button>
    <button on:click={togleRtl} type="button" class="rtl-ltr-btn border-0 rounded-0 rounded-end-2 fs-14 d-flex align-items-center justify-content-center text-cnter" id="theme_Rtl_Ltr">
        <span class="rtl">RTL</span><span class="ltr">LTR</span>
    </button>
</div>