import { createNewWorkout } from "../modules/NetworkingService.js";
import { StateManager, ReactiveContainer } from "../modules/StateLib.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/workouts.css">
<div class="form-header">
    <button id="addWorkout">Add Workout</button>
    <dialog>
        <h2>Create a new workout</h2>
        <form autocomplete="off" hidden>
            <input type="text" id="workoutName" placeholder="Workout name">
            <input type="text" id="workoutDescription" placeholder="Workout description">
            <div class="rowButtons">
                <button id="submitWorkout" class="confirm-button">Create</button>
                <button id="cancelWorkout" class="cancel-button">Cancel</button>
            </div>
        </form>
    </dialog>
</div>
<div class="grid-container">

</div>
`

function updateWorkoutElement(element, workout) {
    element.setAttribute('workoutId', workout.id);
    element.setAttribute('name', workout.name);
    element.setAttribute('description', workout.description);

    element.addActivities(workout.activities);
}

export function init(element) {
    element.innerHTML = content;

    const grid = element.querySelector('.grid-container');
    const workouts = StateManager.workouts;

    // this will populate the grid with workouts and update dynamically when the workouts list changes
    ReactiveContainer(workouts, grid, (workout) => {
        const workoutElement = document.createElement('workout-element');
        updateWorkoutElement(workoutElement, workout);
        return workoutElement;
    }, (child, workout) => {
        return child.getAttribute('workoutId') === workout.id;
    });

    const dialog = element.querySelector('dialog');
    const addWorkoutButton = element.querySelector('#addWorkout');
    const workoutForm = element.querySelector('form');
    addWorkoutButton.addEventListener('click', () => {
        if (dialog.hasAttribute('open')) {
            dialog.close();
        } else {
            dialog.showModal();
        }
    });

    const cancelWorkout = element.querySelector('#cancelWorkout');
    cancelWorkout.addEventListener('click', (e) => {
        e.preventDefault();
        dialog.close();
    });

    const submitWorkout = element.querySelector('#submitWorkout');
    submitWorkout.addEventListener('click', async (e) => {
        e.preventDefault(); // since the button is inside a form, we need to prevent the default form submission (page reload)
        const name = workoutForm.querySelector('#workoutName').value;
        if (!name) return;
        const description = workoutForm.querySelector('#workoutDescription').value;
        if (!description) return;

        await createNewWorkout(name, description);
        workoutForm.reset(); // clear the form
        dialog.close();
    });
}