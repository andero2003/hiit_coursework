// inspired by the idea of "Maid" classes from Roblox game development

export class CleanupManager {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        if (typeof task === 'object' && typeof task.dispose === 'function') {
            this.tasks.push(task.dispose);
        } else {
            this.tasks.push(task);
        }
    }

    clean() {
        for (const dispose of this.tasks) {
            dispose();
        }
    }
}