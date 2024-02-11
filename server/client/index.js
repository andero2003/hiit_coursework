async function fetchWorkouts() {
    const workouts = await fetch(
        'http://localhost:8080/workout/',
    );
    console.log(workouts);
    const data = await workouts.json();

    console.log(data);

    const elem = document.createElement('p');
    elem.textContent = JSON.stringify(data);
    document.body.appendChild(elem);
}

fetchWorkouts();