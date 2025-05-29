function setupHoverDropdown(id) {
    const dropdown = document.getElementById(id);
    const menu = dropdown.querySelector(".dropdown-menu");
    let timeout;
  
    dropdown.addEventListener("mouseenter", () => {
      clearTimeout(timeout);
      menu.style.display = "block";
    });
  
    dropdown.addEventListener("mouseleave", () => {
      timeout = setTimeout(() => {
        menu.style.display = "none";
      }, 50);
    });
  
    menu.addEventListener("mouseenter", () => {
      clearTimeout(timeout);
    });
  
    menu.addEventListener("mouseleave", () => {
      timeout = setTimeout(() => {
        menu.style.display = "none";
      }, 50);
    });
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    setupHoverDropdown("nutrition-dropdown");
    setupHoverDropdown("workouts-dropdown");
    setupHoverDropdown("author-dropdown");
  });
  






  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.exercise-card').forEach(card => {
      card.classList.add("show");
    });
  });