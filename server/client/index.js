const workoutsList = document.querySelector('#workouts');

function addWorkoutElement(workout, activities) {
    const workoutDiv = document.createElement('div');
    workoutDiv.classList.add('workout');
    workoutDiv.id = `workout-${workout.id}`;

    const title = document.createElement('h2');
    title.textContent = workout.name;
    workoutDiv.append(title)

    const description = document.createElement('p');
    description.textContent = workout.description ? workout.description : 'No description';
    workoutDiv.append(description);

    const activitiesList = document.createElement('ul');
    for (const activity of activities) {
        const activityItem = document.createElement('li');
        activityItem.textContent = `${activity.name} - ${activity.description} - ${activity.duration} sec`;
        activitiesList.append(activityItem);
    }
    workoutDiv.append(activitiesList);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
        const status = await fetch(
            `/workout/${workout.id}`,
            {
                method: 'DELETE',
            },
        );
        console.log(status);
        workoutDiv.remove();
    });
    workoutDiv.append(deleteButton);

    return workoutDiv;
}

async function fetchWorkouts() {
    const workouts = await fetch(
        '/workout/',
    );
    console.log(workouts);
    const data = await workouts.json();

    console.log(data);

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

const addWorkout = document.querySelector('#addWorkout');
addWorkout.addEventListener('click', async () => {
    const name = prompt('Enter workout name');
    const description = prompt('Enter workout description');
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

    const activities = await fetch(
        `/workout/${newWorkout.id}`,
    );
    const activitiesData = await activities.json();
    const workoutDiv = addWorkoutElement(newWorkout, activitiesData.activities);
    workoutsList.append(workoutDiv);
});