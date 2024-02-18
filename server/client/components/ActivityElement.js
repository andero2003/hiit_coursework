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
        this.shadowRoot.querySelector('#duration').textContent = `${this.getAttribute('duration')} sec`;

        const deleteActivity = this.shadowRoot.querySelector('#deleteActivity');
        deleteActivity.addEventListener('click', async () => {
            const workoutId = this.getAttribute('workoutId');
            const activityId = this.getAttribute('activityId');
            const status = await fetch(
                `/workout/${workoutId}/activity/${activityId}`,
                {
                    method: 'DELETE',
                },
            );
            this.remove();
        });
    }
}

customElements.define('activity-element', ActivityElement);