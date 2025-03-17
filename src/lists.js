import ToDo from "./todos";

export class List {
    constructor(name) {
        this.name = name;
        this.items = [];
    }

    addToDo(toDo) {
        this.items.push(toDo);
    }

    removeToDo(index) {
        this.items.splice(index, 1);
    }
}