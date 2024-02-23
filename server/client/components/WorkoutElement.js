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

        console.log(this.activities.length);

        const activitiesList = this.shadowRoot.querySelector('#activitiesList');
        for (const activity of this.activities) {
            const activityItem = document.createElement('activity-element');
            activityItem.setAttribute('name', activity.name);
            activityItem.setAttribute('description', activity.description);
            activityItem.setAttribute('duration', activity.duration);
            activityItem.setAttribute('workoutId', this.getAttribute('id'));
            activityItem.setAttribute('activityId', activity.id);
            activitiesList.append(activityItem);
        }

        const deleteButton = this.shadowRoot.querySelector('#deleteWorkout');
        deleteButton.addEventListener('click', async () => {
            const status = await fetch(
                `/workout/${workoutId}`,
                {
                    method: 'DELETE',
                },
            );
            this.remove();
        });

        const addActivityToWorkoutButton = this.shadowRoot.querySelector('#addActivityToWorkout');
        addActivityToWorkoutButton.addEventListener('click', () => {

        });
    }

    get activities() {
        return this._activities;
    }

    set activities(value) {
        this._activities = value;
    }
}

customElements.define('workout-element', WorkoutElement);