# HIIT up2109688

## Key Features
This section introduces the main functionalities of the HIIT web application.

### Custom Activity Builder
Users can create bespoke HIIT workouts by specifying activities such as squats, lunges, and rest periods. Each activity can be named, described, assigned a specific duration. The user may also provide an image (e.g GIF) to demonstrate the activity. This feature is accessible through the main navigation bar where users can click on 'Activities' to edit their activities.

### Custom Workout Builder
Users can create HIIT workouts by selecting activities from the custom activity list.

### Dashboard To Start Workout
The dashboard displays an option to start a workout. User can select any of the workouts created by them and start the workout. The workout will start with a countdown timer and then the activities will be displayed one by one, with a timer progress bar and the image of the activity. User may pause or stop the workout at any time.

### History
All workouts completed by the user are stored in the history section. The user can view the name and date of the workout, as well as the total duration.

## Design Decisions

### StateLib Framework
A custom-built StateLib framework was implemented to manage the state of the application. 
The framework provides a simple `State` object, as well as a `CompoundState` object, which updates whenever any of its child states change. This allows the UI components to subscribe to the state changes and update accordingly. This ensures that the UI is always in sync with the state of the application. A single source of truth is maintained, which makes the application more predictable and easier to debug.

### Icons
Icons were used for common buttons such as play, pause, and stop. This makes the UI more intuitive and user-friendly. The icons are from Rhos' Vector Icons pack, for which I have a license and have used in previous projects. This gives it a more game-y feel, relevant to my background in game development. 

## AI Usage
GitHub Copilot was used to generate code snippets through the whole development process. GPT-4 helped with more complex logic, as well as generating docstrings for StateLib.

## Enhancements Post-Prototype
Post-prototype, several improvements were made.
- Implemented my own custom StateLib framework to manage the state of the application.
- Added a history section to store all the workouts completed by the user.
- Majorly improved the UI/UX of the application, making it more user-friendly on both desktop and mobile devices.