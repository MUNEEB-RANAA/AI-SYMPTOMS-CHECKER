(function () {
    function $(id) { return document.getElementById(id); }
    function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e) { return fallback; } }
    function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
    function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function activeStatus(status) { return !['Completed', 'Cancelled', 'Missed'].includes(String(status || 'Waiting')); }
    function currentPatient() { return read('loggedInPatient', null); }
    function currentDoctor() { return read('loggedInDoctor', null); }
    function updatePatientVisit(patient) {
        if (!patient || !patient.email) return patient;
        const users = read('patientUsers', []);
        const email = String(patient.email).toLowerCase();
        const i = users.findIndex(u => String(u.email).toLowerCase() === email);
        const now = new Date().toLocaleString();
        if (i >= 0) {
            users[i].dashboardVisits = Number(users[i].dashboardVisits || 0) + 1;
            users[i].lastDashboardVisit = now;
            write('patientUsers', users);
            localStorage.setItem('loggedInPatient', JSON.stringify(users[i]));
            return users[i];
        }
        return patient;
    }

    function updateDoctorVisit(doctor) {
        if (!doctor || !doctor.email) return doctor;
        const apps = read('doctorApplications', []);
        const email = String(doctor.email).toLowerCase();
        const i = apps.findIndex(d => String(d.email).toLowerCase() === email || d.id === doctor.id);
        const now = new Date().toLocaleString();
        if (i >= 0) {
            apps[i].dashboardVisits = Number(apps[i].dashboardVisits || 0) + 1;
            apps[i].lastDashboardVisit = now;
            write('doctorApplications', apps);
            localStorage.setItem('loggedInDoctor', JSON.stringify(apps[i]));
            return apps[i];
        }
        return doctor;
    }

    function appointmentSort(a, b) { return Number(a.sortTime || 0) - Number(b.sortTime || 0); }

    function queueForDoctor(doctorName) {
        return read('appointmentRequests', [])
            .filter(a => String(a.doctor || '').trim() === String(doctorName || '').trim() && activeStatus(a.status))
            .sort(appointmentSort);
    }

    function calculateTokenStatus(token) {
        const appts = read('appointmentRequests', []);
        const found = appts.find(a => String(a.appointmentToken || a.token || '').toLowerCase() === String(token || '').toLowerCase());
        if (!found) return null;
        const queue = queueForDoctor(found.doctor);
        const index = queue.findIndex(a => String(a.appointmentToken || a.token || '') === String(found.appointmentToken || found.token || ''));
        const ahead = index < 0 ? 0 : index;
        const current = queue[0];
        const baseWait = 15;
        let message = '';
        let visualStatus = found.status || 'Waiting';
        if (!activeStatus(found.status)) {
            message = `Your appointment status is ${found.status}.`;
        } else if (found.status === 'In Consultation') {
            message = 'Your consultation is currently in progress.';
            visualStatus = 'In Consultation';
        } else if (ahead === 0) {
            message = 'Your turn is now. Please join the consultation or stay ready.';
            visualStatus = 'Current Token';
        } else if (ahead === 1) {
            message = 'You are next. Please stay ready for consultation.';
            visualStatus = 'Next Patient';
        } else {
            message = `${ahead} patient(s) are before you. Estimated wait is ${ahead * baseWait} minutes.`;
            visualStatus = 'Waiting';
        }
        return { found, queue, current, ahead, estimatedWait: ahead * baseWait, visualStatus, message };
    }

    function filteredByPatient(list, patient) {
        if (!patient) return [];
        const email = String(patient.email || '').toLowerCase();
        const phone = String(patient.phone || '').replace(/\D/g, '');
        const name = String(patient.name || '').toLowerCase();
        return list.filter(item => {
            const itemEmail = String(item.patientEmail || item.email || '').toLowerCase();
            const itemPhone = String(item.phone || '').replace(/\D/g, '');
            const itemName = String(item.patient || item.name || '').toLowerCase();
            return (email && itemEmail === email) || (phone && itemPhone === phone) || (name && itemName === name);
        });
    }

    function renderPatientDashboardPortal() {
        const root = $('patient-dashboard-root');
        if (!root) return;
        let patient = currentPatient();
        if (!patient || !patient.email) {
            root.innerHTML = `<div class="glass-card portal-login-required"><h3>Login Required</h3><p>Please login or create a patient account first. After login, your personal dashboard will show appointments, token status, history, and orders.</p><a class="btn btn-primary" href="login.html">Open Login Page</a></div>`;
            return;
        }
        patient = updatePatientVisit(patient);
        const allHistory = read('patientHealthHistory', []);
        const allApps = read('appointmentRequests', []);
        const allMeds = read('medicineOrders', []);
        const allLabs = read('labTestRequests', []);
        const history = filteredByPatient(allHistory, patient);
        const apps = filteredByPatient(allApps, patient).sort((a,b)=>Number(b.sortTime||0)-Number(a.sortTime||0));
        const meds = filteredByPatient(allMeds, patient);
        const labs = filteredByPatient(allLabs, patient);
        const urlToken = new URLSearchParams(location.search).get('token') || localStorage.getItem('lastAppointmentToken') || '';

        const historyHTML = history.length ? history.map(h => `<div class="dashboard-row"><b>${esc(h.patient || patient.name)}</b><span>${esc(h.createdAt)}</span><p>${esc(h.symptoms)}</p><small>Timeline: ${esc(h.duration)} | Mode: ${esc(h.mode)} | Risk: ${esc(h.risk)} | Specialist: ${esc(h.specialist)}</small></div>`).join('') : '<p class="empty-note">No symptom history yet.</p>';
        const appHTML = apps.length ? apps.map(a => {
            const status = calculateTokenStatus(a.appointmentToken || a.token) || {ahead:0, estimatedWait:0, visualStatus:a.status || 'Waiting', message:'Status available in token checker.'};
            return `<div class="dashboard-row"><b>${esc(a.appointmentToken || a.token || 'Appointment')}</b><span>${esc(status.visualStatus)}</span><p>${esc(a.doctor)} | ${esc(a.time)} | ${esc(a.method)}</p><small>Queue No: ${esc(a.queueNumber || '')} | Before You: ${status.ahead} | Wait: ${status.estimatedWait} min | Reports: ${esc((a.reports || []).join(', ') || 'No reports')}</small><a href="patient-dashboard.html?token=${encodeURIComponent(a.appointmentToken || a.token || '')}">Check Token</a></div>`;
        }).join('') : '<p class="empty-note">No appointments yet.</p>';
        const orderHTML = [...meds.map(o=>({...o,type:'Medicine'})), ...labs.map(o=>({...o,type:'Lab'}))].map(o => `<div class="dashboard-row"><b>${esc(o.trackingId || 'Tracking')}</b><span>${esc(o.status || 'Pending')}</span><p>${esc(o.type)} | ${esc(o.patient || patient.name)} | ${esc(o.partner || o.lab || '')}</p><a href="order-tracking.html?tracking=${encodeURIComponent(o.trackingId || '')}">Track</a></div>`).join('') || '<p class="empty-note">No orders yet.</p>';

        root.innerHTML = `
            <div class="dashboard-stats-grid portal-profile-stats">
                <div><b>${history.length}</b><span>Health Checks</span></div>
                <div><b>${apps.length}</b><span>My Appointments</span></div>
                <div><b>${meds.length + labs.length}</b><span>Orders / Tests</span></div>
                <div><b>${Number(patient.dashboardVisits || 0)}</b><span>Dashboard Visits</span></div>
            </div>
            <section class="glass-card portal-profile-card">
                <div><span class="section-subtitle">Logged in Patient</span><h3>${esc(patient.name)}</h3><p>${esc(patient.email)} | ${esc(patient.phone)}</p><small>Patient ID: ${esc(patient.id || 'PATIENT')}</small></div>
                <button class="btn btn-secondary" id="patient-logout-btn" type="button">Logout</button>
            </section>
            <section class="glass-card token-checker-card">
                <span class="section-subtitle">Appointment Token System</span>
                <h3>Check My Consultation Turn</h3>
                <p class="admin-muted">Enter your appointment token to know current token, patients before you, estimated waiting time, and consultation status.</p>
                <div class="input-row token-row">
                    <div class="input-group"><label for="patient-token-input">Appointment Token</label><input id="patient-token-input" type="text" value="${esc(urlToken)}" placeholder="APT-123456"></div>
                    <button class="btn btn-primary" id="patient-token-check-btn" type="button">Check Token Status</button>
                </div>
                <div id="patient-token-result" class="token-result-box"></div>
            </section>
            <div class="portal-grid">
                <section class="glass-card"><h3>My Health History</h3>${historyHTML}</section>
                <section class="glass-card"><h3>My Appointments & Reports</h3>${appHTML}</section>
                <section class="glass-card"><h3>My Order Tracking</h3>${orderHTML}</section>
            </div>`;
        $('patient-logout-btn').addEventListener('click', function(){ localStorage.removeItem('loggedInPatient'); localStorage.removeItem('currentUserRole'); location.href='login.html'; });
        $('patient-token-check-btn').addEventListener('click', renderPatientTokenResult);
        if (urlToken) renderPatientTokenResult();
    }

    function renderPatientTokenResult() {
        const box = $('patient-token-result');
        const input = $('patient-token-input');
        if (!box || !input) return;
        const token = input.value.trim();
        const result = calculateTokenStatus(token);
        if (!token) { box.innerHTML = '<p class="empty-note">Please enter appointment token.</p>'; return; }
        if (!result) { box.innerHTML = `<div class="token-status-card status-warning"><h4>No record found</h4><p>No appointment found for token <strong>${esc(token)}</strong>.</p></div>`; return; }
        const a = result.found;
        box.innerHTML = `<div class="token-status-card">
            <div class="token-status-top"><h4>${esc(result.visualStatus)}</h4><span>${esc(a.appointmentToken || a.token)}</span></div>
            <div class="token-detail-grid">
                <p><strong>Patient:</strong> ${esc(a.patient)}</p>
                <p><strong>Doctor:</strong> ${esc(a.doctor)}</p>
                <p><strong>Consultation Time:</strong> ${esc(a.time)}</p>
                <p><strong>Current Token:</strong> ${esc(result.current ? (result.current.appointmentToken || result.current.token) : 'No active token')}</p>
                <p><strong>Your Queue No:</strong> ${esc(a.queueNumber || '')}</p>
                <p><strong>Patients Before You:</strong> ${result.ahead}</p>
                <p><strong>Estimated Wait:</strong> ${result.estimatedWait} minutes</p>
                <p><strong>Status:</strong> ${esc(a.status || 'Waiting')}</p>
            </div>
            <p class="token-message">${esc(result.message)}</p>
            <a class="btn btn-primary" href="consultation.html?doctor=${encodeURIComponent(a.doctor || '')}&time=${encodeURIComponent(a.time || '')}">Open Consultation Page</a>
        </div>`;
    }

    function renderDoctorDashboardPortal() {
        const root = $('doctor-dashboard-root');
        if (!root) return;
        let doctor = currentDoctor();
        if (!doctor || !doctor.email) {
            root.innerHTML = `<div class="glass-card portal-login-required"><h3>Doctor Login Required</h3><p>Approved doctors can login with email and password to view only their own appointments and queue.</p><a class="btn btn-primary" href="login.html">Doctor Login</a><a class="btn btn-secondary" href="doctor-registration.html">Register as Doctor</a></div>`;
            return;
        }
        doctor = updateDoctorVisit(doctor);
        const all = read('appointmentRequests', []);
        const apps = all.filter(a => String(a.doctor || '').trim().toLowerCase() === String(doctor.name || '').trim().toLowerCase()).sort(appointmentSort);
        const active = apps.filter(a => activeStatus(a.status));
        const rows = apps.length ? apps.map(a => {
            const idx = all.findIndex(x => (x.appointmentToken || x.token) === (a.appointmentToken || a.token));
            return `<div class="dashboard-row"><b>${esc(a.patient)} - ${esc(a.appointmentToken || a.token || '')}</b><span>${esc(a.status || 'Waiting')}</span><p>${esc(a.reason || '')}</p><small>Time: ${esc(a.time)} | Method: ${esc(a.method)} | Reports: ${esc((a.reports || []).join(', ') || 'No reports uploaded')}</small><div class="mini-actions"><button data-idx="${idx}" data-status="Waiting">Waiting</button><button data-idx="${idx}" data-status="Next Patient">Next</button><button data-idx="${idx}" data-status="In Consultation">Start</button><button data-idx="${idx}" data-status="Completed">Complete</button><button data-idx="${idx}" data-status="Cancelled">Cancel</button></div></div>`;
        }).join('') : '<p class="empty-note">No appointment requests for your profile yet.</p>';
        const current = active[0];
        const currentCard = current ? `<div class="token-status-card"><div class="token-status-top"><h4>Current Queue</h4><span>${esc(current.appointmentToken || current.token)}</span></div><p><strong>Current Patient:</strong> ${esc(current.patient)}</p><p><strong>Status:</strong> ${esc(current.status || 'Waiting')}</p><p><strong>Queue No:</strong> ${esc(current.queueNumber || '')}</p><div class="mini-actions"><button id="doctor-call-next">Mark Next Patient</button><button id="doctor-start-current">Start Consultation</button><button id="doctor-complete-current">Complete Current</button></div></div>` : '<p class="empty-note">No active queue.</p>';
        root.innerHTML = `<div class="dashboard-stats-grid"><div><b>${apps.length}</b><span>My Requests</span></div><div><b>${active.length}</b><span>Active Queue</span></div><div><b>${apps.filter(a=>a.status==='Completed').length}</b><span>Completed</span></div><div><b>${Number(doctor.dashboardVisits || 0)}</b><span>Dashboard Visits</span></div></div><section class="glass-card portal-profile-card"><div><span class="section-subtitle">Logged in Doctor</span><h3>${esc(doctor.name)}</h3><p>${esc(doctor.specialization)} | ${esc(doctor.email)}</p><small>Application ID: ${esc(doctor.id)}</small></div><button class="btn btn-secondary" id="doctor-logout-btn" type="button">Logout</button></section><section class="glass-card"><h3>Queue Control</h3>${currentCard}</section><section class="glass-card"><h3>My Appointments & Uploaded Reports</h3>${rows}</section>`;
        $('doctor-logout-btn').addEventListener('click', function(){ localStorage.removeItem('loggedInDoctor'); localStorage.removeItem('currentUserRole'); location.href='login.html'; });
        root.querySelectorAll('button[data-status]').forEach(btn => btn.addEventListener('click', function(){ updateAppointmentStatus(Number(this.dataset.idx), this.dataset.status); }));
        if ($('doctor-call-next')) $('doctor-call-next').addEventListener('click', function(){ if(current) updateAppointmentStatus(all.findIndex(x => (x.appointmentToken || x.token) === (current.appointmentToken || current.token)), 'Next Patient'); });
        if ($('doctor-start-current')) $('doctor-start-current').addEventListener('click', function(){ if(current) updateAppointmentStatus(all.findIndex(x => (x.appointmentToken || x.token) === (current.appointmentToken || current.token)), 'In Consultation'); });
        if ($('doctor-complete-current')) $('doctor-complete-current').addEventListener('click', function(){ if(current) updateAppointmentStatus(all.findIndex(x => (x.appointmentToken || x.token) === (current.appointmentToken || current.token)), 'Completed'); });
    }

    function updateAppointmentStatus(index, status) {
        const list = read('appointmentRequests', []);
        if (list[index]) {
            list[index].status = status;
            list[index].statusUpdatedAt = new Date().toLocaleString();
            write('appointmentRequests', list);
            renderDoctorDashboardPortal();
        }
    }

    window.PortalSystem = {
        renderPatientDashboardPortal,
        renderDoctorDashboardPortal,
        calculateTokenStatus,
        read,
        write,
        esc
    };

    document.addEventListener('DOMContentLoaded', function () {
        if ($('patient-dashboard-root')) renderPatientDashboardPortal();
        if ($('doctor-dashboard-root')) renderDoctorDashboardPortal();
    });
})();
