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
  







  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById('todo-input');
    const btn = document.getElementById('todo-add-btn');
    const list = document.getElementById('todo-list');

    // Load tasks from localStorage
    const saved = JSON.parse(localStorage.getItem('todo-list')) || [];
    saved.forEach(item => addTask(item.text, item.completed));

    // Add task
    btn.addEventListener('click', () => {
      const task = input.value.trim();
      if (task) {
        addTask(task, false);
        input.value = '';
      }
    });

    // Add task element
    function addTask(text, completed) {
      const li = document.createElement('li');
      li.className = 'todo-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = completed;

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = text;
      if (completed) span.classList.add('completed');

      const delBtn = document.createElement('button');
      delBtn.className = 'todo-delete';
      delBtn.innerHTML = '&times;';

      // Events
      checkbox.addEventListener('change', () => {
        span.classList.toggle('completed');
        saveTasks();
      });

      delBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(delBtn);
      list.appendChild(li);
      saveTasks();
    }

    // Save all tasks
    function saveTasks() {
      const tasks = [];
      document.querySelectorAll('.todo-item').forEach(item => {
        const text = item.querySelector('.todo-text').textContent;
        const completed = item.querySelector('input[type="checkbox"]').checked;
        tasks.push({ text, completed });
      });
      localStorage.setItem('todo-list', JSON.stringify(tasks));
    }
  });

