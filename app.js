import express from 'express';
import * as database from './src/services/database.js';

const app = express();
const port = 8080;

const workoutRouter = express.Router();
app.use('/workout', workoutRouter);
app.use(express.static('client', { extensions: ['html'] }));

const activityRouter = express.Router();
app.use('/activity', activityRouter);

const historyRouter = express.Router();
app.use('/history', historyRouter);

// Get all activities
activityRouter.get('/', express.json(), async (req, res) => {
    if (req.query.ids) {
        const activities = await database.getActivitiesData(req.query.ids.split(','));
        res.json(activities);
    } else {
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

// Update workout
workoutRouter.patch('/:id', express.json(), async (req, res) => {
    res.json(await database.updateWorkout(req.params.id, req.body));
});

// Create new workout
workoutRouter.post('/', express.json(), async (req, res) => {
    const status = await database.createWorkout(req.body.name, req.body.description);
    res.json(status);
});

// Add activity to workout
workoutRouter.post('/:workoutId/activity/:activityId', express.json(), async (req, res) => {
    const identifier = await database.addActivityToWorkout(req.params.workoutId, req.params.activityId);
    res.json(identifier);
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

historyRouter.post('/', express.json(), async (req, res) => {
    const status = await database.addWorkoutRecordToHistory(req.body.workoutId, req.body.date, req.body.start, req.body.end);
    res.json(status);
});

historyRouter.get('/', async (req, res) => {
    const history = await database.getWorkoutHistory();
    res.json(history);
});

historyRouter.delete('/:id', async (req, res) => {
    const status = await database.deleteWorkoutRecordFromHistory(req.params.id);
    res.json(status);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
