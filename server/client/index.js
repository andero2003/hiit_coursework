async function fetchWorkouts() {
    const workouts = await fetch(
        '/workout/',
    );
    console.log(workouts);
    const data = await workouts.json();

    console.log(data);

    const workoutsList = document.querySelector('#workouts');
    for (const workout of data) {
        const workoutDiv = document.createElement('div');

        const title = document.createElement('h2');
        title.textContent = workout.name;
        workoutDiv.append(title)

        const description = document.createElement('p');
        description.textContent = workout.description ? workout.description : 'No description';
        workoutDiv.append(description);

        workoutsList.append(workoutDiv);

        const activities = await fetch(
            `/workout/${workout.id}`,
        );
        const activitiesData = await activities.json();
        const activitiesList = document.createElement('ul');
        for (const activity of activitiesData.activities) {
            const activityItem = document.createElement('li');
            activityItem.textContent = `${activity.name} - ${activity.description} - ${activity.duration} sec`;
            activitiesList.append(activityItem);
        }
        workoutDiv.append(activitiesList);
    }
}

fetchWorkouts();