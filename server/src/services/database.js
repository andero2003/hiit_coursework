// Setup database
const sqlite3 = require('sqlite3').verbose();

// Create a new database
const db = new sqlite3.Database('./src/services/workout.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err);
    }
});

// Run the SQL commands to create the tables
db.serialize(() => {
    db.run(`CREATE TABLE workout (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT 'New Workout'
    );`);
    db.run(`CREATE TABLE activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        duration INTEGER DEFAULT 30
    );`);
    db.run(`CREATE TABLE workout_activity (
        workout_id INTEGER,
        activity_id INTEGER,
        PRIMARY KEY (workout_id, activity_id)
    );`);

    // Dummy data
    db.run(`INSERT INTO workout (name) VALUES ('Morning Boost');`);
    db.run(`INSERT INTO workout (name) VALUES ('Midday Energizer');`);
    db.run(`INSERT INTO workout (name) VALUES ('Evening Wind Down');`);

    // Inserting dummy activities
    db.run(`INSERT INTO activity (name, description, duration) VALUES ('Jumping Jacks', 'A full body workout that increases aerobic fitness, strength, and flexibility', 60);`);
    db.run(`INSERT INTO activity (name, description, duration) VALUES ('Squats', 'Lower body workout targeting your glutes, hips, and thighs', 45);`);
    db.run(`INSERT INTO activity (name, description, duration) VALUES ('Push-ups', 'Upper body exercise that targets the chest, shoulders, and triceps', 30);`);
    db.run(`INSERT INTO activity (name, description, duration) VALUES ('Plank', 'Core exercise for improving posture and general strength', 90);`);

    // You should wait until the activities and workouts are inserted
    // This is just a simplified representation, you might need to use promises or callbacks to handle async execution

    // Associating workouts with activities
    // Assuming the workout IDs are 1, 2, 3 and activity IDs are 1, 2, 3, 4
    db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (1, 1);`); // Morning Boost - Jumping Jacks
    db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (1, 2);`); // Morning Boost - Squats
    db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (2, 3);`); // Midday Energizer - Push-ups
    db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (2, 4);`); // Midday Energizer - Plank
    db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (3, 1);`); // Evening Wind Down - Jumping Jacks
    db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (3, 3);`); // Evening Wind Down - Push-ups
});

function getWorkouts() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM workout;`, (err, rows) => {
            if (err) {
                reject(err);
            }

            resolve(rows);
        });
    });
}

function getWorkoutData(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM workout WHERE id = ?;`, [id], (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
    });

}

function getActivitiesForWorkout(id) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT activity.* FROM activity
            JOIN workout_activity ON workout_activity.activity_id = activity.id
            WHERE workout_id = ?;
        `, [id], (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
    });
}

function createWorkout(name) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO workout (name) VALUES (?);`, [name], (err) => {
            if (err) {
                reject(err);
            }

            resolve('Success');
        });
    });
}

function createActivity(name, description, duration) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO activity (name, description, duration) VALUES (?, ?, ?);`, [name, description, duration], (err) => {
            if (err) {
                reject(err);
            }

            resolve(this.lastID);
        });
    });
}

function addActivityToWorkout(workoutId, activityId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO workout_activity (workout_id, activity_id) VALUES (?, ?);`, [workoutId, activityId], (err) => {
            if (err) {
                reject(err);
            }

            resolve('Success');
        });
    });
}

function removeActivityFromWorkout(workoutId, activityId) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM workout_activity WHERE workout_id = ? AND activity_id = ?;`, [workoutId, activityId], (err) => {
            if (err) {
                reject(err);
            }

            resolve('Success');
        });
    });
}

function deleteActivity(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM activity WHERE id = ?;`, [id], (err) => {
            if (err) {
                reject(err);
            }

            resolve('Success');
        });
    });
}

function deleteWorkout(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM workout WHERE id = ?;`, [id], (err) => {
            if (err) {
                reject(err);
            }

            resolve('Success');
        });
    });
}

module.exports = {
    getWorkouts,
    getWorkoutData,
    getActivitiesForWorkout,

    createWorkout,
    createActivity,
    addActivityToWorkout,

    removeActivityFromWorkout,
    deleteActivity,
    deleteWorkout
};