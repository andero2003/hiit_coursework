import { addActivityToWorkout, createNewWorkout, deleteWorkout, removeActivityFromWorkout, updateWorkoutData } from "../modules/NetworkingService.js";
import { StateManager, ReactiveContainer, State, CompoundState } from "../modules/StateLib.js";
import { createIconButton } from "../modules/Utils.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/workouts.css">
<div class="form-header">
    <button id="addWorkout">Add Workout</button>
    <dialog>
        <div class="createView">
            <h2>Create a new workout</h2>
            <div class="besides">
                <form autocomplete="off" hidden>
                    <input type="text" id="workoutName" placeholder="Workout name">
                    <input type="text" id="workoutDescription" placeholder="Workout description">
                    <div class="rowButtons">
                        <button id="submitWorkout" class="confirm-button">Create</button>
                        <button id="cancelWorkout" class="cancel-button">Cancel</button>
                    </div>
                </form>
                <div>
                    <div class="activitiesList">

                    </div>
                    <button id="addActivity" class="confirm-button">Add activity</button>
                </div>
            </div>
        </div>
        <div class="selectActivityView" hidden>
            <h2>Select an activity</h2>
            <button id="cancelSelectActivity" class="cancel-button">Cancel</button>
            <div class="addActivitiesList">

            </div>
        </div>
    </dialog>
</div>
<div class="grid-container">

</div>
`
const editingWorkoutId = new State(null);
const selectingActivity = new State(false);

const currentWorkoutActivities = new CompoundState((use) => {
    const activities = use(StateManager.activities);
    const currentWorkout = use(StateManager.workoutsState).find(workout => workout.id === use(editingWorkoutId));

    // if there is no current workout, return an empty array to avoid errors
    return currentWorkout?.activities.map(({activity, identifier}) => ({
        activity: activities.find(a => a.id === activity.id), 
        id: identifier, // ReactiveContainer uses the id property to determine if an element has changed
        identifier
    })) ?? [];
});

function updateWorkoutElement(element, workout, dialog) {
    element.setAttribute('name', workout.name);
    element.setAttribute('workoutId', workout.id);
    element.setAttribute('description', workout.description);

    const duration = workout.activities.reduce((acc, activity) => acc + (activity.activity?.duration ?? 0), 0);
    element.setAttribute('duration', duration);

    const imageUrl = workout.activities[0]?.activity.imageUrl ?? 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/a93c82108677535.5fc3684e78f67.gif';
    if (imageUrl) {
        element.setAttribute('imageUrl', imageUrl);
    }

    const editButton = createIconButton('./assets/Pencil 64.png', (e) => {
        editingWorkoutId.value = workout.id;
        dialog.querySelector('h2').textContent = 'Edit workout';
        dialog.querySelector('#workoutName').value = workout.name;
        dialog.querySelector('#workoutDescription').value = workout.description;
        dialog.showModal();
    });
    element.addButtonToContextMenu(editButton);

    const deleteButton = createIconButton('./assets/Trash 64.png', async (e) => {
        await deleteWorkout(workout.id);
    }, 'cancel-button');
    element.addButtonToContextMenu(deleteButton);
}

export function init(element) {
    element.innerHTML = content;

    const grid = element.querySelector('.grid-container');
    const dialog = element.querySelector('dialog');

    // this will populate the grid with workouts and update dynamically when the workouts list changes
    ReactiveContainer(StateManager.workoutsState, grid, (workout) => {
        const workoutElement = document.createElement('card-element');
        updateWorkoutElement(workoutElement, workout, dialog);
        return workoutElement;
    }, (child, workout) => {
        return child.getAttribute('workoutId') === workout.id;
    });

    // this will populate the activities list in the dialog with the activities of the current workout
    const activitiesList = dialog.querySelector('.activitiesList');
    ReactiveContainer(currentWorkoutActivities, activitiesList, ({activity, identifier}) => {
        const activityItem = document.createElement('div');
        activityItem.classList.add('activityItem');
        activityItem.setAttribute('identifier', identifier);
        const label = document.createElement('p');
        label.textContent = activity.name;
        activityItem.appendChild(label);

        const removeActivityButton = createIconButton('./assets/Trash 64.png', async () => {
            try {
                const status = await removeActivityFromWorkout(editingWorkoutId.value, identifier);
            } catch (e) {
                console.log(e);
            }
        }, 'cancel-button');
        activityItem.appendChild(removeActivityButton);
        return activityItem;
    }, (child, {activity, identifier}) => {
        return child.getAttribute('identifier') === identifier;
    });

    const addActivitiesList = dialog.querySelector('.addActivitiesList');
    const activities = StateManager.activities;
    ReactiveContainer(activities, addActivitiesList, (activity) => {
        const activityItem = document.createElement('div');
        activityItem.classList.add('activityItem');
        activityItem.setAttribute('activityId', activity.id);
        const label = document.createElement('p');
        label.textContent = activity.name;
        activityItem.appendChild(label);

        const addActivityIconButton = createIconButton('./assets/Plus 64.png', async () => {
            try {
                const status = await addActivityToWorkout(editingWorkoutId.value, activity.id);
            } catch (e) {
                console.log(e);
            }
            selectingActivity.value = false;
        }, 'confirm-button');
        activityItem.appendChild(addActivityIconButton);

        return activityItem;
    }, (child, activity) => {
        return child.getAttribute('activityId') === activity.id;
    });

    const addWorkoutButton = element.querySelector('#addWorkout');
    const workoutForm = element.querySelector('form');
    addWorkoutButton.addEventListener('click', () => {
        editingWorkoutId.value = null;
        dialog.querySelector('h2').textContent = 'Create a new workout';
        dialog.showModal();
    });

    const cancelWorkout = element.querySelector('#cancelWorkout');
    cancelWorkout.addEventListener('click', (e) => {
        editingWorkoutId.value = null;
        e.preventDefault();
        workoutForm.reset(); // clear the form
        dialog.close();
    });

    const submitWorkout = element.querySelector('#submitWorkout');
    submitWorkout.addEventListener('click', async (e) => {
        e.preventDefault(); // since the button is inside a form, we need to prevent the default form submission (page reload)
        const name = workoutForm.querySelector('#workoutName').value;
        if (!name) return;
        const description = workoutForm.querySelector('#workoutDescription').value;
        if (!description) return;

        if (editingWorkoutId.value) {
            // update the workout
            await updateWorkoutData(editingWorkoutId.value, {
                name,
                description
            })
        } else {
            // create a new workout
            await createNewWorkout(name, description);
        }
        workoutForm.reset(); // clear the form
        dialog.close();
    });

    editingWorkoutId.onChange((id) => {
        submitWorkout.textContent = id ? 'Update' : 'Create';
    });

    selectingActivity.onChange((value) => {
        dialog.querySelector('.createView').hidden = value;
        dialog.querySelector('.selectActivityView').hidden = !value;
    })

    const addActivityButton = element.querySelector('#addActivity');
    addActivityButton.addEventListener('click', () => {
        selectingActivity.value = true;
    });

    editingWorkoutId.onChange((id) => {
        addActivityButton.hidden = !id;
    });

    const cancelSelectActivity = element.querySelector('#cancelSelectActivity');
    cancelSelectActivity.addEventListener('click', () => {
        selectingActivity.value = false;
    });
}