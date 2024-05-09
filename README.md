# HIIT up2109688

## Getting Started
To run the application, run
`npm install`
`npm start`

## Key Features
This section introduces the main functionalities of the HIIT web application.

### Custom Activity Builder
Users can create bespoke HIIT workouts by specifying activities such as squats, lunges, and rest periods. Each activity can be named, described, assigned a specific duration. The user may also provide an image (e.g GIF) to demonstrate the activity. This feature is accessible through the main navigation bar where users can click on 'Activities' to edit their activities.

### Custom Workout Builder
Users can create HIIT workouts by selecting activities from the custom activity list. Workouts can be edited at any time, allowing users to add or remove activities. This feature is accessible through the main navigation bar where users can click on 'Workouts' to edit their workouts.

### Start Workout
The Start page displays an option to start a workout. User can select any of the workouts created by them and start the workout. The workout will start with a countdown timer and then the activities will be displayed one by one, with a timer progress bar and the image of the activity. User may pause or stop the workout at any time.

### History
All workouts completed by the user are stored in the history section. The user can view the name and date of the workout, as well as the total duration.

## Design Decisions

### StateLib Framework
A custom-built StateLib framework was implemented to manage the state of the application. 
The framework provides a simple `State` object, as well as a `CompoundState` object, which updates whenever any of its child states change. This allows the UI components to subscribe to the state changes and update accordingly. This ensures that the UI is always in sync with the state of the application. A single source of truth is maintained, which makes the application more predictable and easier to debug.
Inspired by the proposed concept of signals in JavaScript, as well as various state management libraries from my experience in Roblox game development.

### Separate Page files
Each page of the application is separated into its own `.js` and `.css` file. `index.js` calls a function to import these at runtime and set up the pages. This makes the codebase more modular and easier to maintain, should the application grow in size.

### Custom Elements
A `card-element` was created to display the activities and workouts in a consistent manner. A `page` element was created to keep styles encapsulated within each page's shadow DOM. This makes the code more readable and maintainable.

### Icons
Icons were used for common buttons such as play, pause, and stop. This makes the UI more intuitive and user-friendly. The icons are from Rhos' Vector Icons pack, for which I have a license and have used in previous projects. This gives it a more game-y feel, relevant to my background in game development. 

## AI Usage
GitHub Copilot was used to generate inline code snippets throughout majority of the development, speeding up the process of looking up syntax and structure, as well as generating docstrings for StateLib.
A fine tuned GPT-4 (with the coursework document fed into it, for more accurate and context-aware responses) occasionally helped with more complex logic, as well as general queries about coursework.
Both GPT-4 and GitHub Copilot were also used to structure the README file.

### Prompts

> List dummy activities I can add my to app, I need name, description and duration

1. Activity Name: Squats
    - Description: Stand with feet shoulder-width apart. Lower down as if sitting in a chair, keeping your knees behind your toes. Stand back up to the starting position.
    - Duration: 45 seconds
2. Activity Name: Jumping Jacks
    - Description: Start with your feet together and hands at your sides. Jump up, spreading your feet beyond hip-width apart and bringing your arms above your head, nearly touching. Jump back to the starting position.
    - ...

## Enhancements Post-Prototype
Post-prototype, several improvements were made.
- Implemented my own custom StateLib framework to manage the state of the application.
- Added a history section to store all the workouts completed by the user.
- Majorly improved the UI/UX of the application, making it more user-friendly on both desktop and mobile devices.