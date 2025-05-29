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
  

    function openPDF() {
    window.open("Nutritional_Food_Table.pdf", "_blank");
  }







    function calculateBMI(event) {
    event.preventDefault(); // prevent page reload

    const weight = parseFloat(document.getElementById("bmi-weight").value);
    const heightCm = parseFloat(document.getElementById("bmi-height").value);

    if (isNaN(weight) || isNaN(heightCm) || weight <= 0 || heightCm <= 0) {
      alert("Please enter valid weight and height values.");
      return;
    }

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const rounded = bmi.toFixed(2);

    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";

    alert(`Your BMI is ${rounded} (${category}).`);
  }