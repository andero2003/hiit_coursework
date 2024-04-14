import { deleteHistoryEntry } from "../modules/NetworkingService.js";
import { ReactiveContainer, StateManager } from "../modules/StateLib.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/history.css">
<div class="grid-container">
    <p>test</p>
</div>
`

export function init(element) {
    element.innerHTML = content;

    const grid = element.querySelector('.grid-container');
    const history = StateManager.history;
    const workouts = StateManager.workouts;

    ReactiveContainer(history, grid, (entry) => {
        const entryElement = document.createElement('div')
        entryElement.classList.add('card')
        
        const workout = workouts.value.find((workout) => workout.id === entry.workoutId);
        entryElement.innerHTML = `
            <div class="entry-header">
                <h3>${workout.name}</h3>
                <button class="cancel-button">Delete</button>
            </div>
            <div class="entry-content">
                <p>${entry.date}</p>
                <p>${entry.startTime} - ${entry.endTime}</p>
            </div>
        `;
        entryElement.setAttribute('entryId', entry.id);

        const deleteButton = entryElement.querySelector('.cancel-button');
        deleteButton.addEventListener('click', async () => {
            deleteHistoryEntry(entry.id);
        });

        return entryElement;
    }, (child, entry) => {
        return child.getAttribute('entryId') === entry.id;
    });
}