import { getActivities, getWorkoutHistory, getWorkouts } from "./modules/NetworkingService.js";
import { StateManager } from "./modules/StateLib.js";

const pages = [
    {
        name: 'home',
        title: 'Home',
        image: './assets/Home 64.png',
    },
    {
        name: 'workouts',
        title: 'Workouts',
        image: './assets/Dumbbell 64.png',
    },
    {
        name: 'activities',
        title: 'Activities',
        image: './assets/Strong Arm 64.png',
    },
    {
        name: 'history',
        title: 'History',
        image: './assets/Calendar 64.png',
    }
]

function createSidebarButton(page) {
    const sidebarButton = document.createElement('button');
    sidebarButton.innerHTML = `
        <img src="${page.image}" />
        ${page.title}
    `;

    sidebarButton.addEventListener('click', () => {
        StateManager.currentPage.value = page.name;
        StateManager.sidebarOpen.value = false;
    });

    document.querySelector('#sidebar').append(sidebarButton);
}

async function setupPages() {
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        createSidebarButton(page);

        const pageElement = document.createElement('page-element');
        pageElement.setAttribute('id', `section-${page.name}`);
        pageElement.setAttribute('name', page.name);
        pageElement.setAttribute('title', page.title);

        const div = document.createElement('div');
        div.slot = 'content';

        // load in the page specific content
        const module = await import(`./pages/${page.name}.js`);
        module.init(div);

        pageElement.shadowRoot.querySelector('slot').append(div);

        // inject reactive state
        pageElement.hidden = StateManager.currentPage.value !== page.name;
        StateManager.currentPage.onChange((newPage) => {
            pageElement.hidden = newPage !== page.name;
        });

        document.querySelector('body').append(pageElement);
    }
}

setupPages();

// Helper functions

function showSidebar() {
    StateManager.sidebarOpen.value = true;
}

function hideSidebar() {
    StateManager.sidebarOpen.value = false;
}

//

function setupSidebar() {
    const sidebar = document.querySelector('#sidebar');

    StateManager.sidebarOpen.onChange((value) => {
        sidebar.classList.toggle('open', value);
    });

    let touchStart = 0;
    let touchEnd = 0;
    document.addEventListener('touchstart', (e) => {
        touchStart = e.touches[0].clientX;
    });

    document.addEventListener('touchend', (e) => {
        touchEnd = e.changedTouches[0].clientX;
        if (touchStart - touchEnd > 50) {
            hideSidebar();
        } else if (touchEnd - touchStart > 50) {
            showSidebar();
        } else {
            if (touchEnd > window.innerWidth * 0.65) {
                hideSidebar();
            }
        }
    });
}

setupSidebar();

async function fetchData() {
    await getActivities();
    await getWorkouts();
    await getWorkoutHistory();
}

fetchData();

const modal = document.createElement('dialog');
modal.innerHTML = `
    <h1>Welcome to the Fitness App!</h1>
    <p>Click on the sidebar to navigate to different pages.</p>
    <p>Swipe from the left edge to open the sidebar on mobile.</p>
    <button>Close</button>
`;
document.body.append(modal);
//modal.showModal();