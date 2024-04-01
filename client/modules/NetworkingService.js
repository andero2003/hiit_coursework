import { Activity } from "../models/Activity.js";
import { Workout } from "../models/Workout.js";
import { StateManager } from "./StateLib.js";

// this module is essentially just a facade for interacting with the server and database

export async function getActivities() {
    const activities = await fetch(
        `/activity`,
    );
    const data = await activities.json();
    StateManager.activities.value = data.map((activity) => {
        return new Activity(activity.id, activity.name, activity.description, activity.duration, activity.imageUrl);
    });
}

export async function getWorkouts() {
    const workouts = await fetch(
        '/workout/',
    );
    const data = await workouts.json();

    const activities = StateManager.activities.value;
    StateManager.workouts.value = data.map((workout) => {
        const workoutObject = new Workout(workout.id, workout.name, workout.description);

        const activitiesList = JSON.parse(workout.activities);
        const activityIds = activitiesList.map((compositeId) => compositeId.split(' ')[0]);
        const identifierIds = activitiesList.map((compositeId) => compositeId.split(' ')[1]);

        for (let i = 0; i < activityIds.length; i++) {
            const activity = activities.find((a) => a.id === activityIds[i]);
            const identifier = identifierIds[i];
            workoutObject.addActivity({
                activity: activity,
                identifier: identifier,
            });
        }

        return workoutObject;
    });
}

export async function updateImage(activityId, imageUrl) {
    const status = await fetch(
        `/activity/${activityId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl: imageUrl,
            }),
        },
    );

    // Reconcile state
    StateManager.activities.value = StateManager.activities.value.map((activity) => {
        if (activity.id === activityId) {
            activity.imageUrl = imageUrl;
        }
        return activity;
    });
    return status;
}

export async function deleteActivity(activityId) {
    const status = await fetch(
        `/activity/${activityId}`,
        {
            method: 'DELETE',
        },
    );

    // Reconcile state
    StateManager.activities.value = StateManager.activities.value.filter((activity) => activity.id !== activityId);
    StateManager.workouts.value = StateManager.workouts.value.map((workout) => {
        workout.activities = workout.activities.filter(({ activity, identifier }) => activity.id !== activityId);
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
    const activity = new Activity(data.id, data.name, data.description, data.duration, data.imageUrl);

    // Reconcile state
    StateManager.activities.value = [...StateManager.activities.value, activity];
    return activity;
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
    const workout = new Workout(data.id, data.name, data.description);

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
    const data = await status.json();

    // Reconcile state
    const workout = StateManager.workouts.value.find((workout) => workout.id === workoutId);
    const activity = StateManager.activities.value.find((activity) => activity.id === activityId);
    workout.addActivity({ activity, identifier: data });
    StateManager.workouts.value = StateManager.workouts.value.map((w) => {
        if (w.id === workoutId) {
            return workout;
        }
        return w;
    });
    return data;
}

export async function removeActivityFromWorkout(workoutId, workoutSpecificIdentifier) {
    const status = await fetch(
        `/workout/${workoutId}/activity/${workoutSpecificIdentifier}`,
        {
            method: 'DELETE',
        },
    );
    const data = await status.json();

    // Reconcile state
    const workout = StateManager.workouts.value.find((workout) => workout.id === workoutId);
    workout.activities = workout.activities.filter(({ identifier }) => identifier !== workoutSpecificIdentifier);
    StateManager.workouts.value = StateManager.workouts.value.map((w) => {
        if (w.id === workoutId) {
            return workout;
        }
        return w;
    });
    return data;
}

export async function recordWorkoutInHistory(workoutId, start, end) {
    const status = await fetch(
        `/history/`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workoutId, start, end }),
        },
    );
    return status;
}

export async function getWorkoutHistory() {
    const history = await fetch(
        `/history/`,
    );

    // Reconcile state
    StateManager.history.value = await history.json();
    console.log(StateManager.history.value);
    return true;
}