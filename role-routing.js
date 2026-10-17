
(function () {
    function read(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
        catch (e) { return fallback; }
    }
    function getSession() {
        if (localStorage.getItem('currentUserRole') === 'admin' && sessionStorage.getItem('aiSymptomsAdminLoggedIn') === 'true') return { role:'admin', label:'Admin Panel', url:'admin.html' };
        if (read('loggedInPatient', null)) return { role:'patient', label:'Patient Dashboard', url:'patient-dashboard.html' };
        if (read('loggedInDoctor', null)) return { role:'doctor', label:'Doctor Dashboard', url:'doctor-dashboard.html' };
        if (read('loggedInPharmacy', null)) return { role:'pharmacy', label:'Pharmacy Dashboard', url:'pharmacy-dashboard.html' };
        if (read('loggedInLab', null)) return { role:'lab', label:'Lab Dashboard', url:'lab-dashboard.html' };
        return null;
    }
    function updateNavLogin() {
        const session = getSession();
        const links = document.querySelectorAll('.nav-login, a[href="login.html"]');
        links.forEach(link => {
            if (session) {
                link.textContent = 'My Dashboard';
                link.href = session.url;
                link.title = 'Open ' + session.label;
            } else if (link.classList.contains('nav-login') || link.getAttribute('href') === 'login.html') {
                link.textContent = 'Login';
                link.href = 'login.html';
                link.title = 'Login';
            }
        });
    }
    document.addEventListener('DOMContentLoaded', updateNavLogin);
})();
