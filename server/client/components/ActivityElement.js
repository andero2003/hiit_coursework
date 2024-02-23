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

        const durationAsDate = new Date(this.getAttribute('duration') * 1000)
        const minutes = String(durationAsDate.getMinutes()).padStart(2, '0');
        const seconds = String(durationAsDate.getSeconds()).padStart(2, '0');
     
        this.shadowRoot.querySelector('#duration').textContent = `${minutes}:${seconds}`;

        const deleteActivity = this.shadowRoot.querySelector('#deleteActivity');
        deleteActivity.addEventListener('click', async () => {
            const activityId = this.getAttribute('activityId');
            const status = await fetch(
                `/activity/${activityId}`,
                {
                    method: 'DELETE',
                },
            );
            this.remove();
        });
    }
}

customElements.define('activity-element', ActivityElement);