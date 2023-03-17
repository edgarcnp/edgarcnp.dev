// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Get all the section elements
  const sections = document.querySelectorAll("section");

  // Capitalize the first letter of the section ID
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Listen for the scroll event
  window.addEventListener("scroll", function() {
    // Find the section that is currently in the middle of the screen
    let currentSection;
    let closestDistance = Number.MAX_VALUE;
    sections.forEach(function(section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionCenter = sectionTop + sectionHeight / 2;
      const distanceToViewportCenter = Math.abs(sectionCenter - window.innerHeight / 2 - window.scrollY);
      if (distanceToViewportCenter < closestDistance) {
        closestDistance = distanceToViewportCenter;
        currentSection = section;
      }
    });

    // Get the ID of the current section and capitalize its first letter
    const sectionId = currentSection.getAttribute("id");
    const capitalizedSectionId = capitalizeFirstLetter(sectionId);

    // Set the title of the document based on the section ID
    document.title = "EdgarCNP.Dev | " + capitalizedSectionId;
  });
});
