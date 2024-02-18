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

        const workoutId = this.getAttribute('id');
        const addActivity = this.shadowRoot.querySelector('#addActivity');
        addActivity.addEventListener('click', this.addActivity.bind(this));

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
    }

    async addActivity() {
        const name = prompt('Enter activity name');
        if (!name) return;
        const description = prompt('Enter activity description');
        if (!description) return;
        let duration = prompt('Enter activity duration');
        duration = parseInt(duration);
        console.log(duration);
        if (!duration) return;

        const workoutId = this.getAttribute('id');
        const newActivity = await fetch(
            `/workout/${workoutId}/activity`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description, duration }),
            },
        );

        console.log(newActivity);

        const newActivityData = await newActivity.json();
        console.log(newActivityData);

        const activityItem = document.createElement('activity-element');
        activityItem.setAttribute('name', newActivityData.name);
        activityItem.setAttribute('description', newActivityData.description);
        activityItem.setAttribute('duration', newActivityData.duration);
        activityItem.setAttribute('workoutId', this.getAttribute('id'));
        activityItem.setAttribute('activityId', newActivityData.id);

        const activitiesList = this.shadowRoot.querySelector('#activitiesList');
        activitiesList.append(activityItem);
    }

    get activities() {
        return this._activities;
    }

    set activities(value) {
        this._activities = value;
    }
}

customElements.define('workout-element', WorkoutElement);