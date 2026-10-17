
(function () {
    function $(id) { return document.getElementById(id); }
    function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e) { return fallback; } }
    function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
    function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function now() { return new Date().toLocaleString(); }
    function id(prefix) { return prefix + '-' + Date.now().toString().slice(-6); }

    const defaultPartners = [
        {id:'PHR-DEMO-001', type:'pharmacy', status:'Selected', published:true, businessName:'Green Care Pharmacy', ownerName:'Demo Pharmacy Owner', email:'pharmacy@partner.com', phone:'0300 1112223', city:'Karachi', area:'North Nazimabad', license:'PHR-DEMO-001', delivery:'Yes', pickup:'Yes', available24:'No', commission:'20%', address:'Main Market, Karachi', password:'partner123', submittedAt:'Demo Data'},
        {id:'LAB-DEMO-001', type:'lab', status:'Selected', published:true, businessName:'City Diagnostic Lab', ownerName:'Demo Lab Manager', email:'lab@partner.com', phone:'0300 5556667', city:'Karachi', area:'Gulshan', tests:'CBC, Sugar, HbA1c, Lipid Profile, Thyroid, Urine Test', homeSampling:'Yes', reportUpload:'Yes', reportTime:'24 Hours', license:'LAB-DEMO-001', commission:'20%', address:'Diagnostic Road, Karachi', password:'partner123', submittedAt:'Demo Data'}
    ];

    function getApplications() { return read('partnerApplications', []); }
    function setApplications(list) { write('partnerApplications', list); }
    function getApprovedPartners(type) {
        const approved = read('approvedPartners', []);
        const apps = getApplications().filter(p => p.status === 'Selected' || p.published);
        const merged = [...defaultPartners, ...approved, ...apps];
        const seen = new Set();
        return merged.filter(p => {
            const key = (p.type || '') + '|' + (p.id || p.businessName || p.email);
            if (seen.has(key)) return false;
            seen.add(key);
            return (!type || p.type === type) && (p.status === 'Selected' || p.published);
        });
    }

    function saveApprovedPartner(partner) {
        const approved = read('approvedPartners', []);
        const clean = Object.assign({}, partner, { status:'Selected', published:true, publishedAt:now() });
        const idx = approved.findIndex(p => p.id === clean.id);
        if (idx >= 0) approved[idx] = clean;
        else approved.unshift(clean);
        write('approvedPartners', approved);
    }

    function statusClass(status) {
        const s = String(status || '').toLowerCase();
        if (s.includes('selected') || s.includes('approved') || s.includes('delivered') || s.includes('completed') || s.includes('report')) return 'selected';
        if (s.includes('reject') || s.includes('cancel')) return 'rejected';
        return 'pending';
    }

    function registerPartner(form, type) {
        const data = new FormData(form);
        const prefix = type === 'pharmacy' ? 'PHR' : 'LAB';
        const partner = {
            id: id(prefix),
            type,
            role: type,
            status:'Pending Review',
            published:false,
            businessName: data.get('businessName') || '',
            ownerName: data.get('ownerName') || '',
            email: String(data.get('email') || '').trim().toLowerCase(),
            phone: data.get('phone') || '',
            city: data.get('city') || '',
            area: data.get('area') || '',
            license: data.get('license') || '',
            delivery: data.get('delivery') || '',
            pickup: data.get('pickup') || '',
            available24: data.get('available24') || '',
            tests: data.get('tests') || '',
            homeSampling: data.get('homeSampling') || '',
            reportUpload: data.get('reportUpload') || '',
            reportTime: data.get('reportTime') || '',
            address: data.get('address') || '',
            password: data.get('password') || '',
            commission:'20%',
            submittedAt: now(),
            dashboardVisits:0
        };
        const file = form.querySelector('input[type="file"]');
        const save = (fileName) => {
            partner.documentName = fileName || 'No document uploaded';
            const apps = getApplications();
            const old = apps.find(p => String(p.email).toLowerCase() === partner.email && p.type === type);
            const box = $(type + '-partner-success');
            if (old) {
                box.hidden = false;
                box.innerHTML = `This ${type} email is already registered. Application ID: <strong>${esc(old.id)}</strong>. Status: <strong>${esc(old.status)}</strong>.`;
                return;
            }
            apps.unshift(partner);
            setApplications(apps);
            box.hidden = false;
            box.innerHTML = `${type === 'pharmacy' ? 'Pharmacy' : 'Lab'} partner application submitted successfully. Application ID: <strong>${esc(partner.id)}</strong>. Admin will review it. Login will open after approval.`;
            form.reset();
        };
        if (file && file.files && file.files[0]) save(file.files[0].name);
        else save('');
    }

    function initPartnerRegistration() {
        const pharmacyForm = $('pharmacy-partner-form');
        const labForm = $('lab-partner-form');
        if (pharmacyForm) pharmacyForm.addEventListener('submit', function(e){ e.preventDefault(); registerPartner(this, 'pharmacy'); });
        if (labForm) labForm.addEventListener('submit', function(e){ e.preventDefault(); registerPartner(this, 'lab'); });
    }

    function populatePartnerSelects() {
        const pharmacySelect = $('pharmacy-partner');
        if (pharmacySelect) {
            const partners = getApprovedPartners('pharmacy');
            pharmacySelect.innerHTML = partners.map(p => `<option value="${esc(p.businessName)}">${esc(p.businessName)} - ${esc(p.area || p.city || 'Partner')}</option>`).join('');
        }
        const labSelect = $('lab-partner');
        if (labSelect) {
            const partners = getApprovedPartners('lab');
            labSelect.innerHTML = partners.map(p => `<option value="${esc(p.businessName)}">${esc(p.businessName)} - ${esc(p.area || p.city || 'Partner')}</option>`).join('');
        }
    }

    function findPartnerByLogin(type, email, password) {
        email = String(email || '').trim().toLowerCase();
        const approved = getApprovedPartners(type);
        return approved.find(p => String(p.email || '').toLowerCase() === email && String(p.password || p.license || '') === String(password || ''));
    }

    function partnerApplicationStatus(type, email) {
        email = String(email || '').trim().toLowerCase();
        return getApplications().find(p => p.type === type && String(p.email || '').toLowerCase() === email);
    }

    function enhanceLoginRoleOptions() {
        const role = $('login-role');
        if (!role || role.querySelector('option[value="pharmacy"]')) return;
        role.insertAdjacentHTML('beforeend', '<option value="pharmacy">Pharmacy Partner</option><option value="lab">Lab Partner</option>');
        const title = document.querySelector('#patient-login-form h3');
        if (title) title.textContent = 'Patient / Doctor / Partner Login';
        const subtitle = document.querySelector('.service-hero .section-subtitle');
        if (subtitle && /Patient/.test(subtitle.textContent)) subtitle.textContent = 'Patient, Doctor & Partner Portal';
    }

    function partnerLoginBeforeOldHandler() {
        const form = $('patient-login-form');
        if (!form || form.dataset.partnerLoginPatched) return;
        form.dataset.partnerLoginPatched = 'true';
        form.addEventListener('submit', function(e) {
            const role = $('login-role') ? $('login-role').value : '';
            if (role !== 'pharmacy' && role !== 'lab') return;
            e.preventDefault();
            e.stopImmediatePropagation();
            const email = $('login-email').value.trim().toLowerCase();
            const password = $('login-password').value;
            const box = $('login-success');
            box.hidden = false;
            const partner = findPartnerByLogin(role, email, password);
            if (partner) {
                const storageKey = role === 'pharmacy' ? 'loggedInPharmacy' : 'loggedInLab';
                const dashboard = role === 'pharmacy' ? 'pharmacy-dashboard.html' : 'lab-dashboard.html';
                localStorage.setItem(storageKey, JSON.stringify(Object.assign({}, partner, { role })));
                localStorage.setItem('currentUserRole', role);
                localStorage.removeItem('loggedInPatient');
                localStorage.removeItem('loggedInDoctor');
                localStorage.removeItem(role === 'pharmacy' ? 'loggedInLab' : 'loggedInPharmacy');
                box.innerHTML = `${role === 'pharmacy' ? 'Pharmacy' : 'Lab'} partner login successful. Welcome <strong>${esc(partner.businessName)}</strong>. Redirecting to your dashboard...`;
                setTimeout(function(){ window.location.href = dashboard; }, 450);
                return;
            }
            const pending = partnerApplicationStatus(role, email);
            if (pending) {
                box.innerHTML = `Your ${role} partner application status is <strong>${esc(pending.status || 'Pending Review')}</strong>. Dashboard opens after admin approval.`;
            } else {
                box.innerHTML = `${role === 'pharmacy' ? 'Pharmacy' : 'Lab'} partner account not found. Please register from Partner With Us page first.`;
            }
        }, true);
    }

    function getPartnerOrders(type, partner) {
        const name = String(partner.businessName || '').toLowerCase();
        const email = String(partner.email || '').toLowerCase();
        const list = type === 'pharmacy' ? read('medicineOrders', []) : read('labTestRequests', []);
        return list.filter(o => {
            const p = String(o.partner || o.pharmacy || o.lab || '').toLowerCase();
            const pe = String(o.partnerEmail || '').toLowerCase();
            return !name || p.includes(name) || name.includes(p) || pe === email;
        });
    }

    function updateOrderStatus(type, trackingId, status) {
        const key = type === 'pharmacy' ? 'medicineOrders' : 'labTestRequests';
        const list = read(key, []);
        const item = list.find(o => o.trackingId === trackingId);
        if (item) {
            item.status = status;
            item.lastUpdated = now();
            write(key, list);
        }
    }

    function renderPartnerDashboard(type) {
        const root = $(type === 'pharmacy' ? 'pharmacy-dashboard-root' : 'lab-dashboard-root');
        if (!root) return;
        const storageKey = type === 'pharmacy' ? 'loggedInPharmacy' : 'loggedInLab';
        let partner = read(storageKey, null);
        if (!partner || !partner.email) {
            root.innerHTML = `<div class="glass-card portal-login-required"><h3>Login Required</h3><p>Please login as ${type === 'pharmacy' ? 'Pharmacy Partner' : 'Lab Partner'} first. Approved partners can open their personal dashboard.</p><a class="btn btn-primary" href="login.html">Open Login Page</a><a class="btn btn-secondary" href="partner-registration.html">Partner Registration</a></div>`;
            return;
        }
        partner.dashboardVisits = Number(partner.dashboardVisits || 0) + 1;
        partner.lastDashboardVisit = now();
        localStorage.setItem(storageKey, JSON.stringify(partner));
        const orders = getPartnerOrders(type, partner);
        const active = orders.filter(o => !/delivered|completed|cancelled/i.test(o.status || '')).length;
        const completed = orders.filter(o => /delivered|completed|report uploaded/i.test(o.status || '')).length;
        const statuses = type === 'pharmacy'
            ? ['Approved by Pharmacy','Rejected by Pharmacy','Pending Pharmacy Approval','Confirmed','Ready for Pickup','Out for Delivery','Delivered','Cancelled']
            : ['Approved by Lab','Rejected by Lab','Pending Lab Approval','Confirmed Slot','Sample Staff / Doctor Assigned','Sample Collected','Report Uploaded','Completed','Cancelled'];
        const rows = orders.length ? orders.map(o => `
            <article class="dashboard-row partner-order-row">
                <div>
                    <b>${esc(o.trackingId || 'Tracking')}</b>
                    <span class="admin-status ${statusClass(o.status)}">${esc(o.status || 'Pending')}</span>
                </div>
                <p><strong>Patient:</strong> ${esc(o.patient || o.name || '')} | <strong>Phone:</strong> ${esc(o.phone || '')}</p>
                <small>
                    ${esc(o.details || o.tests || o.medicines || 'No details')}<br>
                    <strong>Quantity:</strong> ${esc([o.quantity, o.quantityType].filter(Boolean).join(' ') || 'Not specified')} |
                    <strong>Method:</strong> ${esc(o.delivery || o.sampleMethod || '')}<br>
                    <strong>Location:</strong> ${esc(o.fullLocation || o.address || 'No location added')}
                    ${o.locationLink ? ` | <a href="${esc(o.locationLink)}" target="_blank" rel="noopener">Open Map</a>` : ''}
                </small>
                <div class="mini-actions partner-status-actions">
                    ${statuses.map(s => `<button type="button" data-type="${type}" data-tracking="${esc(o.trackingId)}" data-status="${esc(s)}">${esc(s)}</button>`).join('')}
                </div>
            </article>
        `).join('') : '<p class="empty-note">No assigned requests yet. Orders will appear here when patients select your partner name.</p>';

        root.innerHTML = `
            <section class="glass-card portal-profile-card">
                <div><span class="section-subtitle">${type === 'pharmacy' ? 'Pharmacy Partner Dashboard' : 'Lab Partner Dashboard'}</span><h3>${esc(partner.businessName)}</h3><p>${esc(partner.email)} | ${esc(partner.phone)}</p><small>Partner ID: ${esc(partner.id)} | Commission Agreement: 20%</small></div>
                <button class="btn btn-secondary" id="partner-logout-btn" type="button">Logout</button>
            </section>
            <div class="dashboard-stats-grid partner-stats-grid">
                <div><b>${orders.length}</b><span>Total Requests</span></div>
                <div><b>${active}</b><span>Active</span></div>
                <div><b>${completed}</b><span>Completed</span></div>
                <div><b>20%</b><span>Platform Commission</span></div>
            </div>
            <section class="glass-card">
                <h3>${type === 'pharmacy' ? 'Medicine Orders' : 'Lab Test Requests'}</h3>
                <p class="admin-muted">${type === 'pharmacy' ? 'Confirm stock, update delivery/pickup status, and manage medicine requests.' : 'Confirm slot, sample collection, report upload, and test status.'}</p>
                <div class="partner-order-list">${rows}</div>
            </section>
        `;
        const logout = $('partner-logout-btn');
        if (logout) logout.addEventListener('click', function(){ localStorage.removeItem(storageKey); localStorage.removeItem('currentUserRole'); location.href='login.html'; });
        root.querySelectorAll('[data-tracking][data-status]').forEach(btn => btn.addEventListener('click', function() {
            updateOrderStatus(this.dataset.type, this.dataset.tracking, this.dataset.status);
            renderPartnerDashboard(type);
        }));
    }

    function partnerCard(app, approved) {
        return `<article class="glass-card admin-record-card">
            <div class="admin-record-top">
                <div><h4>${esc(app.businessName)}</h4><p>${esc(app.type === 'pharmacy' ? 'Pharmacy Partner' : 'Lab Partner')} • ${esc(app.city)} ${app.area ? '• ' + esc(app.area) : ''}</p></div>
                <span class="admin-status ${statusClass(app.status)}">${esc(app.status || 'Pending Review')}</span>
            </div>
            <div class="admin-detail-grid">
                <p><strong>Owner:</strong> ${esc(app.ownerName)}</p>
                <p><strong>Email:</strong> ${esc(app.email)}</p>
                <p><strong>Phone:</strong> ${esc(app.phone)}</p>
                <p><strong>License:</strong> ${esc(app.license)}</p>
                <p><strong>Commission:</strong> ${esc(app.commission || '20%')}</p>
                <p><strong>Document:</strong> ${esc(app.documentName || 'No document')}</p>
                ${app.type === 'pharmacy' ? `<p><strong>Delivery:</strong> ${esc(app.delivery)}</p><p><strong>Pickup:</strong> ${esc(app.pickup)}</p><p><strong>24/7:</strong> ${esc(app.available24)}</p>` : `<p><strong>Home Sampling:</strong> ${esc(app.homeSampling)}</p><p><strong>Report Upload:</strong> ${esc(app.reportUpload)}</p><p><strong>Report Time:</strong> ${esc(app.reportTime)}</p>`}
            </div>
            <p class="admin-bio"><strong>Address / Services:</strong> ${esc(app.address || app.tests || '')}</p>
            <div class="admin-action-row">
                ${approved ? `<button type="button" onclick="window.removePartner('${esc(app.id)}')">Remove Published</button>` : `
                    <button type="button" onclick="window.setPartnerStatus('${esc(app.id)}','Selected')">Approve</button>
                    <button type="button" onclick="window.setPartnerStatus('${esc(app.id)}','Not Selected')">Reject</button>
                    <button type="button" onclick="window.publishPartner('${esc(app.id)}')">Publish</button>
                    <button type="button" onclick="window.deletePartner('${esc(app.id)}')">Delete</button>`}
            </div>
        </article>`;
    }

    function renderAdminPartners() {
        if (!$('admin-dashboard')) return;
        const apps = getApplications();
        const approved = read('approvedPartners', []);
        const pharmacyApps = apps.filter(p => p.type === 'pharmacy');
        const labApps = apps.filter(p => p.type === 'lab');
        const approvedPharmacy = getApprovedPartners('pharmacy');
        const approvedLabs = getApprovedPartners('lab');

        const statPartners = $('stat-partners');
        const statPharmacy = $('stat-pharmacy-partners');
        const statLab = $('stat-lab-partners');
        if (statPartners) statPartners.textContent = apps.length;
        if (statPharmacy) statPharmacy.textContent = approvedPharmacy.length;
        if (statLab) statLab.textContent = approvedLabs.length;

        const appBox = $('partner-applications-list');
        if (appBox) appBox.innerHTML = apps.length ? apps.map(p => partnerCard(p, false)).join('') : '<div class="glass-card admin-empty">No partner applications yet.</div>';

        const approvedBox = $('approved-partners-list');
        if (approvedBox) approvedBox.innerHTML = [...approvedPharmacy, ...approvedLabs].length ? [...approvedPharmacy, ...approvedLabs].map(p => partnerCard(p, true)).join('') : '<div class="glass-card admin-empty">No approved partners yet.</div>';
    }

    function enhanceAdminPanel() {
        const tabs = document.querySelector('.admin-tabs');
        const dashboard = $('admin-dashboard');
        if (!tabs || !dashboard || $('partner-applications-panel')) return;

        const statsGrid = dashboard.querySelector('.admin-stats-grid');
        if (statsGrid && !$('stat-partners')) {
            statsGrid.insertAdjacentHTML('beforeend', `
                <div class="glass-card admin-stat-card"><span>Partner Applications</span><strong id="stat-partners">0</strong><small>Pharmacy + lab applications</small></div>
                <div class="glass-card admin-stat-card"><span>Pharmacy Partners</span><strong id="stat-pharmacy-partners">0</strong><small>Approved pharmacies</small></div>
                <div class="glass-card admin-stat-card"><span>Lab Partners</span><strong id="stat-lab-partners">0</strong><small>Approved labs</small></div>
            `);
        }

        tabs.insertAdjacentHTML('beforeend', `
            <button class="admin-tab" data-tab="partner-applications-panel">Partner Applications</button>
            <button class="admin-tab" data-tab="approved-partners-panel">Approved Partners</button>
        `);

        const ordersPanel = $('orders-panel');
        ordersPanel.insertAdjacentHTML('afterend', `
            <div class="admin-panel-content" id="partner-applications-panel" hidden>
                <div class="admin-panel-head">
                    <div><h3>Pharmacy & Lab Partner Applications</h3><p class="admin-muted">Approve, reject, publish, or delete pharmacy/lab partner applications.</p></div>
                    <a href="partner-registration.html" class="btn btn-secondary">Open Partner Registration</a>
                </div>
                <div id="partner-applications-list" class="admin-record-grid"></div>
            </div>
            <div class="admin-panel-content" id="approved-partners-panel" hidden>
                <div class="admin-panel-head"><div><h3>Approved Partner Network</h3><p class="admin-muted">Published pharmacy and lab partners used in medicine/lab forms.</p></div></div>
                <div id="approved-partners-list" class="admin-record-grid"></div>
            </div>
        `);

        dashboard.querySelectorAll('.admin-tab').forEach(btn => {
            if (btn.dataset.partnerTabReady) return;
            btn.dataset.partnerTabReady = 'true';
            btn.addEventListener('click', function() {
                dashboard.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                dashboard.querySelectorAll('.admin-panel-content').forEach(panel => panel.hidden = true);
                const target = $(this.dataset.tab);
                if (target) target.hidden = false;
                renderAdminPartners();
            });
        });

        window.setPartnerStatus = function(pid, status) {
            const apps = getApplications();
            const app = apps.find(p => p.id === pid);
            if (app) {
                app.status = status;
                app.updatedAt = now();
                if (status === 'Selected') saveApprovedPartner(app);
                setApplications(apps);
            }
            renderAdminPartners();
        };
        window.publishPartner = function(pid) {
            const apps = getApplications();
            const app = apps.find(p => p.id === pid);
            if (!app) return;
            app.status = 'Selected';
            app.published = true;
            app.publishedAt = now();
            setApplications(apps);
            saveApprovedPartner(app);
            renderAdminPartners();
            alert('Partner approved and published.');
        };
        window.deletePartner = function(pid) {
            if (!confirm('Delete this partner application?')) return;
            setApplications(getApplications().filter(p => p.id !== pid));
            write('approvedPartners', read('approvedPartners', []).filter(p => p.id !== pid));
            renderAdminPartners();
        };
        window.removePartner = function(pid) {
            write('approvedPartners', read('approvedPartners', []).filter(p => p.id !== pid));
            const apps = getApplications();
            const app = apps.find(p => p.id === pid);
            if (app) app.published = false;
            setApplications(apps);
            renderAdminPartners();
        };

        renderAdminPartners();
        setTimeout(renderAdminPartners, 500);
        setTimeout(renderAdminPartners, 1500);
    }

    function addPartnerCardsToHome() {
        // Public dashboard cards are intentionally hidden.
        // Partners should register from partner-registration.html and login from login.html after admin approval.
        return;
    }

    function init() {
        enhanceLoginRoleOptions();
        partnerLoginBeforeOldHandler();
        initPartnerRegistration();
        populatePartnerSelects();
        renderPartnerDashboard('pharmacy');
        renderPartnerDashboard('lab');
        enhanceAdminPanel();
        addPartnerCardsToHome();
    }

    document.addEventListener('DOMContentLoaded', init);

    window.PartnerSystem = {
        getApprovedPartners,
        populatePartnerSelects,
        renderAdminPartners,
        findPartnerByLogin
    };
})();
