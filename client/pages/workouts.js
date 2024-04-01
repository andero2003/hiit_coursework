import { createNewWorkout } from "../modules/NetworkingService.js";
import { StateManager, ReactiveContainer } from "../modules/StateLib.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/workouts.css">
<div class="form-header">
<button id="addWorkout">Add Workout</button>
<form autocomplete="off" hidden>
    <input type="text" id="workoutName" placeholder="Workout name">
    <input type="text" id="workoutDescription" placeholder="Workout description">
    <button id="submitWorkout" class="confirm-button">Create</button>
</form>
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

    const addWorkoutButton = element.querySelector('#addWorkout');
    const workoutForm = element.querySelector('form');
    addWorkoutButton.addEventListener('click', () => {
        workoutForm.hidden = !workoutForm.hidden;
    });

    const submitWorkout = element.querySelector('#submitWorkout');
    submitWorkout.addEventListener('click', async (e) => {
        e.preventDefault(); // since the button is inside a form, we need to prevent the default form submission (page reload)
        const name = workoutForm.querySelector('#workoutName').value;
        if (!name) return;
        const description = workoutForm.querySelector('#workoutDescription').value;
        if (!description) return;

        await createNewWorkout(name, description);
        workoutForm.hidden = true;
        workoutForm.reset(); // clear the form
    });
}