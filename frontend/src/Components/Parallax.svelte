<script>
  import { Parallax, ParallaxLayer } from 'svelte-parallax';

  const [red, green, blue] = [100, 100, 200];
  let backgroundColor = `rgb(${red}, ${green}, ${blue})`;

  const handleProgress = (progress) => {
    const p = 1 + progress;
    backgroundColor = `rgb(${red * p}, ${green * p}, ${blue * p})`;
  };
</script>

<Parallax sections={3} style="background-color: {backgroundColor}">
  <ParallaxLayer
    offset={1}
    onProgress={handleProgress}
  >
    <div>
      I'm changing the background color!
    </div>
  </ParallaxLayer>

</Parallax>