// Get all the section elements
const sections = document.querySelectorAll("section");

// Capitalize the first letter of the section ID
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Listen for the scroll event
window.addEventListener("scroll", function() {
  // Get the current scroll position
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  // Find the section that is currently in the middle of the screen
  let currentSection;
  sections.forEach(function(section) {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    if (scrollPosition >= sectionTop - (sectionHeight / 2)) {
      currentSection = section;
    }
  });

  // Get the ID of the current section and capitalize its first letter
  const sectionId = currentSection.getAttribute("id");
  const capitalizedSectionId = capitalizeFirstLetter(sectionId);

  // Set the title of the document based on the section ID
  document.title = "Your Website | " + capitalizedSectionId;
});