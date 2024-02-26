class ActivityListElement extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('activity-list-element-template');
        const templateContent = template.content;

        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
        const name = this.shadowRoot.querySelector('h3');
        name.textContent = this.getAttribute('name');

        const activityImage = this.shadowRoot.querySelector('#activityImage');
        activityImage.src = this.getAttribute('imageUrl');
    }
}

customElements.define('activity-list-element', ActivityListElement);