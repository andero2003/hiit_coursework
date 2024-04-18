import { CleanupManager } from "../modules/CleanupManager.js";
import { recordWorkoutInHistory } from "../modules/NetworkingService.js";
import { CompoundState, ReactiveContainer, State, StateManager } from "../modules/StateLib.js";
import { formatDuration } from "../modules/Utils.js";

const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/home.css">
<h3>Welcome!</h3>
<button class="confirm-button">Start Workout</button>
<dialog>
    <h2>Choose a workout</h2>
    <section id="chooseWorkout">
    </section>
    <button id="closeDialog" class="cancel-button">Close</button>
</dialog>
<section id="currentWorkout" hidden>
    <div class="header">
        <h3></h3>
        <button id="pauseWorkout" hidden>Pause</button>
        <button class="cancel-button">Cancel</button>
    </div>
    <h1 id="status"></h1>
    <section id="currentActivity" class="card" hidden>
        <progress value="0" max="100"></progress>
        <p id="remaining">Remaining Time</p>
        <h2>Activity</h2>
        <p id="description">Activity description</p>
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

// simple states
const currentWorkout = new State(null);
const startTime = new State(null);
const elapsed = new State(0);
const running = new State(false);
const activityChangedTime = new State(0);
const currentActivityIndex = new State(-1);

// derived states that change based on the simple states
const currentActivity = new CompoundState(use => {
    const workout = use(currentWorkout);
    const index = use(currentActivityIndex);
    return workout?.activities[index]?.activity;
});
const nextActivity = new CompoundState(use => {
    const workout = use(currentWorkout);
    const index = use(currentActivityIndex) + 1;
    return workout?.activities[index]?.activity;
});
const currentActivityProgress = new CompoundState(use => {
    const activity = use(currentActivity);
    if (!activity) { return 0; }
    const time = use(elapsed) - use(activityChangedTime);
    return time / activity.duration;
});

// main page initialization
export function init(element) {
    element.innerHTML = content;

    const title = element.querySelector('h3');
    const pauseWorkoutButton = element.querySelector('#pauseWorkout');
    const startWorkoutButton = element.querySelector('.confirm-button');
    const chooseWorkoutList = element.querySelector('#chooseWorkout');
    const currentWorkoutSection = element.querySelector('#currentWorkout');

    const dialog = element.querySelector('dialog');

    const closeDialog = element.querySelector('#closeDialog');
    closeDialog.addEventListener('click', () => {
        dialog.close();
    });

    currentWorkout.onChange((workout) => {
        if (!workout) { // clean up all the state from the previous workout if it is changed to null (meaning a workout has ended)
            cleanupManager.clean();        
        }

        // default element visibility depending on the workout state
        dialog.close();
        currentWorkoutSection.hidden = workout === null;
        startWorkoutButton.hidden = workout !== null;
        title.hidden = workout !== null;
    
        // update the workout in local storage to persist the state between page reloads
        localStorage.setItem('workout', JSON.stringify(workout));
    });

    running.onChange((isRunning) => {
        pauseWorkoutButton.textContent = isRunning ? 'Pause' : 'Resume';
    });

    const activitySection = element.querySelector('#currentActivity');
    elapsed.onChange((time) => {
        currentWorkoutSection.querySelector('h1').textContent = `Elapsed Time: ${formatDuration(time)}`;
        const remainingLabel = activitySection.querySelector('#remaining');
        const activity = currentActivity.value;
        if (!activity) {
            remainingLabel.textContent = '';
            return;
        }
        const remaining = activity.duration - (time - activityChangedTime.value) + 1;
        remainingLabel.textContent = `Remaining: ${formatDuration(remaining)}`;
    });

    // cleanup the state when the workout is done
    cleanupManager.addTask(() => elapsed.value = 0);
    cleanupManager.addTask(() => currentActivityIndex.value = -1);
    cleanupManager.addTask(() => activityChangedTime.value = 0);
    cleanupManager.addTask(() => localStorage.clear());

    currentActivity.onChange((activity) => {
        if (!activity) { // no more activities in the workout
            activitySection.hidden = true;
            return;
        }

        activitySection.hidden = false;
        activityChangedTime.value = elapsed.value;
        activitySection.querySelector('h2').textContent = activity.name;
        activitySection.querySelector('#description').textContent = activity.description;
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

    // handle progress bar for the current activity
    currentActivityProgress.onChange((progress) => {
        const activitySection = element.querySelector('#currentActivity');
        const progressElement = activitySection.querySelector('progress');
        progressElement.value = 100 - progress * 100;
    });

    const workouts = StateManager.workouts;

    // this will populate the list of workouts to choose from on home page, updating dynamically whenever the workouts list changes
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
        if (dialog.hasAttribute('open')) {
            dialog.close();
        } else {
            dialog.showModal();
        }
    });

    pauseWorkoutButton.addEventListener('click', () => {
        running.value = !running.value;
    });

    // check for workout to resume from local storage
    loadFromLocalStorage(element);
}

function recordWorkout(workoutId) {
    const start = startTime.value;
    const end = new Date();
    
    const formattedDate = (date) =>        
        date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }
    )

    const formattedTime = (date) => 
        date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        }
    ) 

    recordWorkoutInHistory(workoutId, formattedDate(start), formattedTime(start), formattedTime(end));
    startTime.value = null;
}

function loadFromLocalStorage(element) {
    // load from local storage
    const savedWorkout = JSON.parse(localStorage.getItem('workout'));
    if (savedWorkout) {
        // restore in progress workout
        const restoredState = {
            elapsed: JSON.parse(localStorage.getItem('elapsed')),
            activityChangedTime: JSON.parse(localStorage.getItem('activityChangedTime')),
            currentActivityIndex: JSON.parse(localStorage.getItem('currentActivityIndex'))
        };
        currentWorkout.value = savedWorkout;
        startWorkout(element, savedWorkout, restoredState);
    }
}

function startTimer() {
    const _timer = setInterval(() => {
        if (!running.value) { return; } // workout is paused
        elapsed.value += 0.1;

        // save the state to local storage
        localStorage.setItem('elapsed', JSON.stringify(elapsed.value));

        if (!currentActivity.value) { return; }

        // check if the current activity is done
        if (elapsed.value >= currentActivity.value.duration + activityChangedTime.value) {
            currentActivityIndex.value++;
            localStorage.setItem('activityChangedTime', JSON.stringify(elapsed.value));
        }
        localStorage.setItem('currentActivityIndex', JSON.stringify(currentActivityIndex.value));

        // check if the workout is done
        if (currentActivityIndex.value >= currentWorkout.value.activities.length) {
            recordWorkout(currentWorkout.value.id);
            currentWorkout.value = null;
        }
    }, 100); // for a more accurate timer

    // cleanup the timer when the workout is done / cancelled
    cleanupManager.addTask(() => clearInterval(_timer));
}

function startWorkout(element, workout, restoredState) {
    const currentWorkoutSection = element.querySelector('#currentWorkout');
    const title = currentWorkoutSection.querySelector('h3');
    title.textContent = workout.name;

    const cancelWorkoutButton = currentWorkoutSection.querySelector('.cancel-button');
    cancelWorkoutButton.addEventListener('click', () => {
        if (startTime.value) {
            recordWorkout(currentWorkout.value.id);
        }
        currentWorkout.value = null;
    });

    const pauseWorkoutButton = element.querySelector('#pauseWorkout');
    cleanupManager.addTask(() => pauseWorkoutButton.hidden = true);

    const countdown = currentWorkoutSection.querySelector('#status');
    let count = 3;
    countdown.textContent = `${restoredState ? 'Resuming' : 'Starting'} in ${count}...`;
    const _countdown = setInterval(() => {
        count--;
        countdown.textContent = `${restoredState ? 'Resuming' : 'Starting'} in ${count}...`;
        if (count === 0) {
            clearInterval(_countdown);
            countdown.textContent = 'Go!';
            startTime.value = new Date();
            if (restoredState) {
                // restored state is passed in case the workout is being resumed (loaded from local storage)
                elapsed.value = restoredState.elapsed;
                currentActivityIndex.value = restoredState.currentActivityIndex;
                activityChangedTime.value = restoredState.activityChangedTime;
            } else {
                currentActivityIndex.value++; // initial value is -1 so we increment it to start the first activity
                localStorage.setItem('activityChangedTime', JSON.stringify(elapsed.value));
            }
            running.value = true;
            cleanupManager.addTask(() => running.value = false);
            pauseWorkoutButton.hidden = false;
        }
    }, 1000);
    cleanupManager.addTask(() => clearInterval(_countdown)); // state cleanup handler in case the workout is cancelled during the countdown

    startTimer();
}
