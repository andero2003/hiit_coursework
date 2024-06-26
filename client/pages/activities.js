import { createNewActivity, deleteActivity, updateActivityData } from "../modules/NetworkingService.js";
import { CompoundState, ReactiveContainer, StateManager } from "../modules/StateLib.js";
import { createIconButton } from "../modules/Utils.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/activities.css">
<div class="form-header">
    <button id="addActivity">Add Activity</button>
    <dialog>
        <h2>Create a new activity</h2>
        <form autocomplete="off">
            <input type="text" id="activityName" placeholder="Activity name">
            <input type="text" id="activityDescription" placeholder="Activity description">
            <input type="text" id="activityImageUrl" placeholder="Image URL">
            <input type="range" id="activityDuration" value="30" min="5" max="90" step="1" name="duration">
            <label for="duration">Duration: <span id="durationValue">30</span> seconds</label>
            <div class="rowButtons">
                <button id="submitActivity" class="confirm-button">Create</button>
                <button id="cancelActivity" class="cancel-button">Cancel</button>
            </div>
        </form>
    </dialog>
</div>
<div class="grid-container">

</div>
`

let editingActivityId = null;

function updateActivityElement(element, activity, dialog) {
    element.setAttribute('name', activity.name);
    element.setAttribute('activityId', activity.id);
    element.setAttribute('description', activity.description);
    element.setAttribute('duration', activity.duration);
    element.setAttribute('imageUrl', activity.imageUrl);

    const editButton = createIconButton('./assets/Pencil 64.png', (e) => {
        const form = dialog.querySelector('form');
        form.querySelector('#activityName').value = activity.name;
        form.querySelector('#activityDescription').value = activity.description;
        form.querySelector('#activityImageUrl').value = activity.imageUrl;
        form.querySelector('#activityDuration').value = activity.duration;
        form.querySelector('#durationValue').textContent = activity.duration;

        editingActivityId = activity.id;
        dialog.querySelector('h2').textContent = 'Edit activity';
        dialog.showModal();
    });
    element.addButtonToContextMenu(editButton);

    const deleteButton = createIconButton('./assets/Trash 64.png', async (e) => {
        await deleteActivity(activity.id);
    }, 'cancel-button');
    element.addButtonToContextMenu(deleteButton);
}

export function init(element) {
    element.innerHTML = content;

    const grid = element.querySelector('.grid-container');
    const activities = StateManager.activities;
    const dialog = element.querySelector('dialog');

    // this will populate the grid with activities and update dynamically when the activities list changes
    ReactiveContainer(activities, grid, (activity) => {
        const activityElement = document.createElement('card-element');
        updateActivityElement(activityElement, activity, dialog);
        return activityElement;
    }, (child, activity) => {
        return child.getAttribute('activityId') === activity.id;
    });

    const addActivityButton = element.querySelector('#addActivity');

    const createActivityForm = element.querySelector('form');
    addActivityButton.addEventListener('click', () => {
        editingActivityId = null;
        dialog.querySelector('h2').textContent = 'Create a new activity';
        dialog.showModal();
    });

    const durationSlider = createActivityForm.querySelector('#activityDuration');
    const durationOutput = createActivityForm.querySelector('#durationValue');
    durationSlider.addEventListener('input', () => {
        durationOutput.textContent = durationSlider.value;
    });

    const cancelActivity = element.querySelector('#cancelActivity');
    cancelActivity.addEventListener('click', (e) => {
        e.preventDefault();
        dialog.close();
    });

    const submitActivity = element.querySelector('#submitActivity');
    submitActivity.addEventListener('click', async (e) => {
        e.preventDefault(); // since the button is inside a form, we need to prevent the default form submission (page reload)
        const name = createActivityForm.querySelector('#activityName').value;
        if (!name) return;
        const description = createActivityForm.querySelector('#activityDescription').value;
        if (!description) return;
        let duration = durationSlider.value;
        duration = parseInt(duration);
        if (!duration) return;
        let imageUrl = createActivityForm.querySelector('#activityImageUrl').value;
        if (!imageUrl) imageUrl = 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/a93c82108677535.5fc3684e78f67.gif';

        if (editingActivityId) {
            await updateActivityData(editingActivityId, {
                name: name,
                description: description,
                duration: duration,
                imageUrl: imageUrl,
            });
        } else {
            console.log('creating new activity');
            await createNewActivity(name, description, duration, imageUrl);
        }
        createActivityForm.reset(); // clear the form
        dialog.close();
    });
}