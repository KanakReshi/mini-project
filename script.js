document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const addBtn = document.getElementById("add-btn");
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    const categorySelect = document.getElementById("category-select");
    const prioritySelect = document.getElementById("priority-select");
    const progressFill = document.getElementById("progress-fill");
    const emptyState = document.getElementById("empty-state");
    const categoryBtns = document.querySelectorAll(".category-btn");
    const downloadBtn = document.getElementById("download-btn");
    const themeToggle = document.getElementById("checkbox");
  
    // Task data
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentFilter = "all";
  
    // Theme toggle functionality
    // Check for saved theme preference or use default (dark)
    const currentTheme = localStorage.getItem("theme") || "dark";
    
    // Apply the saved theme on initial load
    if (currentTheme === "light") {
      document.body.classList.add("light-theme");
      themeToggle.checked = true;
    }
    
    // Toggle theme when the checkbox changes
    themeToggle.addEventListener("change", function() {
      if (this.checked) {
        // Switch to light theme
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        
        // Add 3D animation effect for theme change
        const container = document.querySelector(".container");
        container.style.transform = "rotateX(15deg) rotateY(5deg)";
        setTimeout(() => {
          container.style.transform = "rotateX(5deg)";
        }, 300);
      } else {
        // Switch to dark theme
        document.body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        
        // Add 3D animation effect for theme change
        const container = document.querySelector(".container");
        container.style.transform = "rotateX(15deg) rotateY(-5deg)";
        setTimeout(() => {
          container.style.transform = "rotateX(5deg)";
        }, 300);
      }
    });
  
    // Event listeners
    addBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addTask();
    });
  
    // Filter buttons - FIXED: removed typo "rEach" and replaced with "forEach"
    categoryBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        categoryBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.category;
        renderTasks();
      });
    });
  
    // Add task function
    function addTask() {
      const taskText = taskInput.value.trim();
      if (!taskText) return;
  
      // Create new task object
      const newTask = {
        id: Date.now(),
        text: taskText,
        category: categorySelect.value,
        priority: prioritySelect.value,
        completed: false,
        createdAt: new Date().toISOString()
      };
  
      // Add to tasks array
      tasks.push(newTask);
      saveTasks();
      taskInput.value = "";
      
      // Render tasks and update progress
      renderTasks();
      updateProgress();
      
      // Add 3D effect to the added task
      setTimeout(() => {
        const lastTask = taskList.lastElementChild;
        if (lastTask) {
          lastTask.style.transform = "translateZ(25px) rotateX(10deg)";
          setTimeout(() => {
            lastTask.style.transform = "";
          }, 300);
        }
      }, 10);
    }
  
    // Toggle task completion
    function toggleTask(id) {
      tasks = tasks.map(task => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      
      saveTasks();
      renderTasks();
      updateProgress();
    }
  
    // Delete task
    function deleteTask(id) {
      const taskElement = document.querySelector(`[data-id="${id}"]`);
      
      // Apply delete animation
      taskElement.style.transform = "translateZ(-50px) rotateX(-30deg)";
      taskElement.style.opacity = "0";
      
      setTimeout(() => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateProgress();
      }, 300);
    }
  
    // Save tasks to localStorage
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  
    // Render tasks
    function renderTasks() {
      const filteredTasks = currentFilter === "all" 
        ? tasks 
        : tasks.filter(task => task.category === currentFilter);
      
      taskList.innerHTML = "";
      
      if (filteredTasks.length === 0) {
        emptyState.style.display = "flex";
      } else {
        emptyState.style.display = "none";
        
        filteredTasks.forEach((task, index) => {
          const li = document.createElement("li");
          li.className = `task-item priority-${task.priority}`;
          li.dataset.id = task.id;
          
          if (task.completed) {
            li.classList.add("done");
          }
          
          // Apply staggered animation delay
          li.style.animationDelay = `${index * 0.1}s`;
          
          li.innerHTML = `
            <div class="task-content">
              <span class="task-text">${task.text}</span>
              <div class="task-meta">
                <span class="task-category ${task.category}">${task.category}</span>
                <span class="task-date">${formatDate(task.createdAt)}</span>
              </div>
            </div>
            <div class="task-actions">
              <button class="done-btn">
                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
              </button>
              <button class="delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;
          
          // Event listeners for task actions
          li.querySelector(".done-btn").addEventListener("click", () => {
            toggleTask(task.id);
          });
          
          li.querySelector(".delete-btn").addEventListener("click", () => {
            deleteTask(task.id);
          });
          
          // Add 3D hover effect
          li.addEventListener("mousemove", handleMouseMove);
          li.addEventListener("mouseleave", handleMouseLeave);
          
          taskList.appendChild(li);
        });
      }
    }
  
    // Update progress bar
    function updateProgress() {
      if (tasks.length === 0) {
        progressFill.style.width = "0%";
        return;
      }
      
      const completedTasks = tasks.filter(task => task.completed).length;
      const percentage = (completedTasks / tasks.length) * 100;
      
      progressFill.style.width = `${percentage}%`;
    }
  
    // Format date helper
    function formatDate(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }
      
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  
    // 3D effect on mouse move
    function handleMouseMove(e) {
      const card = this;
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Calculate rotation based on mouse position relative to card center
      const rotateY = ((mouseX - cardCenterX) / (cardRect.width / 2)) * 5;
      const rotateX = -((mouseY - cardCenterY) / (cardRect.height / 2)) * 5;
      
      card.style.transform = `translateZ(15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  
    // Reset 3D effect on mouse leave
    function handleMouseLeave(e) {
      const card = this;
      if (card.classList.contains("done")) {
        card.style.transform = "translateZ(0px) rotateX(-2deg)";
      } else {
        card.style.transform = "translateZ(5px) rotateX(0deg)";
      }
    }
  
    // Toggle completed/incomplete task sections
    function toggleTasks(type) {
      const completedSection = document.getElementById("completed-tasks");
      const incompleteSection = document.getElementById("incomplete-tasks");
  
      if (type === "completed") {
        completedSection.style.display = completedSection.style.display === "none" ? "block" : "none";
        populateTaskList("completed");
      } else {
        incompleteSection.style.display = incompleteSection.style.display === "none" ? "block" : "none";
        populateTaskList("incomplete");
      }
    }
  
    // Populate filtered task lists
    function populateTaskList(type) {
      const taskList = document.getElementById("task-list").children;
      const completedList = document.getElementById("completed-list");
      const incompleteList = document.getElementById("incomplete-list");
  
      completedList.innerHTML = "";
      incompleteList.innerHTML = "";
  
      for (const task of taskList) {
        const clone = task.cloneNode(true);
        
        // Re-attach event listeners to cloned elements
        clone.querySelectorAll('button').forEach(btn => {
          const original = task.querySelector(`button.${btn.className.split(' ')[0]}`);
          const newBtn = btn;
          const originalClone = original.cloneNode(true);
          newBtn.replaceWith(originalClone);
        });
        
        if (task.classList.contains("done")) {
          completedList.appendChild(clone);
        } else {
          incompleteList.appendChild(clone);
        }
      }
    }
  
    // Download tasks as text file
    downloadBtn.addEventListener("click", function() {
      const tasks = document.querySelectorAll("#task-list .task-item");
      if (tasks.length === 0) {
        alert("No tasks to download!");
        return;
      }
  
      // Create a download options dialog
      const downloadType = confirm("Would you like to download as HTML (OK) or plain text (Cancel)?");
      
      if (downloadType) {
        // HTML format (with visual strikethrough)
        let content = `<!DOCTYPE html>
  <html>
  <head>
    <title>Your Task List</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
      h1 { color: #8a2be2; }
      .task { margin-bottom: 10px; }
      .completed { text-decoration: line-through; color: #888; }
      .priority-high { border-left: 4px solid #ff4081; padding-left: 10px; }
      .priority-medium { border-left: 4px solid #ffab00; padding-left: 10px; }
      .priority-low { border-left: 4px solid #00e676; padding-left: 10px; }
      .task-category { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin-right: 5px; }
      .work { background-color: rgba(30, 136, 229, 0.2); color: #1e88e5; }
      .personal { background-color: rgba(233, 30, 99, 0.2); color: #e91e63; }
      .shopping { background-color: rgba(76, 175, 80, 0.2); color: #4caf50; }
      .other { background-color: rgba(158, 158, 158, 0.2); color: #9e9e9e; }
    </style>
  </head>
  <body>
    <h1>Your Task List</h1>
    <div id="tasks">`;
  
        tasks.forEach(task => {
          const taskText = task.querySelector(".task-text").textContent;
          const isDone = task.classList.contains("done");
          const priority = task.className.match(/priority-([a-z]+)/)[1];
          const category = task.querySelector(".task-category").className.split(" ")[1];
          const categoryText = task.querySelector(".task-category").textContent;
          
          content += `
      <div class="task priority-${priority}">
        <span class="${isDone ? 'completed' : ''}">- ${taskText}</span>
        <span class="task-category ${category}">${categoryText}</span>
      </div>`;
        });
  
        content += `
    </div>
  </body>
  </html>`;
  
        const blob = new Blob([content], { type: "text/html" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "todo-list.html";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Plain text format with better formatting
        let content = "YOUR TASK LIST\n";
        content += "=============\n\n";
        
        // Group tasks by completion status
        let completedTasks = [];
        let incompleteTasks = [];
        
        tasks.forEach(task => {
          const taskText = task.querySelector(".task-text").textContent;
          const isDone = task.classList.contains("done");
          const priority = task.className.match(/priority-([a-z]+)/)[1];
          const category = task.querySelector(".task-category").textContent;
          
          const formattedTask = `- ${taskText} (${category}, ${priority} priority)`;
          
          if (isDone) {
            completedTasks.push(formattedTask);
          } else {
            incompleteTasks.push(formattedTask);
          }
        });
        
        // Add incomplete tasks
        content += "TO DO:\n";
        if (incompleteTasks.length > 0) {
          incompleteTasks.forEach(task => {
            content += task + "\n";
          });
        } else {
          content += "No incomplete tasks! Great job!\n";
        }
        
        // Add completed tasks
        content += "\nCOMPLETED:\n";
        if (completedTasks.length > 0) {
          completedTasks.forEach(task => {
            content += "[DONE] " + task + "\n";
          });
        } else {
          content += "No completed tasks yet.\n";
        }
        
        const blob = new Blob([content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "todo-list.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  
    // Setup event handlers for toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      if (btn.getAttribute('onclick')) {
        const fnName = btn.getAttribute('onclick').match(/toggleTasks\('(.+)'\)/)[1];
        btn.removeAttribute('onclick');
        btn.addEventListener('click', () => toggleTasks(fnName));
      }
    });
  
    // Initialize
    renderTasks();
    updateProgress();
  });