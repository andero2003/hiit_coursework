import { StateForEach, StateManager } from "../modules/StateLib.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/activities.css">
<div class="grid-container">

</div>
`

function updateActivityElement(element, activity) {
    element.setAttribute('activityId', activity.id);
    element.setAttribute('name', activity.name);
    element.setAttribute('description', activity.description);
    element.setAttribute('duration', activity.duration);
    element.setAttribute('imageUrl', activity.imageUrl);
}

export function init(element) {
    element.innerHTML = content;

    const grid = element.querySelector('.grid-container');

    // Inject reactive state
    StateForEach(StateManager.activities, (activity, index) => {
        const elements = grid.querySelectorAll('activity-element');
        if (elements[index]) {
            updateActivityElement(elements[index], activity);
        } else {
            const element = document.createElement('activity-element');
            updateActivityElement(element, activity);
            grid.append(element);
        }
    });
}