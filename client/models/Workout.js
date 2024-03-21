export class Workout {
    constructor(id, name, description) {
        this.id = id
        this.name = name;
        this.description = description;
        this.activities = [];
    }

    addActivity(activity) {
        this.activities.push(activity);
    }

    get duration() {
        return this.activities.reduce((acc, { activity }) => acc + activity.duration, 0);
    }
}