CREATE TABLE IF NOT EXISTS workout (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT 'New workout',
    description TEXT DEFAULT 'No description',
    activities JSON DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    imageUrl TEXT DEFAULT 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/a93c82108677535.5fc3684e78f67.gif',
    duration INTEGER DEFAULT 30
);
CREATE TABLE IF NOT EXISTS workoutHistory (
    id TEXT PRIMARY KEY,
    workoutId TEXT,
    date TEXT,
    startTime TEXT,
    endTime TEXT
);
INSERT INTO activity (id, name, description, imageUrl, duration)
VALUES (
        '1',
        'Squats',
        'Stand with feet shoulder-width apart. Lower down as if sitting in a chair, keeping your knees behind your toes. Stand back up to the starting position.',
        'https://i.gifer.com/VUFn.gif',
        45
    );
INSERT INTO activity (id, name, description, imageUrl, duration)
VALUES (
        '2',
        'Jumping Jacks',
        'Start with your feet together and hands at your sides. Jump up, spreading your feet beyond hip-width apart and bringing your arms above your head, nearly touching. Jump back to the starting position.',
        'https://cdn.dribbble.com/users/2931468/screenshots/5720362/jumping-jack.gif',
        30
    );
INSERT INTO activity (id, name, description, imageUrl, duration)
VALUES (
        '3',
        'Plank',
        'Lie face down with forearms on the ground and elbows beneath your shoulders. Push off the floor, raising up onto toes and resting on the elbows. Keep your back flat, in a straight line from head to heels.',
        'https://cdn.jefit.com/assets/img/exercises/gifs/631.gif',
        60
    );
INSERT INTO activity (id, name, description, imageUrl, duration)
VALUES (
        '4',
        'High Knees',
        'Stand in place with your feet hip-width apart. Quickly drive your right knee up to meet your right hand, then the left knee to the left hand. Continue the motion in a running motion while staying in place.',
        'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/highkneerun-1457044203.gif',
        30
    );
INSERT INTO activity (id, name, description, imageUrl, duration)
VALUES (
        '5',
        'Push-Ups',
        'Start in a plank position with your hands slightly wider than your shoulders. Lower your body until your chest nearly touches the floor. Push yourself back up to the starting position.',
        'https://gmb.io/wp-content/uploads/2019/01/full-push-up.gif',
        45
    );
INSERT INTO activity (id, name, description, imageUrl, duration)
VALUES (
        '6',
        'Lunges',
        'Stand with your feet together. Take a step forward with one leg, lowering your hips until both knees are bent at about a 90-degree angle. Make sure your front knee is directly above your ankle.',
        'https://gifdb.com/images/high/leg-exercise-forward-lunges-k8dykjjkhexdzean.gif',
        45
    );
INSERT INTO activity (id, name, description, imageUrl, duration)
VALUES (
        '7',
        'Rest',
        'Take a moment to breathe and prepare for the next activity. Use this time to hydrate and stretch if needed.',
        'https://media3.giphy.com/media/A6aHBCFqlE0Rq/200w.gif?cid=6c09b952bn31ec0j7544tmdrgnjjx7r5i9dwwh18qgfhshbn&ep=v1_gifs_search&rid=200w.gif&ct=g',
        30
    );

INSERT INTO workout (id, name, description, activities)
VALUES (
        '1',
        'Morning Routine',
        'Start your day with this energizing workout routine.',
        '["1 1", "2 2", "3 3", "4 4", "5 5", "6 6", "7 7"]'
    );

