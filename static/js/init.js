$(window).on('load', function() {
    // DOMPurify is used to sanitize the data-property attribute of the video element
    const videoElement = document.getElementById('video');
    const dataProperty = JSON.parse(DOMPurify.sanitize(videoElement.getAttribute('data-property')));
    videoElement.setAttribute('data-property', JSON.stringify(dataProperty));

    // Initialize the YouTube Background Video
    $(".youtube-bg").mb_YTPlayer();

    // Initialize the AOS animation
    AOS.init({
        easing: 'ease-in-out-cubic',
        duration: 1000,
    });

    // Initialize the Typed text animation in Home section
    new Typed('.element',{
        strings: [
            "Edgar Christian.",
            "A Computer Engineer."
        ],
        typeSpeed: 96,
        backSpeed: 69,
        backDelay: 2000,
        loop: true
    });

    // Get the typed text element in About Me section
    var aboutMe_typedText = document.querySelector('#element-about-me');

    // Initialize a new IntersectionObserver instance
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                // If the element is intersecting and a typed instance doesn't already exist, create a new instance of Typed
                if (!aboutMe_typedText.typed) {
                    aboutMe_typedText.typed = new Typed(aboutMe_typedText, {
                        strings: ['Edgar Christian.'],
                        typeSpeed: 69,
                        startDelay: 696,
                        onComplete: function(self) {
                            // Stop the typing animation
                            self.stop();
                            // Disable the cursor
                            document.querySelector('.typed-cursor').style.display = 'none';
                        }
                    });
                }
            } else {
                // If the element is not intersecting, reset the text content of the element and destroy the Typed instance if it exists
                aboutMe_typedText.textContent = '';
                if (aboutMe_typedText.typed) {
                    aboutMe_typedText.typed.destroy();
                    aboutMe_typedText.typed = null;
                }
            }
        });
    });

    // Observe the typed text element
    observer.observe(aboutMe_typedText);

    // Get current year for the footer
    const currentYear = new Date().getFullYear();
    document.getElementById("currentYear").innerHTML = String(currentYear);
});