import ToDo from "./todos";
import { List } from "./lists";

const displayController = (function () {
    const listContainer = document.querySelector("#list-container");
    const sidebar = document.querySelector("#sidebar");
    const modal = document.querySelector("#modal");
    const input = document.querySelector("#input");
    const addListButton = document.querySelector("#add-list-button");
    const saveButton = document.querySelector("#save-button");

    let lists = new Map(); // More efficient lookups than an array
    let currentAction = "";
    let currentList = null;

    function switchList(listName) {
        listContainer.textContent = "";

        if (listName === "all") {
            lists.forEach(list => {
                renderListUI(list, "small");
            });
            updateListView("all", "small"); // Reset everything to small mode
            return;
        }

        if (!lists.has(listName)) return;
        currentList = lists.get(listName);

        listContainer.textContent = "";
        renderListUI(currentList, "large");
        updateToDoDisplay();
    }

    function updateListView(listName, size) {
        const allLists = document.querySelectorAll(".list-card");
    
        // Reset all lists to small
        allLists.forEach(list => {
            listContainer.classList.add("list-container-small");
            listContainer.classList.remove("list-container-big");
            list.classList.remove("list-large");
            list.classList.add("list-small");
        });

        // If switching to a specific list, make it large
        if (size === "large") {
            const selectedList = [...allLists].find(list => list.dataset.listName === listName);
            if (selectedList) {
                listContainer.classList.remove("list-container-small");
                listContainer.classList.add("list-container-big");
                selectedList.classList.remove("list-small");
                selectedList.classList.add("list-large");
            }
        }
    }

    function openModal(action, listName = null) {
        currentAction = action;
        currentList = listName ? lists.get(listName) : null;
        modal.showModal();
        input.value = "";
    }

    function closeModal() {
        modal.close();
        input.value = "";
    }

    function createToDo(title) {
        if (!currentList) return;
        const newTodo = new ToDo(title);
        currentList.addToDo(newTodo);
        updateToDoDisplay();
    }

    function removeToDo(title) {
        if (!currentList) return;
        currentList.removeToDo(title);
        updateToDoDisplay();
    }

    function createList(name) {
        if (lists.has(name)) return;
        const newList = new List(name);
        lists.set(name, newList);
        updateSidebarDisplay(name);
    }

    function removeList(listName) {
        if (!lists.has(listName)) return;
        lists.delete(listName);

        document.querySelector(`[data-list-name="${listName}"]`)?.remove();
        document.querySelector(`#my-lists button[data-list-name="${listName}"]`)?.remove();
    }

    function updateToDoDisplay() {
        if (!currentList) return;
        const toDos = document.querySelector(".todos");
        toDos.textContent = "";

        currentList.items.forEach(todo => {
            const toDo = document.createElement("li");
            toDo.classList.add("todo");

            const item = document.createElement("p");
            item.textContent = todo.title;

            const removeButton = document.createElement("button");
            removeButton.classList.add("remove-todo-button");
            removeButton.textContent = "-";
            removeButton.addEventListener("click", () => removeToDo(todo.title));

            toDo.append(item, removeButton);
            toDos.appendChild(toDo);
        });
    }

    function renderListUI(list, size = "small") {
        const card = document.createElement("div");
        card.classList.add("list-card", size === "large" ? "list-large" : "list-small");
        card.dataset.listName = list.name;

        const cardHeading = document.createElement("h2");
        cardHeading.classList.add("list-card-heading");
        cardHeading.textContent = list.name;

        const addToDoButton = document.createElement("button");
        addToDoButton.classList.add("add-todo-button");
        addToDoButton.textContent = "+";
        addToDoButton.addEventListener("click", () => openModal("todo", list.name));

        const toDos = document.createElement("ul");
        toDos.classList.add("todos");

        const removeListButton = document.createElement("button");
        removeListButton.classList.add("remove-list-button");
        removeListButton.textContent = "-";
        removeListButton.addEventListener("click", () => removeList(list.name));

        cardHeading.appendChild(addToDoButton);
        card.append(cardHeading, toDos, removeListButton);
        listContainer.appendChild(card);

        if (size === "large") updateToDoDisplay();
    }

    function updateSidebarDisplay(title) {
        const myLists = document.querySelector("#my-lists");

        const li = document.createElement("li");
        const myList = document.createElement("button");
        myList.classList.add("my-list");
        myList.textContent = title;
        myList.dataset.listName = title;
        myList.addEventListener("click", () => switchList(title));

        li.appendChild(myList);
        myLists.appendChild(li);
    }

    function save() {
        const title = input.value;
        if (title) {
            if (currentAction === "list") {
                createList(title);
            } else if (currentAction === "todo") {
                createToDo(title);
            }
            closeModal();
        }
    }

    addListButton.addEventListener("click", () => openModal("list"));
    saveButton.addEventListener("click", save);

    // Ensure "All Lists" button is clickable and resets everything
    sidebar.addEventListener("click", event => {
        if (event.target.classList.contains("my-list")) {
            const listName = event.target.dataset.listName;
            switchList(listName);
        }
        if (event.target.id === "all-lists-button") {
            switchList("all");
        }
    });

    window.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    function init() {}

    return { init };
})();

export default displayController;