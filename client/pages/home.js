const content = `
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/pages/home.css">
<h3>Welcome!</h3>
`

export function init(element) {
    element.innerHTML = content;
}