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
        this.shadowRoot.querySelector('#activityImage img').src = this.getAttribute('imageUrl');

        this.setupDeleteButton();
        this.setupEditImageButton();
    }

    formatDuration() {
        const durationAsDate = new Date(this.getAttribute('duration') * 1000)
        const minutes = String(durationAsDate.getMinutes()).padStart(2, '0');
        const seconds = String(durationAsDate.getSeconds()).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    setupEditImageButton() {
        const activityImageDiv = this.shadowRoot.querySelector('#activityImage');
        const urlInput = activityImageDiv.querySelector('input');
        const confirmEditButton = activityImageDiv.querySelector('#confirmEdit');

        const editImageButton = this.shadowRoot.querySelector('#editImage');
        editImageButton.addEventListener('click', () => {
            confirmEditButton.hidden = !confirmEditButton.hidden;
            urlInput.hidden = !urlInput.hidden;
        });

        confirmEditButton.addEventListener('click', async () => {
            const activityId = this.getAttribute('activityId');
            const newUrl = urlInput.value;
            if (!newUrl || newUrl.length == 0) return;

            try {
                const status = await fetch(
                    `/activity/${activityId}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            imageUrl: newUrl,
                        }),
                    },
                );

                if (status.ok) {
                    const image = this.shadowRoot.querySelector('#activityImage img');
                    image.src = newUrl;
                    confirmEditButton.hidden = true;
                    urlInput.hidden = true;
                }
            } catch (error) {
                console.log(error);
            }
        });
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