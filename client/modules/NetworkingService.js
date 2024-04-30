import { StateManager } from "./StateLib.js";

// this module is essentially just a facade for interacting with the server and database

export async function getActivities() {
    const activities = await fetch(
        `/activity`,
    );
    const data = await activities.json();
    StateManager.activities.value = data;
}

export async function getWorkouts() {
    const workouts = await fetch(
        '/workout/',
    );
    const data = await workouts.json();
    StateManager.workouts.value = data.map((workout) => {
        const workoutObject = {
            id: workout.id,
            name: workout.name,
            description: workout.description,
            activities: [],
        }

        const activitiesList = JSON.parse(workout.activities);
        workoutObject.activities = activitiesList.map((composite) => {
            const activityId = composite.split(' ')[0];
            const identifier = composite.split(' ')[1];
            return {
                activityId,
                identifier,
            }
        });
    
        return workoutObject;
    });
}

export async function updateActivityData(activityId, newActivity) {
    const status = await fetch(
        `/activity/${activityId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newActivity.name,
                description: newActivity.description,
                duration: newActivity.duration,
                imageUrl: newActivity.imageUrl,
            }),
        },
    );

    // Reconcile state
    StateManager.activities.value = StateManager.activities.value.map((activity) => {
        if (activity.id === activityId) {
            activity.name = newActivity.name;
            activity.description = newActivity.description;
            activity.duration = newActivity.duration;
            activity.imageUrl = newActivity.imageUrl;
        }
        return activity;
    });
    return status;
}

export async function deleteActivity(activityIdToDelete) {
    const status = await fetch(
        `/activity/${activityIdToDelete}`,
        {
            method: 'DELETE',
        },
    );

    // Reconcile state
    StateManager.activities.value = StateManager.activities.value.filter((activity) => activity.id !== activityIdToDelete);
    StateManager.workouts.value = StateManager.workouts.value.map((workout) => {
        workout.activities = workout.activities.filter(({ activityId }) => activityIdToDelete !== activityId);
        return workout;
    });
    return status;
}

export async function createNewActivity(name, description, duration, imageUrl) {
    const newActivity = await fetch(
        '/activity/',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description, duration, imageUrl }),
        },
    );
    const data = await newActivity.json();

    // Reconcile state
    StateManager.activities.value = [...StateManager.activities.value, data];
    return data;
}

export async function updateWorkoutData(workoutId, newWorkout) {
    const status = await fetch(
        `/workout/${workoutId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newWorkout.name,
                description: newWorkout.description,
            }),
        },
    );

    // Reconcile state
    StateManager.workouts.value = StateManager.workouts.value.map((workout) => {
        if (workout.id === workoutId) {
            workout.name = newWorkout.name;
            workout.description = newWorkout.description;
        }
        return workout;
    });
    return status;
}

export async function createNewWorkout(name, description) {
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
    const data = await newWorkout.json();
    const workout = {
        id: data.id,
        name: data.name,
        description: data.description,
        activities: [],
    }

    // Reconcile state
    StateManager.workouts.value = [...StateManager.workouts.value, workout];
    return workout;
}

export async function deleteWorkout(workoutId) {
    const status = await fetch(
        `/workout/${workoutId}`,
        {
            method: 'DELETE',
        },
    );

    // Reconcile state
    StateManager.workouts.value = StateManager.workouts.value.filter((workout) => workout.id !== workoutId);
    return status;
}

export async function addActivityToWorkout(workoutId, activityId) {
    const status = await fetch(
        `/workout/${workoutId}/activity/${activityId}`,
        {
            method: 'POST',
        },
    );
    const identifier = await status.json();

    // Reconcile state
    StateManager.workouts.value = StateManager.workouts.value.map((w) => {
        if (w.id === workoutId) {
            w.activities = [
                ...w.activities,
                { 
                    activityId, 
                    identifier 
                },
            ]
        }
        return w;
    });
    return identifier;
}

export async function removeActivityFromWorkout(workoutId, workoutSpecificIdentifier) {
    const status = await fetch(
        `/workout/${workoutId}/activity/${workoutSpecificIdentifier}`,
        {
            method: 'DELETE',
        },
    );
    const data = await status.json();

    StateManager.workouts.value = StateManager.workouts.value.map((w) => {
        if (w.id === workoutId) {
            w.activities = w.activities.filter(({ identifier }) => identifier !== workoutSpecificIdentifier);
        }
        return w;
    });
    return data;
}

export async function recordWorkoutInHistory(workoutId, date, start, end) {
    const status = await fetch(
        `/history/`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workoutId, date, start, end }),
        },
    );
    // Reconcile state
    getWorkoutHistory();
    return status;
}

export async function getWorkoutHistory() {
    const history = await fetch(
        `/history/`,
    );

    // Reconcile state
    StateManager.history.value = await history.json();
    return true;
}

export async function deleteHistoryEntry(historyId) {
    const status = await fetch(
        `/history/${historyId}`,
        {
            method: 'DELETE',
        },
    );

    // Reconcile state
    StateManager.history.value = StateManager.history.value.filter((entry) => entry.id !== historyId);
    return status;
}