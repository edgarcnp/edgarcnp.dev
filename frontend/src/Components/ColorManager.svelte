<script>

    const setTheme = (color) => {
        const html = document.documentElement;
        html.setAttribute('data-color', color);
        
        // close the color switcher
        var colorSwitcher = document.getElementById("color-switcher");
		var dirValue = document.documentElement.getAttribute("dir");
        if (dirValue === 'rtl') {
            colorSwitcher.style.right = '-189px';
        } else {
            colorSwitcher.style.left = '-189px';
        }
    };


    function togleColorSwitcher(e) {
		e.preventDefault();
		var colorSwitcher = document.getElementById("color-switcher");
		var dirValue = document.documentElement.getAttribute("dir");
		if (dirValue === 'rtl') {
            if (colorSwitcher.style.right === '-189px') {
            colorSwitcher.style.right = '0px';
            } else {
            colorSwitcher.style.right = '-189px';
            }
        } else {
            if (colorSwitcher.style.left === '-189px') {
            colorSwitcher.style.left = '0px';
            } else {
            colorSwitcher.style.left = '-189px';
            }
        }
	}
</script>

<div id="color-switcher" class="bg-body">
    <div>
        <h3 class="fw-bold text-center text-body">Select your color</h3>
        <ul class="pattern">
            <li>
                <a class="color1 active" data-color="red" href="#!" on:click={() => setTheme("red")}></a>
            </li>
            <li>
                <a class="color2" href="#!" data-color="sky" on:click={() => setTheme("blue")}></a>
            </li>
            <li>
                <a class="color3" href="#!" data-color="green" on:click={() => setTheme("green")}></a>
            </li>
            <li>
                <a class="color4" href="#!" data-color="red" on:click={() => setTheme("purple")}></a>
            </li>
            <li>
                <a class="color5" href="#!" data-color="skyblue" on:click={() => setTheme("skyblue")}></a>
            </li>
            <li>
                <a class="color6" href="#!" data-color="yellow" on:click={() => setTheme("yellow")}></a>
            </li>
        </ul>
    </div>
    <div class="bottom" role="button" tabindex="0" on:click={togleColorSwitcher} on:keydown={togleColorSwitcher}>
        <a href="#!" class="settings"><i class="mdi mdi-palette"></i></a>
    </div>
</div>

