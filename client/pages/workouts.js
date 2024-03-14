const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/workouts.css">
<h3>Workouts Page!</h3>
`

export function init(element) {
    element.innerHTML = content;
}