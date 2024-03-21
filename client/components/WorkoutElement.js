import { addActivityToWorkout, deleteWorkout } from "../modules/NetworkingService.js";
import { ReactiveContainer, StateManager } from "../modules/StateLib.js";
import { formatDuration } from "../modules/Utils.js";

class WorkoutElement extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('workout-template');
        const templateContent = template.content;

        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('h2').textContent = this.getAttribute('name');
        this.shadowRoot.querySelector('p').textContent = this.getAttribute('description') || 'No description';

        const deleteButton = this.shadowRoot.querySelector('#deleteWorkout');
        deleteButton.addEventListener('click', async () => {
            await deleteWorkout(this.getAttribute('workoutId'));
        });

        let displayAddList = false;
        const addActivityButton = this.shadowRoot.querySelector('#addActivityToWorkout');
        const addActivityList = this.shadowRoot.querySelector('#addActivityList');

        addActivityButton.addEventListener('click', () => {
            displayAddList = !displayAddList;

            addActivityList.style.display = displayAddList ? 'block' : 'none';
        });

        ReactiveContainer(StateManager.activities, addActivityList, (activity) => {
            const activityItem = document.createElement('button');
            activityItem.setAttribute('activityId', activity.id);
            activityItem.textContent = activity.name;
            activityItem.addEventListener('click', async () => {
                addActivityList.style.display = 'none';
                displayAddList = false;

                try {
                    const status = await addActivityToWorkout(this.getAttribute('workoutId'), activity.id);
                } catch (e) {
                    console.log(e);
                }
            });
            return activityItem;
        }, (child, activity) => {
            return child.getAttribute('activityId') === activity.id;
        });
    }

    addActivities(activities) {
        const activitiesList = this.shadowRoot.querySelector('#activitiesList');
        let totalDuration = 0;
        for (const { activity, identifier } of activities) {
            const activityItem = document.createElement('activity-list-element');
            activityItem.setAttribute('identifier', identifier);
            activityItem.setAttribute('activityId', activity.id);
            activityItem.setAttribute('workoutId', this.getAttribute('workoutId'));
            activityItem.setAttribute('name', activity.name);
            activityItem.setAttribute('imageUrl', activity.imageUrl);
            activityItem.setAttribute('duration', activity.duration);
            activitiesList.append(activityItem);

            totalDuration += activity.duration;
        }
        const duration = this.shadowRoot.querySelector('.duration h3');
        duration.textContent = `Total Duration: ${formatDuration(totalDuration)}`;

    }
}

customElements.define('workout-element', WorkoutElement);