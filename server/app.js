import express from 'express';
import * as database from './src/services/database.js';

const app = express();
const port = 8080;

const workoutRouter = express.Router();
app.use('/workout', workoutRouter);
app.use(express.static('client', { extensions: ['html'] }));

// Get all workouts
workoutRouter.get('/', async (req, res) => {
    const workouts = await database.getWorkouts();
    res.json(workouts);
});

// Get workout by ID
workoutRouter.get('/:id', async (req, res) => {
    const workoutData = await database.getWorkoutData(req.params.id);
    const activities = await database.getActivitiesForWorkout(req.params.id);
    res.json({ ...workoutData, activities });
});

// Create new workout
workoutRouter.post('/', express.json(), async (req, res) => {
    const status = await database.createWorkout(req.body.name, req.body.description);
    res.json(status);
});

// Add activity to workout
workoutRouter.post('/:id/activity', async (req, res) => {
    const activity = await database.createActivity(req.body.name, req.body.description, req.body.duration);
    const status = await database.addActivityToWorkout(req.params.id, activity.id);
    res.json(status);
});

// Remove activity from workout
workoutRouter.delete('/:id/activity/:activityId', async (req, res) => {
    const status = await database.removeActivityFromWorkout(req.params.id, req.params.activityId);
    res.json(status);
});

// Delete activity
workoutRouter.delete('/activity/:id', async (req, res) => {
    const status = await database.deleteActivity(req.params.id);
    res.json(status);
});

// Delete workout
workoutRouter.delete('/:id', async (req, res) => {
    const status = await database.deleteWorkout(req.params.id);
    res.json(status);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
