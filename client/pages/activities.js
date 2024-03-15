import { createNewActivity } from "../modules/NetworkingService.js";
import { CompoundState, ReactiveContainer, StateManager } from "../modules/StateLib.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/activities.css">
<div id="newActivityHeader">
<button id="addActivity">Add Activity</button>
<form id="createActivityForm" autocomplete="off" hidden>
    <input type="text" id="activityName" placeholder="Activity name">
    <input type="text" id="activityDescription" placeholder="Activity description">
    <div>
        <input type="range" id="activityDuration" value="30" min="5" max="90" step="1" name="duration">
        <label for="duration">Duration: <span id="durationValue">30</span> seconds</label>
    </div>
    <input type="text" id="activityImageUrl" placeholder="Image URL">
    <button id="submitActivity" class="confirm-button">Create</button>
</form>
</div>
<div class="grid-container">

</div>
`

function updateActivityElement(element, activity) {
    element.setAttribute('activityId', activity.id);
    element.setAttribute('name', activity.name);
    element.setAttribute('description', activity.description);
    element.setAttribute('duration', activity.duration);
    element.setAttribute('imageUrl', activity.imageUrl);

    element.updateImage();
}

export function init(element) {
    element.innerHTML = content;

    const grid = element.querySelector('.grid-container');
    const activities = StateManager.activities;

    ReactiveContainer(activities, grid, (activity) => {
        const activityElement = document.createElement('activity-element');
        updateActivityElement(activityElement, activity);
        return activityElement;
    }, (child, activity) => {
        return child.getAttribute('activityId') === activity.id;
    });

    const addActivityButton = element.querySelector('#addActivity');
    const createActivityForm = element.querySelector('#createActivityForm');
    addActivityButton.addEventListener('click', () => {
        createActivityForm.hidden = !createActivityForm.hidden;
    });

    const submitActivity = element.querySelector('#submitActivity');
    submitActivity.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = createActivityForm.querySelector('#activityName').value;
        if (!name) return;
        const description = createActivityForm.querySelector('#activityDescription').value;
        if (!description) return;
        let duration = createActivityForm.querySelector('#activityDuration').value;
        duration = parseInt(duration);
        if (!duration) return;
        let imageUrl = createActivityForm.querySelector('#activityImageUrl').value;
        if (!imageUrl) imageUrl = 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/a93c82108677535.5fc3684e78f67.gif';

        const newActivity = await createNewActivity(name, description, duration, imageUrl);

        const newActivityData = await newActivity.json();
        StateManager.activities.value = [...StateManager.activities.value, newActivityData];
        createActivityForm.hidden = true;
    });
}