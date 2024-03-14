import { getActivities, getWorkouts } from "./modules/NetworkingService.js";
import { State, CompoundState, StateManager } from "./modules/StateLib.js";

const ui = {
    body: document.querySelector('body'),
    sidebar: document.querySelector('#sidebar'),
    pages: []
}

const pages = [
    {
        name: 'home',
        title: 'Home',
        image: './assets/Home 64.png',
    },
    {
        name: 'workouts',
        title: 'Workouts',
        image: './assets/Dumbbell 64.png',
    },
    {
        name: 'activities',
        title: 'Activities',
        image: './assets/Strong Arm 64.png',
    }
]

function createSidebarButton(page) {
    const sidebarButton = document.createElement('button');
    sidebarButton.innerHTML = `
        <img src="${page.image}" />
        ${page.title}
    `;
    ui.sidebar.append(sidebarButton);

    sidebarButton.addEventListener('click', () => {
        StateManager.currentPage.value = page.name;
        StateManager.sidebarOpen.value = false;
    });
}

async function setupPages() {
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        createSidebarButton(page);

        const pageElement = document.createElement('page-element');
        pageElement.setAttribute('id', `section-${page.name}`);
        pageElement.setAttribute('name', page.name);
        pageElement.setAttribute('title', page.title);

        const div = document.createElement('div');
        div.slot = 'content';

        const module = await import(`./pages/${page.name}.js`);
        module.init(div);

        pageElement.shadowRoot.append(div);

        // inject reactive state
        pageElement.hidden = StateManager.currentPage.value !== page.name;
        StateManager.currentPage.onChange((newPage) => {
            pageElement.hidden = newPage !== page.name;
        });

        ui.pages.push(pageElement);
        ui.body.append(pageElement);
    }
}

setupPages();

// Helper functions

function showSidebar() {
    StateManager.sidebarOpen.value = true;
}

function hideSidebar() {
    StateManager.sidebarOpen.value = false;
}

function setupSidebar() {
    const toggleSidebar = document.querySelector('#toggleSidebar');
    const sidebar = document.querySelector('#sidebar');

    toggleSidebar.addEventListener('click', () => {
        StateManager.sidebarOpen.value = !StateManager.sidebarOpen.value;
    });

    StateManager.sidebarOpen.onChange((value) => {
        sidebar.classList.toggle('open', value);
    });

    let touchStart = 0;
    let touchEnd = 0;
    document.addEventListener('touchstart', (e) => {
        touchStart = e.touches[0].clientX;
    });

    document.addEventListener('touchend', (e) => {
        touchEnd = e.changedTouches[0].clientX;
        if (touchStart - touchEnd > 50) {
            hideSidebar();
        } else if (touchEnd - touchStart > 50) {
            showSidebar();
        } else {
            if (touchEnd > window.innerWidth * 0.65) {
                hideSidebar();
            }
        }
    });
}

setupSidebar();

async function fetchData() {
    await getActivities();
    await getWorkouts();
}

fetchData();
// const workoutsList = document.querySelector('#workouts');
// const activitiesList = document.querySelector('#activities');
// const addWorkoutButton = document.querySelector('#addWorkout');
// const workoutForm = document.querySelector('#createWorkoutForm');

// function addWorkoutElement(workout, activities) {
//     const workoutElement = document.createElement('workout-element');
//     workoutElement.setAttribute('name', workout.name);
//     workoutElement.setAttribute('id', workout.id);
//     workoutElement.setAttribute('description', workout.description);
//     workoutElement.activities = activities;

//     return workoutElement;
// }

// function addActivityElement(activity) {
//     const activityElement = document.createElement('activity-element');
//     activityElement.setAttribute('name', activity.name);
//     activityElement.setAttribute('description', activity.description);
//     activityElement.setAttribute('duration', activity.duration);
//     activityElement.setAttribute('imageUrl', activity.imageUrl);
//     activityElement.setAttribute('activityId', activity.id);

//     return activityElement;
// }

// async function fetchWorkouts() {
//     const workouts = await fetch(
//         '/workout/',
//     );
//     const data = await workouts.json();

//     for (const workout of data) {
//         const activitiesList = JSON.parse(workout.activities);
//         const activityIds = activitiesList.map((compositeId) => compositeId.split(' ')[0]);
//         const identifierIds = activitiesList.map((compositeId) => compositeId.split(' ')[1]);

//         let activitiesData = [];
//         if (activityIds.length > 0) {
//             const activities = await fetch(
//                 activityIds.length > 0 ? '/activity?ids=' + activityIds.join(',') : '/activity',
//             );
//             activitiesData = await activities.json();
//             for (let i = 0; i < activitiesData.length; i++) {
//                 activitiesData[i].identifier = identifierIds[i];
//             }
//         }

//         let workoutDiv = addWorkoutElement(workout, activitiesData);
//         workoutsList.append(workoutDiv);
//     }
// }

// async function fetchActivities() {
//     const activities = await fetch(
//         `/activity`,
//     );
//     const data = await activities.json();

//     for (const activity of data) {
//         const activityElement = addActivityElement(activity);
//         activitiesList.append(activityElement);
//     }
// }

// fetchActivities();
// fetchWorkouts();

// addWorkoutButton.addEventListener('click', () => {
//     workoutForm.hidden = !workoutForm.hidden;
// });

// const submitWorkout = document.querySelector('#submitWorkout');
// submitWorkout.addEventListener('click', async (e) => {
//     e.preventDefault();
//     const name = workoutForm.querySelector('#workoutName').value;
//     if (!name) return;
//     const description = workoutForm.querySelector('#workoutDescription').value;
//     if (!description) return;
//     const newWorkout = await fetch(
//         '/workout/',
//         {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ name, description }),
//         },
//     );

//     const workout = await newWorkout.json();

//     let workoutDiv = addWorkoutElement(workout, []);
//     workoutsList.append(workoutDiv);
//     workoutForm.hidden = true;
// });

// const addActivityButton = document.querySelector('#addActivity');
// const createActivityForm = document.querySelector('#createActivityForm');
// addActivityButton.addEventListener('click', () => {
//     createActivityForm.hidden = !createActivityForm.hidden;
// });

// const durationSlider = document.querySelector('#activityDuration');
// const durationOutput = document.querySelector('#durationValue');
// durationSlider.addEventListener('input', () => {
//     durationOutput.textContent = durationSlider.value;
// });

// const submitActivity = document.querySelector('#submitActivity');
// submitActivity.addEventListener('click', async (e) => {
//     e.preventDefault();
//     const name = createActivityForm.querySelector('#activityName').value;
//     if (!name) return;
//     const description = createActivityForm.querySelector('#activityDescription').value;
//     if (!description) return;
//     let duration = createActivityForm.querySelector('#activityDuration').value;
//     duration = parseInt(duration);
//     if (!duration) return;
//     let imageUrl = createActivityForm.querySelector('#activityImageUrl').value;
//     if (!imageUrl) imageUrl = 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/a93c82108677535.5fc3684e78f67.gif';

//     const newActivity = await fetch(
//         `/activity`,
//         {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ name, description, duration, imageUrl }),
//         },
//     );

//     const newActivityData = await newActivity.json();
//     const activityElement = addActivityElement(newActivityData);
//     activitiesList.append(activityElement);
//     createActivityForm.hidden = true;
// });
