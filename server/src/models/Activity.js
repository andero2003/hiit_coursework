import { v4 as uuidv4 } from 'uuid';

class Activity {
    constructor(name, duration, description = 'N/A', difficulty = 3) {
        this.id = uuidv4();
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.difficulty = difficulty;
    }
}