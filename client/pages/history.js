import { deleteHistoryEntry } from "../modules/NetworkingService.js";
import { CompoundState, ReactiveContainer, StateManager } from "../modules/StateLib.js";

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

    // Compound state that uses both the history and workouts state to add reactivity
    // for when for example the workout name is updated, all history entries are updated as well
    const historyState = new CompoundState((use) => {
        const history = use(StateManager.history);
        const workouts = use(StateManager.workouts);

        return history.map((entry) => {
            return {
                ...entry,
                workout: workouts.find((workout) => workout.id === entry.workoutId)
            }
        });
    });

    ReactiveContainer(historyState, grid, (entry) => {
        const entryElement = document.createElement('div')
        entryElement.classList.add('card')

        const workout = entry.workout;
        entryElement.innerHTML = `
            <div class="entry-header">
                <h3>${workout.name}</h3>
                <button class="cancel-button">
                    <img width="28px" src="./assets/Trash 64.png" alt="Delete"/>
                </button>
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