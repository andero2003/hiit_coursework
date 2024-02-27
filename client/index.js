const workoutsList = document.querySelector('#workouts');
const activitiesList = document.querySelector('#activities');
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

function addActivityElement(activity) {
    const activityElement = document.createElement('activity-element');
    activityElement.setAttribute('name', activity.name);
    activityElement.setAttribute('description', activity.description);
    activityElement.setAttribute('duration', activity.duration);
    activityElement.setAttribute('imageUrl', activity.imageUrl);
    activityElement.setAttribute('activityId', activity.id);

    return activityElement;
}

async function fetchWorkouts() {
    const workouts = await fetch(
        '/workout/',
    );
    const data = await workouts.json();
    console.log('Workouts')
    console.log(data);

    for (const workout of data) {
        const activitiesList = JSON.parse(workout.activities);
        const activityIds = activitiesList.map((compositeId) => compositeId.split(' ')[0]);
        const identifierIds = activitiesList.map((compositeId) => compositeId.split(' ')[1]);

        console.log('Activity IDs')
        console.log(activityIds);

        let activitiesData = [];
        if (activityIds.length > 0) {
            const activities = await fetch(
                activityIds.length > 0 ? '/activity?ids=' + activityIds.join(',') : '/activity',
            );
            activitiesData = await activities.json();
            for (let i = 0; i < activitiesData.length; i++) {
                activitiesData[i].identifier = identifierIds[i];
            }
        }

        let workoutDiv = addWorkoutElement(workout, activitiesData);
        workoutsList.append(workoutDiv);
    }
}

async function fetchActivities() {
    const activities = await fetch(
        `/activity`,
    );
    const data = await activities.json();
    console.log('Activities')
    console.log(data);

    for (const activity of data) {
        const activityElement = addActivityElement(activity);
        activitiesList.append(activityElement);
    }
}

fetchActivities();
fetchWorkouts();

addWorkoutButton.addEventListener('click', () => {
    workoutForm.hidden = !workoutForm.hidden;
});

const submitWorkout = document.querySelector('#submitWorkout');
submitWorkout.addEventListener('click', async (e) => {
    e.preventDefault();
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

    const workout = await newWorkout.json();

    const activitiesList = JSON.parse(workout.activities);
    const activityIds = activitiesList.map((compositeId) => compositeId.split(' ')[0]);
    const identifierIds = activitiesList.map((compositeId) => compositeId.split(' ')[1]);

    let workoutDiv = addWorkoutElement(workout, []);
    workoutsList.append(workoutDiv);
    workoutForm.hidden = true;
});

const addActivityButton = document.querySelector('#addActivity');
const createActivityForm = document.querySelector('#createActivityForm');
addActivityButton.addEventListener('click', () => {
    createActivityForm.hidden = !createActivityForm.hidden;
});

const durationSlider = document.querySelector('#activityDuration');
const durationOutput = document.querySelector('#durationValue');
durationSlider.addEventListener('input', () => {
    durationOutput.textContent = durationSlider.value;
});

const submitActivity = document.querySelector('#submitActivity');
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

    const newActivity = await fetch(
        `/activity`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description, duration, imageUrl }),
        },
    );

    const newActivityData = await newActivity.json();
    console.log(newActivityData);
    const activityElement = addActivityElement(newActivityData);
    activitiesList.append(activityElement);
    createActivityForm.hidden = true;
});