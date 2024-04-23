export function formatDuration(dur) {
    const durationAsDate = new Date(dur * 1000)
    const minutes = String(durationAsDate.getMinutes()).padStart(2, '0');
    const seconds = String(durationAsDate.getSeconds()).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

export function createIconButton(icon, onClick, className) {
    const button = document.createElement('button');
    if (className) {
        button.classList.add(className);
    }
    button.innerHTML = `
        <img width="28px" src="${icon}" alt="${icon}"/>
    `;
    button.addEventListener('click', onClick);
    return button;
}