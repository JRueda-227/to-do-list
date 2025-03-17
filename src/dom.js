import ToDo from "./todos";
import { List } from "./lists";

const displayController = (function () {
    const listContainer = document.querySelector('#list-container');
    const sidebar = document.querySelector('#sidebar');

    const myLists = document.querySelector('#my-lists');
    const addListButton = document.querySelector('#add-list-btn');

    const listModal = document.querySelector('#modal');
    const toDoModal = document.querySelector('#todo-modal');

    const input = document.querySelector('#input');
    const toDoInput = document.querySelector('#todo-title');
    const toDoDescription = document.querySelector('#description');
    const toDoDueDate = document.querySelector('#due-date');
    const selectedPriority = document.querySelector('#selected-priority');
    const priorityOptions = document.querySelectorAll('.priority-option');
    const priorityInput = document.querySelector('#priority');

    const saveButtons = document.querySelectorAll('.save-btn');
    const removeToDoButton = document.querySelector('#remove-todo-btn');

    let lists = new Map();

    let currentList = null;
    let currentToDo = null;
    let currentAction = '';

    function switchList(listName) {
        if (listName === 'all') {
            listContainer.textContent = '';
            lists.forEach(list => {
                currentList = list;
                renderListUI(list);
                updateToDoDisplay();
            });
        }

        if (!lists.has(listName)) return;
        currentList = lists.get(listName);
        listContainer.textContent = '';
        
        renderListUI(currentList);
        updateToDoDisplay();
    }

    function openModal(action, listName = null, toDoTitle = null) {
        currentAction = action;
        currentList = listName ? lists.get(listName) : null;

        console.log(toDoTitle)

        if (action === 'list') {
            input.value = '';
            listModal.showModal();
        }
        if (action === 'todo') {
            toDoInput.value = '';
            toDoDescription.value = '';
            toDoDueDate.value = '';
            toDoModal.showModal();
        }
        if (action === 'edit-todo') {
            currentToDo = currentList.items.find(todo => todo.title === toDoTitle);

            toDoInput.value = currentToDo.title;
            toDoDescription.value = currentToDo.description?.trim() ? currentToDo.description : "";
            toDoDueDate.value = currentToDo.dueDate;
            selectedPriority.style.backgroundColor = currentToDo.priority;
            removeToDoButton.style.display = "block";
            toDoModal.showModal();
        }
    }

    function closeModal() {
        listModal.close();
        toDoModal.close();
        removeToDoButton.style.display = "none";
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {month: 'numeric', day: 'numeric'};
        return date.toLocaleDateString(undefined, options);
    }

    function createToDo(title, description = '', dueDate = '', priority = '') {
        if (!currentList) return;

        const newToDo = new ToDo(title)
            .setDescription(description)
            .setDueDate(dueDate)
            .setPriority(priority);

        currentList.addToDo(newToDo);
        updateToDoDisplay();

        saveListsToLocalStorage();
    }

    function removeTodo(title) {
        if (!currentList) return;

        currentList.items = currentList.items.filter(item => item.title !== title);
        updateToDoDisplay();

        saveListsToLocalStorage();
    }

    function createList(name) {
        if (lists.has(name)) return;

        const newList = new List(name);
        lists.set(name, newList);

        updateSidebarDisplay(newList.name);
        switchList('all');

        saveListsToLocalStorage();
    }

    function removeList(li, listName) {
        const listCard = document.querySelector(`.list-card[data-list-name="${listName}"]`);

        lists.delete(listName);
        myLists.removeChild(li);
        listContainer.removeChild(listCard);

        saveListsToLocalStorage();
    }

    function updateToDoDisplay() {
        if (!currentList) return;

        const listCard = document.querySelector(`.list-card[data-list-name="${currentList.name}"]`);
        const toDoList = listCard.querySelector('.list-card-todos');
        toDoList.textContent = '';
    
        currentList.items.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.classList.add('todo-item');

            const toDoLeft = document.createElement('div');
            toDoLeft.classList.add('todo-left');

            const toDoTitle = document.createElement('p');
            toDoTitle.textContent = todo.title;

            const toDoPriority = document.createElement('button');
            toDoPriority.classList.add('priority-btn2')
            toDoPriority.style.backgroundColor = todo.priority;

            const toDoRight = document.createElement('div');
            toDoRight.classList.add('todo-right');

            const editToDoButton = document.createElement('button');
            editToDoButton.textContent = ':';
            editToDoButton.classList.add('edit-todo-btn');

            const dueDate = document.createElement('time');
            if (todo.dueDate) {
                dueDate.textContent = formatDate(todo.dueDate);
                dueDate.setAttribute('datetime', todo.dueDate);
                dueDate.classList.add('todo-due-date');
            }

            toDoLeft.append(toDoPriority, toDoTitle);
            toDoRight.append(dueDate, editToDoButton);
            todoItem.append(toDoLeft, toDoRight);
            toDoList.appendChild(todoItem);
        });
    }

    function renderListUI(list) {
        const card = document.createElement('div');
        card.classList.add('list-card');
        card.dataset.listName = list.name;
        
        const cardHeading = document.createElement('div');
        cardHeading.classList.add('list-card-heading');

        const cardTitle = document.createElement('h2');
        cardTitle.textContent = list.name;

        const addToDoButton = document.createElement('button');
        addToDoButton.textContent = '+';
        addToDoButton.classList.add('add-todo-btn');
        addToDoButton.addEventListener('click', () => openModal('todo', list.name));

        const toDoList = document.createElement('ul');
        toDoList.classList.add('list-card-todos');

        cardHeading.append(cardTitle, addToDoButton)
        card.append(cardHeading, toDoList);
        listContainer.appendChild(card);
    }
  
    function updateSidebarDisplay(listName) {
        const li = document.createElement('li');
        li.classList.add('sidebar-item');
        li.dataset.listName = listName;

        const list = document.createElement('button');
        list.textContent = listName;
        list.classList.add('list');
        list.dataset.listName = listName;

        const removeListButton = document.createElement('button');
        removeListButton.textContent = '-';
        removeListButton.classList.add('remove-list-btn');

        li.addEventListener('mouseover', () => {
            removeListButton.style.display = "block";
        })
        li.addEventListener('mouseleave', () => {
            removeListButton.style.display = "none";
        })
        removeListButton.addEventListener('click', () => {
            removeList(li, listName);
        });

        li.append(list, removeListButton);
        myLists.appendChild(li);
    }

    function save() {
        const name = input.value;

        const title = toDoInput.value;
        const description = toDoDescription.value;
        const dueDate = toDoDueDate.value;
        const priority = priorityInput.value;

        if (currentAction === 'list') {
            createList(name);
        }
        else if (currentAction === 'todo') {
            createToDo(title, description, dueDate, priority);
        }
        else if(currentAction === 'edit-todo') {
            currentToDo.title = title;
            currentToDo.description = description;
            currentToDo.dueDate = dueDate;
            currentToDo.priority = priority;
            updateToDoDisplay();
        }
        closeModal();
    }

    function saveListsToLocalStorage() {
        const listsArray = Array.from(lists.values()).map(list => ({
            name: list.name,
            items: list.items.map(todo => ({
                title: todo.title,
                description: todo.description || '',
                dueDate: todo.dueDate || '',
                priority: todo.priority || ''
            }))
        }));
    
        localStorage.setItem("lists", JSON.stringify(listsArray)); // ✅ Store clean JSON
    }

    function loadListsFromLocalStorage() {
        const storedLists = JSON.parse(localStorage.getItem("lists"));
        if (!storedLists || !Array.isArray(storedLists)) return;
    
        lists.clear(); // Clear existing lists
    
        storedLists.forEach(({ name, items }) => {
            const newList = new List(name);
            newList.items = (items || []).map(todoData => {
                const todo = new ToDo(todoData.title);
                return todo
                    .setDescription(todoData.description || '')
                    .setDueDate(todoData.dueDate || '')
                    .setPriority(todoData.priority || '');
            });
    
            lists.set(name, newList);
            updateSidebarDisplay(name); // ✅ Re-render sidebar
        });
    
        if (lists.size > 0) {
            const firstListName = lists.keys().next().value;
            switchList(firstListName); // ✅ Ensure todos are displayed
        }
    }
    
    // ✅ Ensure lists are loaded when the page loads
    document.addEventListener("DOMContentLoaded", loadListsFromLocalStorage);

listContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-todo-btn")) {
        const todoItem = event.target.closest(".todo-item"); // Get the to-do item
        const listCard = todoItem.closest(".list-card"); // Find the parent list card
        const listName = listCard.dataset.listName; // Get list name from dataset

        if (!lists.has(listName)) {
            console.error("Error: List not found in Map.");
            return;
        }

        const todoTitle = todoItem.querySelector("p").textContent.trim();
        openModal('edit-todo', listName, todoTitle); // Pass correct listName
    }
});

    sidebar.addEventListener("click", event => {
        if (event.target.id === "all-lists-btn") {
            switchList('all');
        }
        if (event.target.classList.contains("list")) {
            const listName = event.target.dataset.listName;
            switchList(listName);
        }
    });

    addListButton.addEventListener('click', () => openModal('list'));

    saveButtons.forEach(button => {
        button.addEventListener('click', save);
    });

    removeToDoButton.addEventListener('click', () => {
        removeTodo(currentToDo.title);
    });

    priorityOptions.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = this.getAttribute('data-color');
            selectedPriority.style.backgroundColor = selectedColor;
            priorityInput.value = selectedColor;
        })
    })

    window.addEventListener('click', event => {
        if (event.target === listModal) closeModal();
        if (event.target === toDoModal) closeModal();
    });

    function init() {}

    return { init } 
})();

export default displayController;