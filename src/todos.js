export default class ToDo {
    constructor(title) {
        this.title = title;
        this.description = '';
        this.dueDate = '';
    }

    setDescription(description) {
        if (description?.trim()) {
            this.description = description;
        }
        return this;
    }

    setDueDate(dueDate) {
        if (dueDate?.trim()) {
            this.dueDate = dueDate;
        }
        return this;
    }

    setPriority(priority) {
        if (priority?.trim()) {
            this.priority = priority;
        }
        return this;
    }
}