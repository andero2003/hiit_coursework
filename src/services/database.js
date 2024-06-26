// Setup database
import { uuid } from '../utils.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Create a new database

async function init() {
    const db = await open({
        filename: './workout.sqlite',
        driver: sqlite3.Database,
        verbose: true,
    });

    await db.migrate({ migrationsPath: './db/migrations-sqlite'});

    return db;
}

const dbConn = init();
export async function getWorkouts() {
    const db = await dbConn;
    const rows = await db.all(`SELECT * FROM workout;`);
    return rows;
}

export async function getActivities() {
    const db = await dbConn;
    const rows = await db.all(`SELECT * FROM activity;`);
    return rows;
}

export async function getActivitiesData(ids) {
    const db = await dbConn;
    const rows = await db.all(`SELECT * FROM activity WHERE id IN (${ids.map(() => '?').join(',')});`, ids);
    const result = [];
    for (const id of ids) {
        result.push(rows.find((row) => row.id === id));
    }

    return result;
}

export async function getWorkoutData(id) {
    const db = await dbConn;
    const row = await db.get(`SELECT * FROM workout WHERE id = ?;`, id);
    return row;
}

export async function getActivitiesForWorkout(workoutId) {
    const db = await dbConn;
    const workout = await db.get(`SELECT activities FROM workout WHERE id = ?;`, workoutId);
    const activityIDs = JSON.parse(workout.activities);
    const activities = await db.all(`SELECT * FROM activity WHERE id IN (${activityIDs.map(() => '?').join(',')});`, activityIDs);
    return activities;
}

export async function createWorkout(name, description = 'No description') {
    const db = await dbConn;
    const id = uuid();
    const activities = JSON.stringify([]);
    await db.run(`INSERT INTO workout (id, name, description) VALUES (?, ?, ?);`, [id, name, description]);
    return {
        id,
        name,
        description,
        activities
    };
}

export async function createActivity(name, description, duration, imageUrl) {
    const db = await dbConn;
    const id = uuid();
    await db.run(`INSERT INTO activity (id, name, description, duration, imageUrl) VALUES (?, ?, ?, ?, ?);`, [id, name, description, duration, imageUrl]);

    return {
        id,
        name,
        description,
        duration,
        imageUrl
    };
}

export async function updateActivity(id, { name, description, duration, imageUrl }) {
    const db = await dbConn;
    await db.run(`UPDATE activity SET name = ?, description = ?, duration = ?, imageUrl = ? WHERE id = ?;`, [name, description, duration, imageUrl, id]);
    return 'Success';
}

export async function updateWorkout(id, { name, description }) {
    const db = await dbConn;
    await db.run(`UPDATE workout SET name = ?, description = ? WHERE id = ?;`, [name, description, id]);
    return 'Success';
}

export async function addActivityToWorkout(workoutId, activityId) {
    const db = await dbConn;
    const identifier = uuid();
    const compositeId = `${activityId} ${identifier}`; // to distinguish between multiple instances of the same activity in a workout
    await db.run(`UPDATE workout SET activities = json_insert(activities, '$[#]', ?) WHERE id = ?;`, [compositeId, workoutId]);
    return identifier
}

export async function removeActivityFromWorkout(workoutId, workoutSpecificIdentifier) {
    const db = await dbConn;
    const workout = await db.get(`SELECT activities FROM workout WHERE id = ?;`, workoutId);
    const activityIDs = JSON.parse(workout.activities);
    const newActivities = activityIDs.filter((id) => {
        const [_, identifier] = id.split(' ');
        return identifier !== workoutSpecificIdentifier;
    });
    const newActivitiesJSON = JSON.stringify(newActivities);
    await db.run(`UPDATE workout SET activities = ? WHERE id = ?;`, [newActivitiesJSON, workoutId]);
    return await getActivitiesForWorkout(workoutId);
}

export async function deleteActivity(activityId) {
    const db = await dbConn;
    const workouts = await getWorkouts();

    // Remove the activity from all workouts that use it
    for (const workout of workouts) {
        const workoutId = workout.id;
        const activities = JSON.parse(workout.activities);
        const newActivities = activities.filter((compositeId) => {
            return compositeId.split(' ')[0] !== activityId;
        });
        await db.run(`UPDATE workout SET activities = ? WHERE id = ?;`, [JSON.stringify(newActivities), workoutId]);
    }

    await db.run(`DELETE FROM activity WHERE id = ?;`, activityId);
    return await getActivities();
}

export async function deleteWorkout(id) {
    const db = await dbConn;
    await db.run(`DELETE FROM workout WHERE id = ?;`, id);

    // Delete all records of this workout from workoutHistory
    await db.run(`DELETE FROM workoutHistory WHERE workoutId = ?;`, id);

    return await getWorkouts();
}

export async function addWorkoutRecordToHistory(workoutId, date, startTime, endTime) {
    const db = await dbConn;
    const id = uuid();
    await db.run(`INSERT INTO workoutHistory (id, workoutId, date, startTime, endTime) VALUES (?, ?, ?, ?, ?);`, [id, workoutId, date, startTime, endTime]);
    return id;
}

export async function getWorkoutHistory() {
    const db = await dbConn;
    const rows = await db.all(`SELECT * FROM workoutHistory;`);
    return rows;
}

export async function deleteWorkoutRecordFromHistory(id) {
    const db = await dbConn;
    await db.run(`DELETE FROM workoutHistory WHERE id = ?;`, id);
    return true;
}