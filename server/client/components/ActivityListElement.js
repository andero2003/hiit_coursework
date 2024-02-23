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
    }
}

customElements.define('activity-list-element', ActivityListElement);