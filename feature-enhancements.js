
(function () {
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e) { return fallback; } }
    function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
    function riskFromSymptoms(symptoms, severity) {
        const s = String(symptoms || '').toLowerCase();
        const danger = ['chest pain','heart pain','shortness of breath','breathing','faint','unconscious','severe bleeding','stroke','left arm pain','confusion','seizure','blue lips'];
        const isDanger = Number(severity) >= 8 || danger.some(w => s.includes(w));
        const isModerate = Number(severity) >= 6 || ['fever','vomiting','diarrhea','blood pressure','sugar','pregnancy'].some(w => s.includes(w));
        if (isDanger) return {level:'Emergency / High Risk', color:'#ff4d4d', message:'Emergency risk detected. Please seek urgent medical help or visit nearest hospital immediately.'};
        if (isModerate) return {level:'Moderate Risk', color:'#ffd166', message:'Doctor consultation is recommended if symptoms continue or get worse.'};
        return {level:'Low Risk', color:'#00ff9d', message:'Mild symptoms. Monitor your condition and consult a doctor if symptoms continue.'};
    }
    function specialistFor(symptoms, mode) {
        const s = String(symptoms || '').toLowerCase();
        if (mode === 'Child' || s.includes('child') || s.includes('baby')) return 'Pediatrician';
        if (mode === 'Women' || s.includes('pregnancy') || s.includes('period') || s.includes('pcos')) return 'Gynecologist';
        if (s.includes('chest') || s.includes('heart') || s.includes('bp') || s.includes('blood pressure')) return 'Cardiologist';
        if (s.includes('skin') || s.includes('rash') || s.includes('allergy')) return 'Dermatologist';
        if (s.includes('headache') || s.includes('migraine') || s.includes('dizziness')) return 'Neurologist';
        if (s.includes('stomach') || s.includes('vomit') || s.includes('diarrhea')) return 'Gastroenterologist';
        return 'General Physician';
    }
    function addEmergencyAlert(data) {
        const dash = $('dashboard');
        if (!dash) return;
        const risk = riskFromSymptoms(data.symptoms, data.severity);
        const alertHTML = `<div class="emergency-risk-alert" style="border-color:${risk.color};">
            <div><span class="risk-dot" style="background:${risk.color};"></span><strong>${esc(risk.level)}</strong></div>
            <p>${esc(risk.message)}</p>
            <div class="risk-actions">
                <a href="appointment.html" class="btn btn-primary">Book Urgent Consultation</a>
                <a href="doctors.html" class="btn btn-secondary">Find Doctor</a>
                <a href="order-tracking.html" class="btn btn-secondary">Track Requests</a>
            </div>
        </div>`;
        if (!dash.querySelector('.emergency-risk-alert')) dash.insertAdjacentHTML('afterbegin', alertHTML);
    }
    function saveHealthHistory(data) {
        const list = read('patientHealthHistory', []);
        list.unshift(data);
        write('patientHealthHistory', list.slice(0, 30));
    }
    function initSymptomEnhancements() {
        const form = $('symptom-form');
        if (!form) return;
        form.addEventListener('submit', function () {
            const data = {
                id: 'HIS-' + Date.now().toString().slice(-6),
                patient: ($('name') || {}).value || 'Patient',
                age: ($('age') || {}).value || '',
                severity: ($('severity') || {}).value || '5',
                symptoms: ($('symptoms') || {}).value || '',
                duration: ($('symptom-duration') || {}).value || 'Not selected',
                mode: ($('patient-mode') || {}).value || 'Adult',
                language: ($('checker-lang') || {}).value || 'en',
                specialist: specialistFor(($('symptoms') || {}).value, ($('patient-mode') || {}).value),
                createdAt: new Date().toLocaleString()
            };
            const risk = riskFromSymptoms(data.symptoms, data.severity);
            data.risk = risk.level;
            data.riskMessage = risk.message;
            saveHealthHistory(data);
            setTimeout(() => addEmergencyAlert(data), 1200);
        });
    }
    function initHealthTools() {
        const bpBtn = $('check-bp-btn');
        if (bpBtn) bpBtn.addEventListener('click', function () {
            const sys = Number(($('bp-systolic') || {}).value || 0), dia = Number(($('bp-diastolic') || {}).value || 0);
            let status = 'Enter valid values.';
            if (sys && dia) {
                if (sys >= 180 || dia >= 120) status = 'Hypertensive crisis range. Please seek urgent medical help.';
                else if (sys >= 140 || dia >= 90) status = 'High blood pressure range. Doctor consultation is recommended.';
                else if (sys < 90 || dia < 60) status = 'Low blood pressure range. Monitor symptoms and consult doctor if dizzy or weak.';
                else status = 'Blood pressure looks within normal range.';
            }
            const box = $('bp-result'); box.hidden = false; box.innerHTML = `<strong>BP Result:</strong> ${esc(status)}`;
        });
        const sugarBtn = $('check-sugar-btn');
        if (sugarBtn) sugarBtn.addEventListener('click', function () {
            const type = ($('sugar-type') || {}).value || 'fasting'; const val = Number(($('sugar-value') || {}).value || 0);
            let status = 'Enter valid sugar value.';
            if (val) {
                if (type === 'hba1c') status = val >= 6.5 ? 'HbA1c is in diabetes range. Doctor review is recommended.' : val >= 5.7 ? 'HbA1c is in prediabetes range. Lifestyle and doctor advice recommended.' : 'HbA1c looks within normal range.';
                else if (type === 'fasting') status = val >= 126 ? 'Fasting sugar is high. Diabetes review is recommended.' : val >= 100 ? 'Fasting sugar is borderline high.' : 'Fasting sugar looks within normal range.';
                else status = val >= 200 ? 'Random sugar is high. Doctor review is recommended.' : 'Random sugar is not in critical range.';
            }
            const box = $('sugar-result'); box.hidden = false; box.innerHTML = `<strong>Sugar Result:</strong> ${esc(status)}`;
        });
        const womenBtn = $('women-guide-btn');
        if (womenBtn) womenBtn.addEventListener('click', function () {
            const topic = ($('women-topic') || {}).value || 'Women Health';
            const box = $('women-result'); box.hidden = false; box.innerHTML = `<strong>${esc(topic)}:</strong> Track symptoms, avoid self-medication, and consult a gynecologist if pain, bleeding, weakness, or repeated symptoms continue.`;
        });
        const childBtn = $('child-guide-btn');
        if (childBtn) childBtn.addEventListener('click', function () {
            const topic = ($('child-topic') || {}).value || 'Child Health';
            const box = $('child-result'); box.hidden = false; box.innerHTML = `<strong>${esc(topic)}:</strong> Use child-safe care only. Do not give adult medicine to children. Consult a pediatrician for correct dosage and treatment.`;
        });
    }
    function initDoctorAvailability() {
        document.querySelectorAll('.doctor-profile-card').forEach((card, i) => {
            if (card.querySelector('.availability-pill')) return;
            const statuses = [
                ['Available Now','available'], ['Next Slot Today','slot'], ['Busy - Follow Up','busy'], ['Emergency Consult','urgent']
            ];
            const st = statuses[i % statuses.length];
            const wrap = card.querySelector('.doctor-image-wrap') || card;
            const badge = document.createElement('span');
            badge.className = 'availability-pill ' + st[1];
            badge.textContent = st[0];
            wrap.appendChild(badge);
        });
    }
    function renderPatientDashboard() {
        const root = $('patient-dashboard-root'); if (!root) return;
        const history = read('patientHealthHistory', []), apps = read('appointmentRequests', []), meds = read('medicineOrders', []), labs = read('labTestRequests', []);
        const historyHTML = history.length ? history.map(h => `<div class="dashboard-row"><b>${esc(h.patient)}</b><span>${esc(h.createdAt)}</span><p>${esc(h.symptoms)}</p><small>Timeline: ${esc(h.duration)} | Mode: ${esc(h.mode)} | Risk: ${esc(h.risk)} | Specialist: ${esc(h.specialist)}</small></div>`).join('') : '<p class="empty-note">No symptom history yet.</p>';
        const appHTML = apps.length ? apps.map(a => `<div class="dashboard-row"><b>${esc(a.appointmentToken || a.token || 'Appointment')}</b><span>${esc(a.status || 'Pending')}</span><p>${esc(a.doctor)} | ${esc(a.time)} | ${esc(a.method)}</p><small>Reports: ${esc((a.reports || []).join(', ') || 'No reports')}</small></div>`).join('') : '<p class="empty-note">No appointments yet.</p>';
        const orderHTML = [...meds.map(o=>({...o,type:'Medicine'})), ...labs.map(o=>({...o,type:'Lab'}))].map(o => `<div class="dashboard-row"><b>${esc(o.trackingId || 'Tracking')}</b><span>${esc(o.status || 'Pending')}</span><p>${esc(o.type)} | ${esc(o.patient || '')} | ${esc(o.partner || o.lab || '')}</p><a href="order-tracking.html?tracking=${encodeURIComponent(o.trackingId || '')}">Track</a></div>`).join('') || '<p class="empty-note">No orders yet.</p>';
        root.innerHTML = `<div class="dashboard-stats-grid"><div><b>${history.length}</b><span>Health Checks</span></div><div><b>${apps.length}</b><span>Appointments</span></div><div><b>${meds.length + labs.length}</b><span>Orders/Tests</span></div></div><div class="portal-grid"><section class="glass-card"><h3>Health History</h3>${historyHTML}</section><section class="glass-card"><h3>Appointments & Reports</h3>${appHTML}</section><section class="glass-card"><h3>Order Tracking</h3>${orderHTML}</section></div>`;
    }
    function renderDoctorDashboard() {
        const root = $('doctor-dashboard-root'); if (!root) return;
        const apps = read('appointmentRequests', []);
        const rows = apps.length ? apps.map((a, i) => `<div class="dashboard-row"><b>${esc(a.patient)} - ${esc(a.appointmentToken || a.token || '')}</b><span>${esc(a.status || 'Pending')}</span><p>${esc(a.reason || '')}</p><small>Doctor: ${esc(a.doctor)} | Method: ${esc(a.method)} | Reports: ${esc((a.reports || []).join(', ') || 'No reports uploaded')}</small><div class="mini-actions"><button data-i="${i}" data-status="In Consultation">Start</button><button data-i="${i}" data-status="Completed">Complete</button><button data-i="${i}" data-status="Need Follow Up">Follow Up</button></div></div>`).join('') : '<p class="empty-note">No appointment requests yet.</p>';
        root.innerHTML = `<div class="dashboard-stats-grid"><div><b>${apps.length}</b><span>Total Requests</span></div><div><b>${apps.filter(a=>String(a.status).includes('Completed')).length}</b><span>Completed</span></div><div><b>${apps.filter(a=>String(a.reports||'').length).length}</b><span>With Reports</span></div></div><section class="glass-card"><h3>Doctor Appointments & Uploaded Reports</h3>${rows}</section>`;
        root.querySelectorAll('button[data-status]').forEach(btn => btn.addEventListener('click', function(){
            const list=read('appointmentRequests', []); const i=Number(this.dataset.i); if(list[i]) { list[i].status=this.dataset.status; write('appointmentRequests', list); renderDoctorDashboard(); }
        }));
    }
    function initOrderTracking() {
        const root = $('order-tracking-root'); if (!root) return;
        const input = $('tracking-input');
        input.value = new URLSearchParams(location.search).get('tracking') || localStorage.getItem('lastOrderTrackingId') || '';
        function render() {
            const q = input.value.trim().toLowerCase();
            const orders = [...read('medicineOrders', []).map(o=>({...o,type:'Medicine Order'})), ...read('labTestRequests', []).map(o=>({...o,type:'Lab Test'})), ...read('appointmentRequests', []).map(o=>({...o,type:'Appointment', trackingId:o.appointmentToken||o.token, partner:o.doctor}))];
            const filtered = q ? orders.filter(o => String(o.trackingId || '').toLowerCase().includes(q) || String(o.patient || '').toLowerCase().includes(q)) : orders;
            root.innerHTML = filtered.length ? filtered.map(o => `<div class="dashboard-row"><b>${esc(o.type)}: ${esc(o.trackingId || 'No ID')}</b><span>${esc(o.status || 'Pending')}</span><p>${esc(o.patient || '')} | ${esc(o.partner || o.lab || o.doctor || '')}</p><small>${esc(o.submittedAt || o.createdAt || o.date || '')}</small></div>`).join('') : '<p class="empty-note">No matching record found.</p>';
        }
        $('tracking-btn').addEventListener('click', render); render();
    }
    document.addEventListener('DOMContentLoaded', function(){
        initSymptomEnhancements(); initHealthTools(); initDoctorAvailability(); renderPatientDashboard(); renderDoctorDashboard(); initOrderTracking();
    });
})();
