import { CleanupManager } from "../modules/CleanupManager.js";
import { CompoundState, ReactiveContainer, State, StateManager } from "../modules/StateLib.js";

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
        <button id="pauseWorkout" hidden>Pause</button>
        <button class="cancel-button">Cancel</button>
    </div>
    <h1 id="status"></h1>
    <section id="currentActivity" class="card" hidden>
        <progress value="0" max="100"></progress>
        <h2>Activity</h2>
        <p>Activity description</p>
        <img src="" alt="Activity Image">
    </section>
    <h4>Next Activity</h4>
    <section id="nextActivity" class="card" hidden>
        <h2>Activity</h2>
        <img src="" alt="Activity Image">
    </section>
</section>
`

const cleanupManager = new CleanupManager();
const currentWorkout = new State(null);
const elapsed = new State(0);
const running = new State(false);

const activityChangedTime = new State(0);
const currentActivityIndex = new State(-1);

// derived states
const currentActivity = new CompoundState(use => {
    const workout = use(currentWorkout);
    if (workout === null) {
        return null;
    }
    const index = use(currentActivityIndex);
    return workout.activities[index]?.activity;
});
const nextActivity = new CompoundState(use => {
    const workout = use(currentWorkout);
    if (!workout) {
        return null;
    }
    const index = use(currentActivityIndex) + 1;
    return workout.activities[index]?.activity;
});
const currentActivityProgress = new CompoundState(use => {
    const activity = use(currentActivity);
    if (!activity) {
        return 0;
    }
    const time = use(elapsed) - use(activityChangedTime);
    return time / activity.duration;
});

export function init(element) {
    element.innerHTML = content;

    const title = element.querySelector('h3');
    const pauseWorkoutButton = element.querySelector('#pauseWorkout');
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

    running.onChange((isRunning) => {
        pauseWorkoutButton.textContent = isRunning ? 'Pause' : 'Resume';
    });

    elapsed.onChange((time) => {
        currentWorkoutSection.querySelector('h1').textContent = `Elapsed Time: ${time.toFixed(1)}s`;
    });
    cleanupManager.addTask(() => elapsed.value = 0);
    cleanupManager.addTask(() => currentActivityIndex.value = -1);
    cleanupManager.addTask(() => activityChangedTime.value = 0);


    currentActivity.onChange((activity) => {
        const activitySection = element.querySelector('#currentActivity');
        if (!activity) {
            activitySection.hidden = true;
            return;
        }
        activitySection.hidden = false;

        activityChangedTime.value = elapsed.value;

        activitySection.hidden = false;
        activitySection.querySelector('h2').textContent = activity.name;
        activitySection.querySelector('p').textContent = activity.description;
        activitySection.querySelector('img').src = activity.imageUrl;
    });

    nextActivity.onChange((activity) => {
        const activitySection = element.querySelector('#nextActivity');
        if (!activity) {
            activitySection.hidden = true;
            return;
        }
        activitySection.hidden = false;

        activitySection.querySelector('h2').textContent = activity.name;
        activitySection.querySelector('img').src = activity.imageUrl;
    });

    currentActivityProgress.onChange((progress) => {
        const activitySection = element.querySelector('#currentActivity');
        const progressElement = activitySection.querySelector('progress');
        progressElement.value = 100 - progress * 100;
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

    pauseWorkoutButton.addEventListener('click', () => {
        running.value = !running.value;
    });
}

function startTimer() {
    const _timer = setInterval(() => {
        if (!running.value) { return; }
        elapsed.value += 0.1;
        if (!currentActivity.value) { return; }
        if (elapsed.value >= currentActivity.value.duration + activityChangedTime.value) {
            currentActivityIndex.value++;
        }
        if (currentActivityIndex.value >= currentWorkout.value.activities.length) {
            currentWorkout.value = null;
        }
    }, 100); // for a more accurate timer
    cleanupManager.addTask(() => clearInterval(_timer));
}

function startWorkout(element, workout) {
    const currentWorkoutSection = element.querySelector('#currentWorkout');
    const title = currentWorkoutSection.querySelector('h3');
    title.textContent = workout.name;

    const cancelWorkoutButton = currentWorkoutSection.querySelector('.cancel-button');
    cancelWorkoutButton.addEventListener('click', () => {
        currentWorkout.value = null;
    });

    const pauseWorkoutButton = element.querySelector('#pauseWorkout');
    cleanupManager.addTask(() => pauseWorkoutButton.hidden = true);

    const countdown = currentWorkoutSection.querySelector('#status');
    let count = 3;
    countdown.textContent = `Starting in ${count}...`;
    const _countdown = setInterval(() => {
        count--;
        countdown.textContent = `Starting in ${count}...`;
        if (count === 0) {
            clearInterval(_countdown);
            countdown.textContent = 'Go!';
            currentActivityIndex.value++;
            running.value = true;
            cleanupManager.addTask(() => running.value = false);
            pauseWorkoutButton.hidden = false;
        }
    }, 1000);

    startTimer();
}
