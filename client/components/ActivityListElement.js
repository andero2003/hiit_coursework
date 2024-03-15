import { removeActivityFromWorkout } from "../modules/NetworkingService.js";

class ActivityListElement extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('activity-list-element-template');
        const templateContent = template.content;

        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }

    formatDuration() {
        const durationAsDate = new Date(this.getAttribute('duration') * 1000)
        const minutes = String(durationAsDate.getMinutes()).padStart(2, '0');
        const seconds = String(durationAsDate.getSeconds()).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    connectedCallback() {
        const name = this.shadowRoot.querySelector('h3');
        name.textContent = this.getAttribute('name');

        const activityImage = this.shadowRoot.querySelector('#activityImage');
        activityImage.src = this.getAttribute('imageUrl');

        const timer = this.shadowRoot.querySelector('#timer p');
        timer.textContent = this.formatDuration();

        const deleteButton = this.shadowRoot.querySelector('#removeActivityFromWorkout');
        deleteButton.addEventListener('click', async () => {
            await removeActivityFromWorkout(this.getAttribute('workoutId'), this.getAttribute('identifier'));
        });
    }
}

customElements.define('activity-list-element', ActivityListElement);