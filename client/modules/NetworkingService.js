import { Activity } from "../models/Activity.js";
import { Workout } from "../models/Workout.js";

export async function getActivities() {
    const activities = await fetch(
        `/activity`,
    );
    const data = await activities.json();
    return data.map((activity) => {
        return new Activity(activity.id, activity.name, activity.description, activity.duration, activity.imageUrl);
    });
}

export async function getWorkouts(activities) {
    const workouts = await fetch(
        '/workout/',
    );
    const data = await workouts.json();
    return data.map((workout) => {
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