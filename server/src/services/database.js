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
    })

    await db.exec(`CREATE TABLE IF NOT EXISTS workout (
        id TEXT PRIMARY KEY,
        name TEXT DEFAULT 'New Workout',
        description 
    );`);
    await db.exec(`CREATE TABLE IF NOT EXISTS activity (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        duration INTEGER DEFAULT 30
    );`);
    await db.exec(`CREATE TABLE IF NOT EXISTS workout_activity (
        workout_id TEXT,
        activity_id TEXT,
        "order" INTEGER,
        PRIMARY KEY (workout_id, activity_id, "order")
    );`);

    return db;
}

const dbConn = init();

// // Run the SQL commands to create the tables
// db.serialize(() => {
//     db.run(`CREATE TABLE IF NOT EXISTS workout (
//         id TEXT PRIMARY KEY,
//         name TEXT DEFAULT 'New Workout',
//         description 
//     );`);
//     db.run(`CREATE TABLE IF NOT EXISTS activity (
//         id TEXT PRIMARY KEY,
//         name TEXT,
//         description TEXT,
//         duration INTEGER DEFAULT 30
//     );`);
//     db.run(`CREATE TABLE IF NOT EXISTS workout_activity (
//         id TEXT PRIMARY KEY,
//         id TEXT PRIMARY KEY,
//         PRIMARY KEY (workout_id, activity_id)
//     );`);

//     // Dummy data
//     // db.run(`INSERT INTO workout (name) VALUES ('Morning Boost');`);
//     // db.run(`INSERT INTO workout (name) VALUES ('Midday Energizer');`);
//     // db.run(`INSERT INTO workout (name) VALUES ('Evening Wind Down');`);

//     // // Inserting dummy activities
//     // db.run(`INSERT INTO activity (name, description, duration) VALUES ('Jumping Jacks', 'A full body workout that increases aerobic fitness, strength, and flexibility', 60);`);
//     // db.run(`INSERT INTO activity (name, description, duration) VALUES ('Squats', 'Lower body workout targeting your glutes, hips, and thighs', 45);`);
//     // db.run(`INSERT INTO activity (name, description, duration) VALUES ('Push-ups', 'Upper body exercise that targets the chest, shoulders, and triceps', 30);`);
//     // db.run(`INSERT INTO activity (name, description, duration) VALUES ('Plank', 'Core exercise for improving posture and general strength', 90);`);

//     // // You should wait until the activities and workouts are inserted
//     // // This is just a simplified representation, you might need to use promises or callbacks to handle async execution

//     // // Associating workouts with activities
//     // // Assuming the workout IDs are 1, 2, 3 and activity IDs are 1, 2, 3, 4
//     // db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (1, 1);`); // Morning Boost - Jumping Jacks
//     // db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (1, 2);`); // Morning Boost - Squats
//     // db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (2, 3);`); // Midday Energizer - Push-ups
//     // db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (2, 4);`); // Midday Energizer - Plank
//     // db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (3, 1);`); // Evening Wind Down - Jumping Jacks
//     // db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (3, 3);`); // Evening Wind Down - Push-ups
// });

export async function getWorkouts() {
    const db = await dbConn;
    const rows = await db.all(`SELECT * FROM workout;`);
    return rows;
}

export async function getWorkoutData(id) {
    const db = await dbConn;
    const row = await db.get(`SELECT * FROM workout WHERE id = ?;`, id);
    return row;
}

export async function getActivitiesForWorkout(id) {
    const db = await dbConn;
    const rows = await db.all(`
    SELECT activity.* FROM activity
    JOIN workout_activity ON workout_activity.activity_id = activity.id
    WHERE workout_id = ?;
    `, id);
    return rows;
}

export async function createWorkout(name, description = 'No description') {
    const db = await dbConn;
    const id = uuid();
    await db.run(`INSERT INTO workout (id, name, description) VALUES (?, ?, ?);`, [id, name, description]);
    return {
        id,
        name,
        description,
    };
}

export async function createActivity(name, description, duration) {
    console.log(name, description, duration);
    const db = await dbConn;
    const id = uuid();
    await db.run(`INSERT INTO activity (id, name, description, duration) VALUES (?, ?, ?, ?);`, [id, name, description, duration]);

    return {
        id,
        name,
        description,
        duration,
    };
}

export async function addActivityToWorkout(workoutId, activityId) {
    const db = await dbConn;
    const order = await db.get(`SELECT MAX("order") as max FROM workout_activity WHERE workout_id = ?;`, workoutId);
    await db.run(`INSERT INTO workout_activity (workout_id, activity_id, "order") VALUES (?, ?, ?);`, [workoutId, activityId, order]);
    return 'Success';
}

export async function removeActivityFromWorkout(workoutId, activityId) {
    const db = await dbConn;
    const { order } = await db.get(`SELECT "order" FROM workout_activity WHERE workout_id = ? AND activity_id = ?;`, [workoutId, activityId]);

    await db.run(`DELETE FROM workout_activity WHERE workout_id = ? AND activity_id = ?;`, [workoutId, activityId]);
   
    await db.run(`UPDATE workout_activity SET "order" = "order" - 1 WHERE workout_id = ? AND "order" > ?;`, [workoutId, order]);

    return 'Success';
}

export async function deleteActivity(id) {
    const db = await dbConn;

    const workouts = await db.all(`SELECT workout_id FROM workout_activity WHERE activity_id = ?;`, id);
    for (const workout of workouts) {
        await removeActivityFromWorkout(workout.workout_id, id);
    }

    await db.run(`DELETE FROM activity WHERE id = ?;`, id);
    return 'Success';
}

export async function deleteWorkout(id) {
    const db = await dbConn;
    await db.run(`DELETE FROM workout_activity WHERE workout_id = ?;`, id);
    await db.run(`DELETE FROM workout WHERE id = ?;`, id);
    return 'Success';
}
