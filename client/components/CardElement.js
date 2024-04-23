import { deleteActivity, updateImage } from "../modules/NetworkingService.js";
import { StateManager } from "../modules/StateLib.js";
import { formatDuration } from "../modules/Utils.js";

class CardElement extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('card-template');
        const templateContent = template.content;

        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#name').textContent = this.getAttribute('name');
        this.shadowRoot.querySelector('#description').textContent = this.getAttribute('description');
        this.shadowRoot.querySelector('#duration').textContent = formatDuration(this.getAttribute('duration'));
        this.shadowRoot.querySelector('.cardImage>img').src = this.getAttribute('imageUrl');
    }

    addButtonToContextMenu(button) {
        const contextMenu = this.shadowRoot.querySelector('.contextMenu');
        contextMenu.appendChild(button);
    }
}

customElements.define('card-element', CardElement);