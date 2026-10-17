
(function () {
    function $(id) { return document.getElementById(id); }
    function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e) { return fallback; } }
    function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
    function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function now() { return new Date().toLocaleString(); }
    function cleanPhone(phone) { return String(phone || '').replace(/\D/g, ''); }
    function norm(s) { return String(s || '').trim().toLowerCase(); }
    function recordId(record) { return record.trackingId || record.appointmentToken || record.token || record.id || ''; }
    function typeLabel(kind) {
        return kind === 'appointment' ? 'Appointment' : kind === 'medicine' ? 'Medicine Order' : kind === 'lab' ? 'Lab Test Request' : 'Record';
    }
    function storageKey(kind) {
        return kind === 'medicine' ? 'medicineOrders' : kind === 'lab' ? 'labTestRequests' : 'appointmentRequests';
    }
    function parseAmount(value, fallback) {
        const raw = String(value || '').replace(/,/g, '');
        const m = raw.match(/(\d+(\.\d+)?)/);
        return m ? Number(m[1]) : Number(fallback || 0);
    }
    function amountFor(kind, record) {
        if (record.amount) return parseAmount(record.amount, 0);
        if (kind === 'appointment') return parseAmount(record.fee || record.videoFee, 1500) || 1500;
        if (kind === 'medicine') return parseAmount(record.total || record.price, 1800) || 1800;
        if (kind === 'lab') return parseAmount(record.total || record.price, 2500) || 2500;
        return 0;
    }
    function money(n) { return 'PKR ' + Number(n || 0).toLocaleString(); }
    function commission(amount) { return Math.round(Number(amount || 0) * 0.20); }

    function allRecords() {
        return [
            ...read('appointmentRequests', []).map(r => ({...r, kind:'appointment'})),
            ...read('medicineOrders', []).map(r => ({...r, kind:'medicine'})),
            ...read('labTestRequests', []).map(r => ({...r, kind:'lab'}))
        ];
    }

    function updateRecord(kind, id, patch) {
        const key = storageKey(kind);
        const list = read(key, []);
        const rec = list.find(item => String(recordId(item)).toLowerCase() === String(id || '').toLowerCase());
        if (rec) {
            Object.assign(rec, patch || {}, { lastUpdated: now() });
            write(key, list);
            return rec;
        }
        return null;
    }

    function normalizePaymentDefaults() {
        ['appointmentRequests','medicineOrders','labTestRequests'].forEach((key) => {
            const kind = key === 'appointmentRequests' ? 'appointment' : key === 'medicineOrders' ? 'medicine' : 'lab';
            const list = read(key, []);
            let changed = false;
            list.forEach((item) => {
                if (!item.paymentStatus) { item.paymentStatus = 'Unpaid'; changed = true; }
                if (!item.paymentMethod) { item.paymentMethod = 'Not Selected'; changed = true; }
                if (!item.amount) { item.amount = money(amountFor(kind, item)); changed = true; }
                if (!item.commission) { item.commission = money(commission(amountFor(kind, item))); changed = true; }
            });
            if (changed) write(key, list);
        });
    }

    function notify(audience, user, title, message, link, record, seed) {
        const notifications = read('portalNotifications', []);
        const recordKey = seed || [audience, user && (user.email || user.phone || user.name), record, title].join('|');
        if (notifications.some(n => n.seed === recordKey)) return;
        notifications.unshift({
            id:'NOT-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random()*1000),
            seed: recordKey,
            audience,
            userEmail: norm(user && user.email),
            userPhone: cleanPhone(user && user.phone),
            userName: norm(user && user.name),
            title,
            message,
            link: link || '',
            recordId: record || '',
            read:false,
            createdAt: now()
        });
        write('portalNotifications', notifications.slice(0, 250));
    }

    function patientFromRecord(rec) {
        return { name: rec.patient || rec.name || '', email: rec.patientEmail || rec.email || '', phone: rec.phone || '' };
    }
    function partnerFromRecord(rec, kind) {
        return { name: rec.partner || rec.pharmacy || rec.lab || rec.doctor || '', email: rec.partnerEmail || rec.doctorEmail || '', phone:'' };
    }

    function syncNotificationsFromRecords() {
        normalizePaymentDefaults();
        allRecords().forEach((rec) => {
            const id = recordId(rec);
            if (!id) return;
            const patient = patientFromRecord(rec);
            const link = rec.kind === 'appointment' ? `patient-dashboard.html?token=${encodeURIComponent(id)}` : `order-tracking.html?tracking=${encodeURIComponent(id)}`;
            notify('patient', patient, `${typeLabel(rec.kind)} Created`, `${typeLabel(rec.kind)} ${id} is ${rec.status || 'Pending'}. Payment: ${rec.paymentStatus || 'Unpaid'}.`, link, id, 'created|' + rec.kind + '|' + id);

            if (rec.kind === 'appointment') {
                notify('doctor', partnerFromRecord(rec, rec.kind), 'New Appointment Request', `${rec.patient || 'Patient'} booked appointment token ${id}.`, 'doctor-dashboard.html', id, 'doctor-new|' + id);
                if (rec.status) notify('patient', patient, 'Appointment Status Updated', `Appointment ${id} status is ${rec.status}.`, link, id, 'appt-status|' + id + '|' + rec.status);
            } else if (rec.kind === 'medicine') {
                notify('pharmacy', partnerFromRecord(rec, rec.kind), 'New Medicine Order', `Medicine order ${id} is assigned to ${rec.partner || rec.pharmacy || 'partner pharmacy'}.`, 'pharmacy-dashboard.html', id, 'pharmacy-new|' + id);
                if (rec.status) notify('patient', patient, 'Medicine Order Status Updated', `Medicine order ${id} status is ${rec.status}.`, link, id, 'med-status|' + id + '|' + rec.status);
            } else if (rec.kind === 'lab') {
                notify('lab', partnerFromRecord(rec, rec.kind), 'New Lab Test Request', `Lab request ${id} is assigned to ${rec.partner || rec.lab || 'partner lab'}.`, 'lab-dashboard.html', id, 'lab-new|' + id);
                if (rec.status) notify('patient', patient, 'Lab Request Status Updated', `Lab request ${id} status is ${rec.status}.`, link, id, 'lab-status|' + id + '|' + rec.status);
                if (rec.reportFileName) notify('patient', patient, 'Lab Report Uploaded', `Your lab report for ${id} has been uploaded: ${rec.reportFileName}.`, link, id, 'lab-report|' + id + '|' + rec.reportFileName);
            }

            if (rec.paymentStatus) {
                notify('patient', patient, 'Payment Status Updated', `${typeLabel(rec.kind)} ${id} payment status is ${rec.paymentStatus}.`, link, id, 'pay|' + rec.kind + '|' + id + '|' + rec.paymentStatus);
            }
        });
        notify('admin', {name:'admin'}, 'System Ready', 'Admin can manage notifications, payment status, receipts, reports, partners, and requests.', 'admin.html', 'ADMIN', 'admin-system-ready');
    }

    function currentUser(audience) {
        if (audience === 'patient') return read('loggedInPatient', null);
        if (audience === 'doctor') return read('loggedInDoctor', null);
        if (audience === 'pharmacy') return read('loggedInPharmacy', null);
        if (audience === 'lab') return read('loggedInLab', null);
        if (audience === 'admin') return { name:'Admin', email:'admin@aisymptoms.com' };
        return null;
    }

    function filterNotifications(audience, user) {
        const all = read('portalNotifications', []);
        if (audience === 'admin') return all.filter(n => n.audience === 'admin').slice(0, 25);
        if (!user) return [];
        const email = norm(user.email);
        const phone = cleanPhone(user.phone);
        const name = norm(user.name || user.businessName);
        return all.filter(n => n.audience === audience && (
            (email && n.userEmail === email) ||
            (phone && n.userPhone === phone) ||
            (name && n.userName === name) ||
            (!n.userEmail && !n.userPhone && !n.userName)
        )).slice(0, 30);
    }

    function notificationHTML(audience) {
        const user = currentUser(audience);
        const notes = filterNotifications(audience, user);
        const unread = notes.filter(n => !n.read).length;
        const rows = notes.length ? notes.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}">
                <div><b>${esc(n.title)}</b><p>${esc(n.message)}</p><small>${esc(n.createdAt)}</small></div>
                ${n.link ? `<a href="${esc(n.link)}">Open</a>` : ''}
            </div>
        `).join('') : '<p class="empty-note">No notifications yet.</p>';
        return `
            <section class="glass-card notification-center-card" id="${audience}-notification-center">
                <div class="notification-head">
                    <div><span class="section-subtitle">Notification Center</span><h3>Latest Updates ${unread ? `<span class="notification-count">${unread}</span>` : ''}</h3></div>
                    <button class="btn btn-secondary notification-read-btn" type="button" data-audience="${esc(audience)}">Mark All Read</button>
                </div>
                <div class="notification-list">${rows}</div>
            </section>`;
    }

    function markAllRead(audience) {
        const user = currentUser(audience);
        const list = read('portalNotifications', []);
        const visibleIds = new Set(filterNotifications(audience, user).map(n => n.id));
        list.forEach(n => { if (visibleIds.has(n.id)) n.read = true; });
        write('portalNotifications', list);
        enhanceDashboards();
    }

    function findRecordsForPatient(patient) {
        if (!patient) return [];
        const email = norm(patient.email), phone = cleanPhone(patient.phone), name = norm(patient.name);
        return allRecords().filter(r => {
            const p = patientFromRecord(r);
            return (email && norm(p.email) === email) || (phone && cleanPhone(p.phone) === phone) || (name && norm(p.name) === name);
        });
    }

    function reportLink(record) {
        if (!record.reportFileName) return '';
        if (record.reportDataUrl) {
            return `<a class="btn btn-secondary" href="${record.reportDataUrl}" download="${esc(record.reportFileName)}">Download Report</a>`;
        }
        return `<span class="report-pill">Report Uploaded: ${esc(record.reportFileName)}</span>`;
    }

    function paymentReceiptCard(record) {
        const id = recordId(record);
        const kind = record.kind;
        const amount = amountFor(kind, record);
        return `<div class="dashboard-row payment-row">
            <div><b>${esc(typeLabel(kind))}: ${esc(id)}</b><span class="admin-status ${statusClass(record.paymentStatus)}">${esc(record.paymentStatus || 'Unpaid')}</span></div>
            <p>${esc(record.patient || record.name || '')} | ${esc(record.partner || record.pharmacy || record.lab || record.doctor || '')}</p>
            <small>
                Status: ${esc(record.status || 'Pending')} | Amount: ${money(amount)} | Commission: ${money(commission(amount))}<br>
                Quantity: ${esc([record.quantity, record.quantityType].filter(Boolean).join(' ') || 'Not specified')}<br>
                Location: ${esc(record.fullLocation || record.address || 'No location added')}
            </small>
            <div class="payment-actions">
                <button type="button" class="btn btn-secondary demo-pay-btn" data-kind="${esc(kind)}" data-id="${esc(id)}">Mark Demo Paid</button>
                <button type="button" class="btn btn-secondary receipt-btn" data-kind="${esc(kind)}" data-id="${esc(id)}">Download Receipt</button>
                <a class="btn btn-secondary" href="${kind === 'appointment' ? 'patient-dashboard.html?token=' + encodeURIComponent(id) : 'order-tracking.html?tracking=' + encodeURIComponent(id)}">Track</a>
                ${kind === 'lab' ? reportLink(record) : ''}
            </div>
        </div>`;
    }

    function enhancePatientDashboard() {
        const root = $('patient-dashboard-root');
        if (!root || root.querySelector('#patient-notification-center') || root.querySelector('.portal-login-required')) return;
        const patient = currentUser('patient');
        if (!patient || !patient.email) return;
        const records = findRecordsForPatient(patient);
        const cards = records.length ? records.map(paymentReceiptCard).join('') : '<p class="empty-note">No payment or receipt records yet.</p>';
        root.insertAdjacentHTML('afterbegin', notificationHTML('patient'));
        root.insertAdjacentHTML('beforeend', `<section class="glass-card payment-receipt-card" id="patient-payment-receipts"><span class="section-subtitle">Payments & Receipts</span><h3>My Payments, Receipts & Lab Reports</h3>${cards}</section>`);
    }

    function enhanceSimpleDashboard(rootId, audience) {
        const root = $(rootId);
        if (!root || root.querySelector(`#${audience}-notification-center`) || root.querySelector('.portal-login-required')) return;
        const user = currentUser(audience);
        if (!user || (!user.email && audience !== 'admin')) return;
        root.insertAdjacentHTML('afterbegin', notificationHTML(audience));
    }

    function statusClass(status) {
        const s = String(status || '').toLowerCase();
        if (s.includes('paid') || s.includes('selected') || s.includes('confirmed') || s.includes('completed') || s.includes('delivered') || s.includes('uploaded')) return 'selected';
        if (s.includes('unpaid') || s.includes('pending') || s.includes('waiting')) return 'pending';
        if (s.includes('reject') || s.includes('cancel') || s.includes('refund')) return 'rejected';
        return 'pending';
    }

    function receiptHTML(kind, record) {
        const id = recordId(record);
        const amount = amountFor(kind, record);
        const comm = commission(amount);
        const paid = record.paymentStatus || 'Unpaid';
        return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Receipt ${esc(id)}</title>
<style>
body{font-family:Arial,sans-serif;background:#f6f8fb;color:#111;padding:30px}
.receipt{max-width:760px;margin:auto;background:#fff;border-radius:18px;padding:30px;box-shadow:0 10px 30px rgba(0,0,0,.08)}
.top{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #e5e7eb;padding-bottom:18px;margin-bottom:22px}
h1{margin:0;color:#0f172a}.tag{background:#e0f2fe;color:#0369a1;padding:8px 12px;border-radius:99px;font-weight:700}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}.box{background:#f8fafc;padding:14px;border-radius:12px}
table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border-bottom:1px solid #e5e7eb;padding:12px;text-align:left}.total{font-size:20px;font-weight:800}.note{margin-top:20px;color:#64748b;font-size:13px}
@media print{body{background:#fff}.receipt{box-shadow:none}}
</style></head><body><div class="receipt">
<div class="top"><div><h1>AI Symptoms Checker</h1><p>Healthcare Platform Receipt / Invoice</p></div><div><span class="tag">${esc(paid)}</span></div></div>
<div class="grid">
<div class="box"><strong>Receipt ID</strong><br>REC-${esc(id)}</div>
<div class="box"><strong>Service</strong><br>${esc(typeLabel(kind))}</div>
<div class="box"><strong>Patient</strong><br>${esc(record.patient || record.name || 'Patient')}</div>
<div class="box"><strong>Partner / Doctor</strong><br>${esc(record.partner || record.pharmacy || record.lab || record.doctor || 'AI Symptoms Checker')}</div>
<div class="box"><strong>Tracking ID</strong><br>${esc(id)}</div>
<div class="box"><strong>Date</strong><br>${esc(record.submittedAt || record.createdAt || record.date || now())}</div>
<div class="box"><strong>Quantity</strong><br>${esc([record.quantity, record.quantityType].filter(Boolean).join(' ') || 'Not specified')}</div>
<div class="box"><strong>Delivery / Collection Location</strong><br>${esc(record.fullLocation || record.address || 'No location added')}</div>
</div>
<table><tr><th>Description</th><th>Amount</th></tr>
<tr><td>${esc(typeLabel(kind))} service fee</td><td>${money(amount)}</td></tr>
<tr><td>Platform commission record (20%)</td><td>${money(comm)}</td></tr>
<tr><td class="total">Total</td><td class="total">${money(amount)}</td></tr></table>
<p class="note">Payment Method: ${esc(record.paymentMethod || 'Not Selected')} | Status: ${esc(paid)}<br>
Quantity: ${esc([record.quantity, record.quantityType].filter(Boolean).join(' ') || 'Not specified')}<br>
Location: ${esc(record.fullLocation || record.address || 'No location added')}<br>
This is a demo receipt generated by the static project using browser localStorage.</p>
</div></body></html>`;
    }

    function findRecord(kind, id) {
        return read(storageKey(kind), []).find(r => String(recordId(r)).toLowerCase() === String(id || '').toLowerCase());
    }

    function downloadReceipt(kind, id) {
        const record = findRecord(kind, id);
        if (!record) { alert('Record not found for receipt.'); return; }
        const html = receiptHTML(kind, record);
        const blob = new Blob([html], {type:'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${id}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function markDemoPaid(kind, id) {
        const rec = updateRecord(kind, id, { paymentStatus:'Paid', paymentMethod:'Demo Cash/Card', paidAt:now() });
        if (rec) {
            notify('patient', patientFromRecord(rec), 'Payment Completed', `${typeLabel(kind)} ${id} has been marked as paid. Receipt is available.`, kind === 'appointment' ? `patient-dashboard.html?token=${id}` : `order-tracking.html?tracking=${id}`, id, 'paid|' + kind + '|' + id + '|' + Date.now());
            syncNotificationsFromRecords();
            enhanceDashboards(true);
            renderEnhancedTracking();
            alert('Demo payment marked as Paid.');
        }
    }

    function paymentStatusOptions(selected) {
        const statuses = ['Unpaid','Pending','Paid','Refund Requested','Refunded','Cancelled'];
        return statuses.map(s => `<option value="${esc(s)}" ${s === selected ? 'selected' : ''}>${esc(s)}</option>`).join('');
    }

    function enhanceAdminPayments() {
        const dashboard = $('admin-dashboard');
        if (!dashboard || $('payments-panel')) return;
        const tabs = dashboard.querySelector('.admin-tabs');
        const ordersPanel = $('orders-panel') || dashboard.querySelector('.admin-panel-content:last-of-type');
        if (!tabs || !ordersPanel) return;
        tabs.insertAdjacentHTML('beforeend', `<button class="admin-tab" data-tab="payments-panel">Payments & Receipts</button>`);
        ordersPanel.insertAdjacentHTML('afterend', `
            <div class="admin-panel-content" id="payments-panel" hidden>
                <div class="admin-panel-head">
                    <div><h3>Payment Status & Receipt Management</h3><p class="admin-muted">Update payment status for appointments, medicine orders, and lab test requests. Receipts can be downloaded for each record.</p></div>
                </div>
                <div id="admin-payment-list" class="admin-record-grid"></div>
            </div>
        `);
        dashboard.querySelectorAll('.admin-tab').forEach(btn => {
            if (btn.dataset.businessTabReady) return;
            btn.dataset.businessTabReady = 'true';
            btn.addEventListener('click', function() {
                dashboard.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                dashboard.querySelectorAll('.admin-panel-content').forEach(panel => panel.hidden = true);
                const target = $(this.dataset.tab);
                if (target) target.hidden = false;
                renderAdminPaymentList();
            });
        });
        renderAdminPaymentList();
    }

    function renderAdminPaymentList() {
        const box = $('admin-payment-list');
        if (!box) return;
        const records = allRecords();
        box.innerHTML = records.length ? records.map(r => {
            const id = recordId(r);
            return `<article class="glass-card admin-record-card payment-admin-card">
                <div class="admin-record-top"><div><h4>${esc(typeLabel(r.kind))}: ${esc(id)}</h4><p>${esc(r.patient || r.name || '')} • ${esc(r.partner || r.pharmacy || r.lab || r.doctor || '')}</p></div><span class="admin-status ${statusClass(r.paymentStatus)}">${esc(r.paymentStatus || 'Unpaid')}</span></div>
                <div class="admin-detail-grid"><p><strong>Amount:</strong> ${money(amountFor(r.kind, r))}</p><p><strong>Commission:</strong> ${money(commission(amountFor(r.kind, r)))}</p><p><strong>Status:</strong> ${esc(r.status || 'Pending')}</p><p><strong>Date:</strong> ${esc(r.submittedAt || r.createdAt || r.date || '')}</p></div>
                <div class="payment-admin-actions">
                    <select data-pay-select="${esc(id)}" data-kind="${esc(r.kind)}">${paymentStatusOptions(r.paymentStatus || 'Unpaid')}</select>
                    <select data-method-select="${esc(id)}"><option ${r.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option><option ${r.paymentMethod === 'Card' ? 'selected' : ''}>Card</option><option ${r.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option><option ${r.paymentMethod === 'Demo Cash/Card' ? 'selected' : ''}>Demo Cash/Card</option><option ${!r.paymentMethod || r.paymentMethod === 'Not Selected' ? 'selected' : ''}>Not Selected</option></select>
                    <button type="button" class="btn btn-secondary admin-save-payment-btn" data-kind="${esc(r.kind)}" data-id="${esc(id)}">Save Payment</button>
                    <button type="button" class="btn btn-secondary receipt-btn" data-kind="${esc(r.kind)}" data-id="${esc(id)}">Download Receipt</button>
                </div>
            </article>`;
        }).join('') : '<div class="glass-card admin-empty">No payment records yet.</div>';
    }

    function saveAdminPayment(kind, id) {
        const statusEl = Array.from(document.querySelectorAll('[data-pay-select]')).find(el => String(el.dataset.paySelect) === String(id));
        const methodEl = Array.from(document.querySelectorAll('[data-method-select]')).find(el => String(el.dataset.methodSelect) === String(id));
        const status = statusEl ? statusEl.value : 'Unpaid';
        const method = methodEl ? methodEl.value : 'Not Selected';
        const rec = updateRecord(kind, id, { paymentStatus: status, paymentMethod: method, paidAt: status === 'Paid' ? now() : '' });
        if (rec) {
            notify('patient', patientFromRecord(rec), 'Payment Status Updated', `${typeLabel(kind)} ${id} payment status is now ${status}.`, kind === 'appointment' ? `patient-dashboard.html?token=${id}` : `order-tracking.html?tracking=${id}`, id, 'admin-pay|' + kind + '|' + id + '|' + status + '|' + Date.now());
        }
        syncNotificationsFromRecords();
        renderAdminPaymentList();
    }

    function renderEnhancedTracking() {
        const root = $('order-tracking-root');
        const input = $('tracking-input');
        if (!root || !input) return;
        const q = input.value.trim().toLowerCase();
        const records = allRecords();
        const filtered = q ? records.filter(o => {
            return String(recordId(o)).toLowerCase().includes(q) ||
                   String(o.patient || o.name || '').toLowerCase().includes(q) ||
                   String(o.phone || '').toLowerCase().includes(q);
        }) : records;
        root.innerHTML = filtered.length ? filtered.map(o => {
            const id = recordId(o);
            return `<article class="glass-card tracking-result-card">
                <div class="admin-record-top">
                    <div><h3>${esc(typeLabel(o.kind))}: ${esc(id || 'No ID')}</h3><p>${esc(o.patient || o.name || '')} | ${esc(o.partner || o.pharmacy || o.lab || o.doctor || '')}</p></div>
                    <span class="admin-status ${statusClass(o.status)}">${esc(o.status || 'Pending')}</span>
                </div>
                <div class="admin-detail-grid">
                    <p><strong>Payment:</strong> ${esc(o.paymentStatus || 'Unpaid')}</p>
                    <p><strong>Amount:</strong> ${money(amountFor(o.kind, o))}</p>
                    <p><strong>Commission:</strong> ${money(commission(amountFor(o.kind, o)))}</p>
                    <p><strong>Submitted:</strong> ${esc(o.submittedAt || o.createdAt || o.date || '')}</p>
                    <p><strong>Quantity:</strong> ${esc([o.quantity, o.quantityType].filter(Boolean).join(' ') || 'Not specified')}</p>
                    <p><strong>Location:</strong> ${esc(o.fullLocation || o.address || 'No location added')}</p>
                    ${o.locationLink ? `<p><strong>Map:</strong> <a href="${esc(o.locationLink)}" target="_blank" rel="noopener">Open Location</a></p>` : ''}
                    ${o.reportFileName ? `<p><strong>Report:</strong> ${esc(o.reportFileName)}</p>` : ''}
                </div>
                <p class="admin-bio">${esc(o.details || o.tests || o.reason || o.medicines || '')}</p>
                <div class="payment-actions">
                    <button type="button" class="btn btn-secondary demo-pay-btn" data-kind="${esc(o.kind)}" data-id="${esc(id)}">Mark Demo Paid</button>
                    <button type="button" class="btn btn-secondary receipt-btn" data-kind="${esc(o.kind)}" data-id="${esc(id)}">Download Receipt</button>
                    ${o.kind === 'lab' ? reportLink(o) : ''}
                    ${o.kind === 'appointment' ? `<a class="btn btn-primary" href="https://www.google.com/maps/search/nearest+hospital" target="_blank" rel="noopener">Find Nearest Hospital</a>` : ''}
                </div>
            </article>`;
        }).join('') : '<p class="empty-note">No matching record found.</p>';
    }

    function initEnhancedTracking() {
        if (!$('order-tracking-root')) return;
        const btn = $('tracking-btn');
        if (btn && !btn.dataset.businessTrackingReady) {
            btn.dataset.businessTrackingReady = 'true';
            btn.addEventListener('click', renderEnhancedTracking);
        }
        renderEnhancedTracking();
    }

    function uploadLabReport(trackingId, file) {
        if (!file || !trackingId) return;
        const max = 750000;
        const finish = (dataUrl) => {
            const rec = updateRecord('lab', trackingId, {
                status:'Report Uploaded',
                reportFileName:file.name,
                reportUploadedAt:now(),
                reportDataUrl:dataUrl || ''
            });
            if (rec) {
                notify('patient', patientFromRecord(rec), 'Lab Report Uploaded', `Your lab report for ${trackingId} has been uploaded by ${rec.partner || rec.lab || 'lab partner'}.`, `order-tracking.html?tracking=${trackingId}`, trackingId, 'lab-report-uploaded|' + trackingId + '|' + Date.now());
                syncNotificationsFromRecords();
                alert('Lab report uploaded successfully. Patient can see it in dashboard and tracking page.');
                location.reload();
            }
        };
        if (file.size <= max) {
            const reader = new FileReader();
            reader.onload = () => finish(reader.result);
            reader.onerror = () => finish('');
            reader.readAsDataURL(file);
        } else {
            finish('');
        }
    }

    function enhanceLabReportUpload() {
        const root = $('lab-dashboard-root');
        if (!root || root.querySelector('.portal-login-required')) return;
        root.querySelectorAll('.partner-order-row').forEach(row => {
            if (row.querySelector('.lab-report-upload-box')) return;
            const btn = row.querySelector('[data-tracking]');
            if (!btn) return;
            const tracking = btn.dataset.tracking;
            const order = read('labTestRequests', []).find(o => String(o.trackingId) === String(tracking));
            const uploaded = order && order.reportFileName ? `<div class="report-pill">Uploaded: ${esc(order.reportFileName)} ${order.reportDataUrl ? `<a href="${order.reportDataUrl}" download="${esc(order.reportFileName)}">Download</a>` : ''}</div>` : '';
            row.insertAdjacentHTML('beforeend', `
                <div class="lab-report-upload-box">
                    <label>Upload Patient Lab Report</label>
                    <input type="file" accept=".pdf,image/*" data-lab-report-input="${esc(tracking)}">
                    ${uploaded}
                    <small>After upload, status becomes Report Uploaded and patient receives notification.</small>
                </div>
            `);
        });
    }

    function emergencyButtonHTML() {
        return `<a class="btn btn-primary emergency-hospital-btn" href="https://www.google.com/maps/search/nearest+hospital" target="_blank" rel="noopener">🚑 Find Nearest Hospital</a>`;
    }

    function addEmergencyHospitalFinder() {
        const dash = $('dashboard');
        if (dash && !dash.querySelector('.emergency-hospital-btn')) {
            const text = dash.innerText.toLowerCase();
            if (text.includes('emergency') || text.includes('urgent') || text.includes('high') || text.includes('chest pain') || text.includes('breathing')) {
                const target = dash.querySelector('.dash-result') || dash.querySelector('.dashboard-welcome') || dash;
                target.insertAdjacentHTML('beforeend', `<div class="emergency-hospital-box"><h4>Emergency Support</h4><p>If symptoms feel serious, open nearest hospital map immediately.</p>${emergencyButtonHTML()}</div>`);
            }
        }
        const toolsGrid = document.querySelector('#health-tools .feature-tools-grid, #health-tools .health-tools-grid');
        if (toolsGrid && !$('emergency-hospital-card')) {
            toolsGrid.insertAdjacentHTML('beforeend', `
                <div class="glass-card feature-tool-card emergency-hospital-card" id="emergency-hospital-card">
                    <h3>Emergency Hospital Finder</h3>
                    <p>For high-risk symptoms such as chest pain, breathing difficulty, fainting, heavy bleeding, or severe weakness.</p>
                    ${emergencyButtonHTML()}
                </div>
            `);
        }
    }

    function enhanceDashboards(force) {
        if (force) {
            document.querySelectorAll('.notification-center-card, #patient-payment-receipts').forEach(el => el.remove());
        }
        enhancePatientDashboard();
        enhanceSimpleDashboard('doctor-dashboard-root', 'doctor');
        enhanceSimpleDashboard('pharmacy-dashboard-root', 'pharmacy');
        enhanceSimpleDashboard('lab-dashboard-root', 'lab');
        enhanceSimpleDashboard('admin-dashboard', 'admin');
        enhanceLabReportUpload();
    }

    function attachGlobalHandlers() {
        document.addEventListener('click', function(e) {
            const receipt = e.target.closest('.receipt-btn');
            if (receipt) {
                downloadReceipt(receipt.dataset.kind, receipt.dataset.id);
                return;
            }
            const pay = e.target.closest('.demo-pay-btn');
            if (pay) {
                markDemoPaid(pay.dataset.kind, pay.dataset.id);
                return;
            }
            const mark = e.target.closest('.notification-read-btn');
            if (mark) {
                markAllRead(mark.dataset.audience);
                return;
            }
            const save = e.target.closest('.admin-save-payment-btn');
            if (save) {
                saveAdminPayment(save.dataset.kind, save.dataset.id);
                return;
            }
            const statusBtn = e.target.closest('[data-status]');
            if (statusBtn) {
                setTimeout(function() {
                    syncNotificationsFromRecords();
                    enhanceDashboards(true);
                    renderEnhancedTracking();
                    enhanceLabReportUpload();
                }, 500);
            }
        });

        document.addEventListener('change', function(e) {
            const input = e.target.closest('[data-lab-report-input]');
            if (input && input.files && input.files[0]) {
                uploadLabReport(input.dataset.labReportInput, input.files[0]);
            }
        });

        document.addEventListener('submit', function(e) {
            const id = e.target && e.target.id;
            if (['medicine-page-form','lab-page-form','appointment-form','appointment-page-form','symptom-form'].includes(id)) {
                setTimeout(function() {
                    normalizePaymentDefaults();
                    syncNotificationsFromRecords();
                    initEnhancedTracking();
                    enhanceDashboards(true);
                }, 600);
            }
        }, true);
    }

    function installObservers() {
        const dash = $('dashboard');
        if (dash) {
            const obs = new MutationObserver(function(){ addEmergencyHospitalFinder(); });
            obs.observe(dash, { childList:true, subtree:true });
        }
        ['patient-dashboard-root','doctor-dashboard-root','pharmacy-dashboard-root','lab-dashboard-root'].forEach(id => {
            const root = $(id);
            if (root) {
                const obs = new MutationObserver(function(){ setTimeout(function(){ enhanceDashboards(); }, 80); });
                obs.observe(root, { childList:true, subtree:true });
            }
        });
    }

    function init() {
        normalizePaymentDefaults();
        syncNotificationsFromRecords();
        attachGlobalHandlers();
        addEmergencyHospitalFinder();
        initEnhancedTracking();
        enhanceAdminPayments();
        setTimeout(function(){ enhanceAdminPayments(); renderAdminPaymentList(); }, 700);
        setTimeout(function(){ enhanceDashboards(); addEmergencyHospitalFinder(); enhanceLabReportUpload(); initEnhancedTracking(); }, 900);
        setTimeout(function(){ enhanceDashboards(); addEmergencyHospitalFinder(); enhanceLabReportUpload(); }, 1800);
        installObservers();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.BusinessFeatures = {
        downloadReceipt,
        markDemoPaid,
        syncNotificationsFromRecords,
        renderEnhancedTracking,
        addEmergencyHospitalFinder
    };
})();
