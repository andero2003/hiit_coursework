import express from 'express';
import * as database from './src/services/database.js';

const app = express();
const port = 8080;

const workoutRouter = express.Router();
app.use('/workout', workoutRouter);
app.use(express.static('client', { extensions: ['html'] }));

const activityRouter = express.Router();
app.use('/activity', activityRouter);

// Get all activities
activityRouter.get('/', express.json(), async (req, res) => {
    if (req.query.ids) {
        console.log('Getting activities by IDs');
        const activities = await database.getActivitiesData(req.query.ids.split(','));
        res.json(activities);
    } else {
        console.log('Getting all activities');
        const activities = await database.getActivities();
        res.json(activities);
    }
});

// Create new activity
activityRouter.post('/', express.json(), async (req, res) => {
    const status = await database.createActivity(req.body.name, req.body.description, req.body.duration, req.body.imageUrl);
    res.json(status);
});

// Update activity
activityRouter.patch('/:id', express.json(), async (req, res) => {
    res.json(await database.updateActivity(req.params.id, req.body));
});

// Delete activity
activityRouter.delete('/:id', async (req, res) => {
    const status = await database.deleteActivity(req.params.id);
    res.json(status);
});

// Get all workouts
workoutRouter.get('/', async (req, res) => {
    const workouts = await database.getWorkouts();
    res.json(workouts);
});

// Get workout by ID
workoutRouter.get('/:id', async (req, res) => {
    const workoutData = await database.getWorkoutData(req.params.id);
    res.json(workoutData);
});

// Create new workout
workoutRouter.post('/', express.json(), async (req, res) => {
    const status = await database.createWorkout(req.body.name, req.body.description);
    res.json(status);
});

// Add activity to workout
workoutRouter.post('/:workoutId/activity/:activityId', express.json(), async (req, res) => {
    const newOrder = await database.addActivityToWorkout(req.params.workoutId, req.params.activityId);
    res.json(newOrder);
});

// Remove activity from workout
workoutRouter.delete('/:id/activity/:identifier', express.json(), async (req, res) => {
    const status = await database.removeActivityFromWorkout(req.params.id, req.params.identifier);
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
