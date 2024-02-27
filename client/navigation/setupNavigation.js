function setupNavigation() {
    const workoutsPage = document.querySelector('#workoutsPage');
    const activitiesPage = document.querySelector('#activitiesPage');
    const toggleSidebar = document.querySelector('#toggleSidebar');

    let sidebarStatus = false;
    function updateSidebarVisibility() {
        const sidebar = document.querySelector('#sidebar');
        sidebar.style.width = sidebarStatus ? '60%' : '0px';
        sidebar.style.padding = sidebarStatus ? '12px 12px' : '12px 0px';
        toggleSidebar.style.left = sidebarStatus ? '67%' : '10px';
    }

    const showWorkouts = document.querySelector('#showWorkouts');
    showWorkouts.addEventListener('click', () => {
        workoutsPage.hidden = false;
        activitiesPage.hidden = true;
        sidebarStatus = false;
        updateSidebarVisibility();
    });

    const showActivities = document.querySelector('#showActivities');
    showActivities.addEventListener('click', () => {
        workoutsPage.hidden = true;
        activitiesPage.hidden = false;
        sidebarStatus = false;
        updateSidebarVisibility();
    });

    toggleSidebar.addEventListener('click', () => {
        sidebarStatus = !sidebarStatus;
        updateSidebarVisibility();
    });

    let touchStart = 0;
    let touchEnd = 0;
    document.addEventListener('touchstart', (e) => {
        touchStart = e.touches[0].clientX;
    });

    document.addEventListener('touchend', (e) => {
        touchEnd = e.changedTouches[0].clientX;
        if (touchStart - touchEnd > 50) {
            sidebarStatus = false;
            updateSidebarVisibility();
        } else if (touchEnd - touchStart > 50) {
            sidebarStatus = true;
            updateSidebarVisibility();
        } else {
            if (touchEnd > window.innerWidth * 0.65) {
                sidebarStatus = false;
                updateSidebarVisibility();
            }
        }
    });
}

setupNavigation();
