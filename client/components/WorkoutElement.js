import { CleanupManager } from "../modules/CleanupManager.js";

class WorkoutElement extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('workout-template');
        const templateContent = template.content;

        this.displayAddList = false;

        this.workoutInProgress = false;
        this.workoutPaused = false;
        this.workoutTime = 0;
        this.workoutMaid = new CleanupManager();

        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('h2').textContent = this.getAttribute('name');
        this.shadowRoot.querySelector('p').textContent = this.getAttribute('description') || 'No description';

        for (const activity of this.activities) {
            this.addActivityToList(activity);
        }

        const deleteButton = this.shadowRoot.querySelector('#deleteWorkout');
        deleteButton.addEventListener('click', async () => {
            const status = await fetch(
                `/workout/${this.getAttribute('id')}`,
                {
                    method: 'DELETE',
                },
            );
            this.remove();
        });

        const startWorkoutButton = this.shadowRoot.querySelector('#startWorkout');
        startWorkoutButton.addEventListener('click', () => {
            this.workoutInProgress = !this.workoutInProgress;
            if (this.workoutInProgress) {
                this.startWorkout();
            } else {
                this.stopWorkout();
            }
        });

        const pauseWorkoutButton = this.shadowRoot.querySelector('#pauseWorkout');
        pauseWorkoutButton.addEventListener('click', () => {
            this.pauseWorkout();
        });

        const addActivityList = this.shadowRoot.querySelector('#addActivityList');
        const addActivityToWorkoutButton = this.shadowRoot.querySelector('#addActivityToWorkout');
        addActivityToWorkoutButton.addEventListener('click', async () => {
            this.displayAddList = !this.displayAddList;
            addActivityList.style.display = this.displayAddList ? 'block' : 'none';
            const activities = await fetch('/activity');
            const activitiesData = await activities.json();
            this.updateAddActivitiesList(activitiesData);
        });
    }

    startWorkout() {
        const startWorkoutButton = this.shadowRoot.querySelector('#startWorkout');
        startWorkoutButton.classList.add('in-progress');
        startWorkoutButton.querySelector('img').src = './assets/Stop.png';
        const timer = this.shadowRoot.querySelector('#timer');
        timer.hidden = false;

        const pauseWorkoutButton = this.shadowRoot.querySelector('#pauseWorkout');
        pauseWorkoutButton.hidden = false;

        this.workoutMaid.addTask(() => {
            startWorkoutButton.classList.remove('in-progress');
            startWorkoutButton.querySelector('img').src = './assets/Play 64.png';
            timer.hidden = true;
            pauseWorkoutButton.querySelector('img').src = './assets/Pause.png';
            pauseWorkoutButton.hidden = true;
            this.workoutTime = 0;
            this.workoutPaused = false;
        });

        const interval = setInterval(() => {
            if (this.workoutPaused) return;
            this.workoutTime++;
            const elapsedTime = this.workoutTime;
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = ((elapsedTime % 60)).toFixed(0);
            timer.textContent = `Elapsed: ${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
        }, 1000);

        this.workoutMaid.addTask(() => clearInterval(interval));
    }

    pauseWorkout() {
        this.workoutPaused = !this.workoutPaused;
        const pauseWorkoutButton = this.shadowRoot.querySelector('#pauseWorkout');
        pauseWorkoutButton.querySelector('img').src = this.workoutPaused ? './assets/Play 64.png' : './assets/Pause.png';
    }

    stopWorkout() {
        this.workoutMaid.clean();
    }

    addActivityToList(activity) {
        const activitiesList = this.shadowRoot.querySelector('#activitiesList');
        const activityItem = document.createElement('activity-list-element');
        activityItem.setAttribute('activityId', activity.id);
        activityItem.setAttribute('name', `${activity.name}`);
        activityItem.setAttribute('imageUrl', activity.imageUrl);
        activityItem.setAttribute('duration', activity.duration);
        activityItem.setAttribute('identifier', activity.identifier);

        activitiesList.append(activityItem);

        const deleteButton = activityItem.shadowRoot.querySelector('#removeActivityFromWorkout');
        deleteButton.addEventListener('click', async () => {
            const status = await fetch(
                `/workout/${this.getAttribute('id')}/activity/${activity.identifier}`,
                {
                    method: 'DELETE',
                },

            );
            this.activities = this.activities.filter((a) => a.id !== activity.id);
            activityItem.remove();
        });
    }

    removeActivity(activityId) {
        const activitiesList = this.shadowRoot.querySelector('#activitiesList');
        for (const activity of activitiesList.children) {
            if (activity.getAttribute('activityId') === activityId) {
                activity.remove();
            }
        }
    }

    updateAddActivitiesList(allActivities) {
        const addActivityList = this.shadowRoot.querySelector('#addActivityList');
        addActivityList.replaceChildren();
        for (const activity of allActivities) {
            const activityItem = document.createElement('button')
            activityItem.textContent = activity.name;
            addActivityList.append(activityItem);

            activityItem.addEventListener('click', async () => {
                addActivityList.style.display = 'none';
                this.displayAddList = false;

                try {
                    const status = await fetch(
                        `/workout/${this.getAttribute('id')}/activity/${activity.id}`,
                        {
                            method: 'POST',
                        },
                    );
                    const data = await status.json();
                    activity.order = data;

                    this.activities = [...this.activities, activity];
                    this.addActivityToList(activity);
                } catch (e) {
                    console.log(e);
                }
            });
        }
    }

    get activities() {
        return this._activities;
    }

    set activities(value) {
        this._activities = value;
    }
}

customElements.define('workout-element', WorkoutElement);