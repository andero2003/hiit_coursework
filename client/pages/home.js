import { CleanupManager } from "../modules/CleanupManager.js";
import { ReactiveContainer, State, StateManager } from "../modules/StateLib.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/home.css">
<h3>Welcome!</h3>
<button class="confirm-button">Start Workout</button>
<section id="chooseWorkout" hidden>
</section>
<section id="currentWorkout" hidden>
<div class="header">
    <h3></h3>
    <button class="cancel-button">Cancel</button>
</div>
<h1 id="countdown"></h1>
</section>
`

const cleanupManager = new CleanupManager();
const currentWorkout = new State(null);

export function init(element) {
    element.innerHTML = content;

    const title = element.querySelector('h3');
    const startWorkoutButton = element.querySelector('.confirm-button');
    const chooseWorkoutList = element.querySelector('#chooseWorkout');
    const currentWorkoutSection = element.querySelector('#currentWorkout');

    currentWorkout.onChange((workout) => {
        cleanupManager.clean();
        chooseWorkoutList.hidden = true;
        currentWorkoutSection.hidden = workout === null;
        startWorkoutButton.hidden = workout !== null;
        title.hidden = workout !== null;
    });

    const workouts = StateManager.workouts;
    ReactiveContainer(workouts, chooseWorkoutList, (workout) => {
        const workoutElement = document.createElement('button');
        workoutElement.setAttribute('workoutId', workout.id);
        workoutElement.textContent = workout.name;

        workoutElement.addEventListener('click', () => {
            currentWorkout.value = workout;
            startWorkout(element, workout);
        });

        return workoutElement;
    }, (child, workout) => {
        return child.getAttribute('workoutId') === workout.id;
    });

    startWorkoutButton.addEventListener('click', () => {
        chooseWorkoutList.hidden = !chooseWorkoutList.hidden;
    });
}

function startWorkout(element, workout) {
    const elapsed = new State(0);

    const currentWorkoutSection = element.querySelector('#currentWorkout');
    const title = currentWorkoutSection.querySelector('h3');
    title.textContent = workout.name;

    const cancelWorkoutButton = currentWorkoutSection.querySelector('.cancel-button');
    cancelWorkoutButton.addEventListener('click', () => {
        currentWorkout.value = null;
    });

    // const _timer = setInterval(() => {
    //     elapsed.value += 0.1;
    // }, 100); // for a more accurate timer
    // cleanupManager.addTask(() => clearInterval(_timer));

    const countdown = currentWorkoutSection.querySelector('#countdown');
    let count = 3;
    countdown.textContent = `Starting in ${count}...`;
    const _countdown = setInterval(() => {
        count--;
        countdown.textContent = `Starting in ${count}...`;
        if (count === 0) {
            clearInterval(_countdown);
            countdown.textContent = 'Go!';



            setTimeout(() => {
                countdown.textContent = '';
            }, 1000);
        }
    }, 1000);
}