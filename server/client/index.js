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
        console.log(sidebarStatus);
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
