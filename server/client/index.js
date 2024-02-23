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
    activityElement.setAttribute('activityId', activity.id);

    return activityElement;
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

async function fetchActivities() {
    const activities = await fetch(
        `/activity`,
    );
    const data = await activities.json();

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

    const workoutData = await newWorkout.json();

    const activities = await fetch(
        `/workout/${workoutData.id}`,
    );
    const activitiesData = await activities.json();
    const workoutDiv = addWorkoutElement(workoutData, activitiesData.activities);
    workoutsList.append(workoutDiv);
    workoutForm.hidden = true;
});

function setupNavigation() {
    const workoutsPage = document.querySelector('#workoutsPage');
    const activitiesPage = document.querySelector('#activitiesPage');

    const showWorkouts = document.querySelector('#showWorkouts');
    showWorkouts.addEventListener('click', () => {
        workoutsPage.hidden = false;
        activitiesPage.hidden = true;
    });

    const showActivities = document.querySelector('#showActivities');
    showActivities.addEventListener('click', () => {
        workoutsPage.hidden = true;
        activitiesPage.hidden = false;
    });

    let sidebarStatus = true;
    const toggleSidebar = document.querySelector('#toggleSidebar');
    toggleSidebar.addEventListener('click', () => {
        sidebarStatus = !sidebarStatus;
        const sections = document.querySelectorAll('section');
        const sidebar = document.querySelector('#sidebar');
        sidebar.style.width = sidebarStatus ? '250px' : '0px';
        sidebar.style.padding = sidebarStatus ? '12px 12px' : '12px 0px';
        for (const section of sections) {
            section.style.marginLeft = sidebarStatus ? '250px' : '0px';
        }
        toggleSidebar.style.left = sidebarStatus ? '280px' : '10px';
    });
}

setupNavigation();


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

    const newActivity = await fetch(
        `/activity`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description, duration }),
        },
    );

    const newActivityData = await newActivity.json();
    const activityElement = addActivityElement(newActivityData);
    activitiesList.append(activityElement);
    createActivityForm.hidden = true;
});