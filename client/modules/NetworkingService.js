import { Activity } from "../models/Activity.js";
import { Workout } from "../models/Workout.js";
import { StateManager } from "./StateLib.js";

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
    console.log("Updating image");
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
    return status;
}