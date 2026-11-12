
// =====================================
// TASK MANAGER - JAVASCRIPT
// =====================================

// 1. Get HTML elements
const taskInput = document.getElementById("task-input");
const categoryInput = document.getElementById("category");
const dueDateInput = document.getElementById("due-date");
const addButton = document.getElementById("add-task");
const tasksContainer = document.getElementById("tasks-container");


// 2. Load saved tasks from localStorage
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("myTasks")) || [];
} catch (error) {
    tasks = [];
}


// 3. Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}


// 4. Display tasks on the screen
function displayTasks(filter = "all") {

    tasksContainer.innerHTML = "";

    let filteredTasks = tasks;

    if (filter === "active") {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (filter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        tasksContainer.textContent = "No tasks found. Add a new task!";
        return;
    }

    filteredTasks.forEach(task => {

        const card = document.createElement("div");
        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        const title = document.createElement("h3");
        title.textContent = task.name;

        const category = document.createElement("p");
        category.textContent = "Category: " + task.category;

        const date = document.createElement("p");
        date.textContent = task.dueDate
            ? "Due date: " + task.dueDate
            : "No due date";

        const status = document.createElement("p");
        status.textContent = task.completed
            ? "Status: Completed"
            : "Status: Active";

        const completeButton = document.createElement("button");
        completeButton.textContent = task.completed
            ? "Mark Active"
            : "Complete";

        completeButton.dataset.action = "complete";
        completeButton.dataset.id = task.id;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.dataset.action = "edit";
        editButton.dataset.id = task.id;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = task.id;

        card.append(
            title,
            category,
            date,
            status,
            completeButton,
            editButton,
            deleteButton
        );

        tasksContainer.appendChild(card);

    });

}


// 5. Add a new task
function addTask() {

    const taskName = taskInput.value.trim();

    if (taskName === "") {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        name: taskName,
        category: categoryInput.value,
        dueDate: dueDateInput.value,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    displayTasks();

    taskInput.value = "";
    dueDateInput.value = "";
    categoryInput.value = "Work";

}


// 6. Add button event
addButton.addEventListener("click", addTask);


// Allow Enter key to add a task
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});


// 7. Edit, Delete and Complete tasks
tasksContainer.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const taskId = button.dataset.id;
    const action = button.dataset.action;

    const task = tasks.find(item => item.id === taskId);

    if (!task) return;


    // Edit task
    if (action === "edit") {

        const newName = prompt("Edit your task:", task.name);

        if (newName === null) return;

        if (newName.trim() === "") {
            alert("Task name cannot be empty!");
            return;
        }

        task.name = newName.trim();

    }


    // Delete task
    if (action === "delete") {

        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) return;

        tasks = tasks.filter(item => item.id !== taskId);

    }


    // Complete or reactivate task
    if (action === "complete") {

        task.completed = !task.completed;

    }

    saveTasks();

    const activeFilter =
        document.querySelector(".filters button.active");

    displayTasks(activeFilter
        ? activeFilter.dataset.filter
        : "all");

});


// 8. Filter tasks
const filterButtons = document.querySelectorAll(
    ".filters button"
);

filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        displayTasks(this.dataset.filter);

    });

});


// 9. Display saved tasks when the page opens
document.querySelector(
    '.filters button[data-filter="all"]'
).classList.add("active");

displayTasks();
