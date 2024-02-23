class ActivityElement extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('activity-template');
        const templateContent = template.content;

        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#name').textContent = this.getAttribute('name');
        this.shadowRoot.querySelector('#description').textContent = this.getAttribute('description');
        this.shadowRoot.querySelector('#duration').textContent = this.formatDuration();

        this.setupDeleteButton();
    }

    formatDuration() {
        const durationAsDate = new Date(this.getAttribute('duration') * 1000)
        const minutes = String(durationAsDate.getMinutes()).padStart(2, '0');
        const seconds = String(durationAsDate.getSeconds()).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    setupDeleteButton() {
        const deleteActivity = this.shadowRoot.querySelector('#deleteActivity');
        deleteActivity.addEventListener('click', async () => {
            const activityId = this.getAttribute('activityId');

            try {
                const status = await fetch(
                    `/activity/${activityId}`,
                    {
                        method: 'DELETE',
                    },
                );

                this.remove();

                // Reconcile workouts that use this activity
                const workoutElements = document.querySelectorAll('workout-element');
                for (const workoutElement of workoutElements) {
                    const activities = workoutElement.activities;
                    for (const activity of activities) {
                        if (activity.id === activityId) {
                            workoutElement.removeActivity(activityId);
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });
    }
}

customElements.define('activity-element', ActivityElement);