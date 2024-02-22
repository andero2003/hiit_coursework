const workoutsList = document.querySelector('#workouts');
const addWorkoutButton = document.querySelector('#addWorkout');
const workoutForm = document.querySelector('#createWorkoutForm');

function addWorkoutElement(workout, activities) {
    const workoutElement = document.createElement('workout-element');
    workoutElement.setAttribute('name', workout.name);
    workoutElement.setAttribute('id', workout.id);
    workoutElement.setAttribute('description', workout.description);

    workoutElement.activities = activities;

    return workoutElement;
}

async function fetchWorkouts() {
    const workouts = await fetch(
        '/workout/',
    );
    const data = await workouts.json();

    for (const workout of data) {
        const activities = await fetch(
            `/workout/${workout.id}`,
        );
        const activitiesData = await activities.json();
        let workoutDiv = addWorkoutElement(workout, activitiesData.activities);
        workoutsList.append(workoutDiv);
    }
}

fetchWorkouts();

addWorkoutButton.addEventListener('click', () => {
    workoutForm.hidden = !workoutForm.hidden;
});

const submitWorkout = document.querySelector('#submitWorkout');
submitWorkout.addEventListener('click', async () => {
    const name = workoutForm.querySelector('#workoutName').value;
    if (!name) return;
    const description = workoutForm.querySelector('#workoutDescription').value;
    if (!description) return;
    const newWorkout = await fetch(
        '/workout/',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        },
    );

    const workoutData = await newWorkout.json();

    const activities = await fetch(
        `/workout/${workoutData.id}`,
    );
    const activitiesData = await activities.json();
    const workoutDiv = addWorkoutElement(workoutData, activitiesData.activities);
    workoutsList.append(workoutDiv);
});