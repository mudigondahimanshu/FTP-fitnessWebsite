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
  

  
  window.addEventListener('scroll', () => {
    const card = document.getElementById('nutritionCard');
    const cardTop = card.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (cardTop < windowHeight - 100) {
      card.classList.add('show');
    }
  });

  window.addEventListener('scroll', () => {
    const workoutCard = document.getElementById('workoutCard');
    const cardTop = workoutCard.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (cardTop < windowHeight - 100) {
      workoutCard.classList.add('show');
    }
  });

  window.addEventListener('scroll', () => {
    const card = document.getElementById('calendarCard');
    const cardTop = card.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (cardTop < windowHeight - 100) {
      card.classList.add('show');
    }
  });


  window.addEventListener('scroll', () => {
    const todoCard = document.getElementById('todoCard');
    const todoTop = todoCard.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (todoTop < windowHeight - 100) {
      todoCard.classList.add('show');
    }
  });

