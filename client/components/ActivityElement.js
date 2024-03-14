import { deleteActivity, updateImage } from "../modules/NetworkingService.js";
import { StateManager } from "../modules/StateLib.js";

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
                await updateImage(activityId, newUrl);
            } catch (error) {
                console.log(error);
            }
        });
    }

    setupDeleteButton() {
        const deleteActivityButton = this.shadowRoot.querySelector('#deleteActivity');
        deleteActivityButton.addEventListener('click', async () => {
            const activityId = this.getAttribute('activityId');
            try {
                await deleteActivity(activityId);
            } catch (error) {
                console.log(error);
            }
        });
    }
}

customElements.define('activity-element', ActivityElement);