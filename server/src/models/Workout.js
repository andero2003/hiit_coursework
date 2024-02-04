import { v4 as uuidv4 } from 'uuid';

class Workout {
    constructor(name) {
        this.id = uuidv4();
        this.name = name;
        this.activities = [];
        this.history = [];
    }

    addActivity(activity) {
        this.activities.push(activity);
    }

    start() {
        return new ActiveWorkout(this.activities, (workoutData) => {
            this.history.push();
        });
    }
}