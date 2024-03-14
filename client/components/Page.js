class Page extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('page-element-template');
        const templateContent = template.content;

        this.attachShadow({ mode: 'open' }).appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
        const title = this.shadowRoot.querySelector('header h1');
        title.textContent = this.getAttribute('title');
    }
}

customElements.define('page-element', Page);