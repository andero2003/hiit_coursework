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

    const activityHeader = document.createElement('h3');
    activityHeader.textContent = 'Activities';
    workoutDiv.append(activityHeader);
    const activitiesList = document.createElement('ul');
    for (const activity of activities) {
        const activityItem = document.createElement('li');
        activityItem.textContent = `${activity.name} - ${activity.description} - ${activity.duration} sec`;
        activitiesList.append(activityItem);
    }

    const addActivity = document.createElement('button');
    addActivity.textContent = 'Add activity';
    addActivity.addEventListener('click', async () => {
        const name = prompt('Enter activity name');
        if (!name) return;
        const description = prompt('Enter activity description');
        if (!description) return;
        let duration = prompt('Enter activity duration');
        duration = parseInt(duration);
        if (!duration) return;
        const newActivity = await fetch(
            `/workout/${workout.id}/activity`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description, duration }),
            },
        );

        const newActivityData = await newActivity.json();
        console.log(newActivityData);

        const activityItem = document.createElement('li');
        activityItem.textContent = `${newActivityData.name} - ${newActivityData.description} - ${newActivityData.duration} sec`;
        activitiesList.append(activityItem);
    });
    workoutDiv.append(addActivity);

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
    if (!name) return;
    const description = prompt('Enter workout description');
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