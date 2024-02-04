class ActiveWorkout {
    constructor(activities, onComplete) {
        this.activities = new Queue(activities);
        this.currentActivity = null;
        this.activityStartTime = null;

        this.startTime = new Date();
        this.elapsed = new Date(0);

        this.paused = false;
        this.finished = false;

        this.onComplete = onComplete;

        this.nextActivity();
        this.activityTimer = setInterval(() => {
            if (this.paused || this.finished) { return; }
            this.elapsed += new Date(1000);

            if (this.getActivityRemainingTime() <= 0) {
                this.nextActivity();
            }
        }, 1000);
    }

    // Time handling

    pause() {
        // Don't pause if the workout is already paused
        if (this.paused) { return; }

        this.paused = true;
    }

    resume() {
        // Don't resume if the workout is already running
        if (!this.paused) { return; }

        this.paused = false;
    }

    stop() {
        // Don't stop if the workout is already finished
        if (this.finished) { return; }

        this.finished = true;
        this.dispose();

        // TODO pass in workout stats and other data to the callback
        this.onComplete({
            startTime: this.startTime,
            endTime: new Date(),
        });
    }

    // Activities

    nextActivity() {
        // Don't move to the next activity if the workout is paused or finished
        if (this.paused || this.finished) { return; }

        // Dequeue the next activity
        const activity = this.activities.dequeue();

        // If there are no more activities, finish the workout
        if (!activity) {
            this.stop();
            return;
        }

        this.currentActivity = activity;
        this.activityStartTime = new Date();
    }

    getCurrentActivity() {
        return this.currentActivity;
    }

    getActivityRemainingTime() {
        if (!this.currentActivity) { return 0; }

        const elapsed = new Date() - this.activityStartTime;
        const remaining = this.currentActivity.duration - elapsed;

        return remaining;
    }

    // Disposal

    dispose() {
        // Clear the activity timer if exists
        if (!this.activityTimer) { return; };
        clearInterval(this.activityTimer);
    }
}