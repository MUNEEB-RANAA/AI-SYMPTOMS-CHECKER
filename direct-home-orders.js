
(function () {
    function $(id) { return document.getElementById(id); }
    function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e) { return fallback; } }
    function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
    function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function now() { return new Date().toLocaleString(); }
    function id(prefix) { return prefix + '-' + Date.now().toString().slice(-6); }

    function partnerOptions(type) {
        let partners = [];
        if (window.PartnerSystem && typeof window.PartnerSystem.getApprovedPartners === 'function') {
            partners = window.PartnerSystem.getApprovedPartners(type) || [];
        }
        if (!partners.length) {
            partners = type === 'pharmacy'
                ? [{businessName:'Green Care Pharmacy', area:'North Nazimabad', city:'Karachi'}, {businessName:'Partner Pharmacy A', area:'Nearest Area', city:'Karachi'}, {businessName:'Hospital Pharmacy Counter', area:'Hospital', city:'Karachi'}]
                : [{businessName:'City Diagnostic Lab', area:'Gulshan', city:'Karachi'}, {businessName:'Partner Laboratory A', area:'Nearest Area', city:'Karachi'}, {businessName:'Partner Hospital Diagnostic Center', area:'Hospital', city:'Karachi'}];
        }
        return partners.map(p => `<option value="${esc(p.businessName)}">${esc(p.businessName)} - ${esc(p.area || p.city || 'Partner')}</option>`).join('');
    }

    function locationFields(prefix, title) {
        return `
            <div class="direct-home-location-panel">
                <h4>${title}</h4>
                <div class="input-row">
                    <div class="input-group">
                        <label for="${prefix}-patient">Patient Name</label>
                        <input type="text" id="${prefix}-patient" placeholder="Enter patient name" required>
                    </div>
                    <div class="input-group">
                        <label for="${prefix}-phone">Phone Number</label>
                        <input type="tel" id="${prefix}-phone" placeholder="03XX XXXXXXX" required>
                    </div>
                </div>
                <div class="input-row">
                    <div class="input-group">
                        <label for="${prefix}-city">City</label>
                        <input type="text" id="${prefix}-city" placeholder="Karachi" required>
                    </div>
                    <div class="input-group">
                        <label for="${prefix}-area">Area / Town</label>
                        <input type="text" id="${prefix}-area" placeholder="North Nazimabad, Gulshan..." required>
                    </div>
                </div>
                <div class="input-group">
                    <label for="${prefix}-address">Full Address</label>
                    <textarea id="${prefix}-address" rows="3" placeholder="House no, street, block, landmark..." required></textarea>
                </div>
                <div class="input-row">
                    <div class="input-group">
                        <label for="${prefix}-map">Google Maps Location Link (Optional)</label>
                        <input type="url" id="${prefix}-map" placeholder="Paste Google Maps location link">
                    </div>
                    <div class="input-group">
                        <label for="${prefix}-note">Location / Timing Note</label>
                        <input type="text" id="${prefix}-note" placeholder="Call before arrival, preferred time...">
                    </div>
                </div>
            </div>`;
    }

    function enhanceMedicineHomeCard() {
        const card = document.querySelector('.medicine-order-card');
        if (!card || card.dataset.directEnhanced) return;
        card.dataset.directEnhanced = 'true';

        const nameInput = $('medicine-name');
        if (nameInput) nameInput.setAttribute('required', 'required');

        const note = $('medicine-note');
        if (note) note.placeholder = 'Write brand preference, strength, or special instructions...';

        const delivery = $('medicine-delivery');
        if (delivery) {
            delivery.innerHTML = `
                <option>Home Delivery</option>
                <option>Urgent Home Delivery</option>
                <option>Pharmacy Pickup</option>
                <option>Hospital Pickup</option>
            `;
        }

        const orderTypeGroup = $('medicine-type') ? $('medicine-type').closest('.input-row') : null;
        if (orderTypeGroup && !$('home-medicine-quantity')) {
            orderTypeGroup.insertAdjacentHTML('afterend', `
                <div class="input-row direct-home-quantity-row">
                    <div class="input-group">
                        <label for="home-medicine-quantity">Quantity / Packs</label>
                        <input type="number" id="home-medicine-quantity" min="1" value="1" required>
                    </div>
                    <div class="input-group">
                        <label for="home-medicine-unit">Quantity Type</label>
                        <select id="home-medicine-unit">
                            <option>Strip(s)</option>
                            <option>Bottle(s)</option>
                            <option>Box(es)</option>
                            <option>Tube(s)</option>
                            <option>Sachet(s)</option>
                            <option>Pack(s)</option>
                        </select>
                    </div>
                </div>
                <div class="input-group">
                    <label for="home-pharmacy-partner">Select Partner Pharmacy</label>
                    <select id="home-pharmacy-partner">${partnerOptions('pharmacy')}</select>
                </div>
                ${locationFields('home-medicine', 'Delivery Location')}
            `);
        }

        const btn = card.querySelector('a.btn');
        if (btn) {
            btn.href = '#';
            btn.textContent = 'Submit Direct Medicine Order';
            btn.id = 'submit-home-medicine-order';
            btn.addEventListener('click', submitHomeMedicineOrder);
        }
    }

    function enhanceLabHomeCard() {
        const card = document.querySelector('.direct-home-card');
        if (!card || card.dataset.directEnhanced) return;
        card.dataset.directEnhanced = 'true';

        const method = $('direct-lab-method');
        if (method) {
            method.innerHTML = `
                <option>Home Sample Collection - Lab Staff Comes Home</option>
                <option>Doctor / Medical Staff Home Visit for Sample</option>
                <option>Patient Will Visit Partner Laboratory</option>
                <option>Patient Will Visit Hospital Diagnostic Center</option>
                <option>Report Delivery Only</option>
            `;
        }

        const baseRow = $('direct-lab-test') ? $('direct-lab-test').closest('.input-row') : null;
        if (baseRow && !$('home-lab-quantity')) {
            baseRow.insertAdjacentHTML('afterend', `
                <div class="input-row direct-home-quantity-row">
                    <div class="input-group">
                        <label for="home-lab-quantity">Quantity / Number of Tests</label>
                        <input type="number" id="home-lab-quantity" min="1" value="1" required>
                    </div>
                    <div class="input-group">
                        <label for="home-lab-unit">Quantity Type</label>
                        <select id="home-lab-unit">
                            <option>Test(s)</option>
                            <option>Patient(s)</option>
                            <option>Sample(s)</option>
                            <option>Health Package</option>
                        </select>
                    </div>
                </div>
                <div class="input-group">
                    <label for="home-lab-partner">Select Partner Lab / Hospital</label>
                    <select id="home-lab-partner">${partnerOptions('lab')}</select>
                </div>
                ${locationFields('home-lab', 'Sample Collection / Lab Visit Location')}
            `);
        }

        const btn = card.querySelector('a.btn');
        if (btn) {
            btn.href = '#';
            btn.textContent = 'Submit Direct Lab Test Request';
            btn.id = 'submit-home-lab-request';
            btn.addEventListener('click', submitHomeLabRequest);
        }
    }

    function requiredValue(id, label) {
        const el = $(id);
        const val = el ? String(el.value || '').trim() : '';
        if (!val) {
            if (el) el.focus();
            alert(label + ' is required.');
            throw new Error(label + ' is required');
        }
        return val;
    }

    function fullLocation(prefix) {
        return [
            requiredValue(prefix + '-address', 'Full address'),
            requiredValue(prefix + '-area', 'Area'),
            requiredValue(prefix + '-city', 'City')
        ].filter(Boolean).join(', ');
    }

    function submitHomeMedicineOrder(e) {
        e.preventDefault();
        try {
            const order = {
                patient: requiredValue('home-medicine-patient', 'Patient name'),
                phone: requiredValue('home-medicine-phone', 'Phone number'),
                details: requiredValue('medicine-name', 'Medicine name') + (String($('medicine-note')?.value || '').trim() ? '\nNotes: ' + $('medicine-note').value.trim() : ''),
                medicines: requiredValue('medicine-name', 'Medicine name'),
                orderType: $('medicine-type')?.value || 'Direct Medicine Order',
                quantity: requiredValue('home-medicine-quantity', 'Quantity'),
                quantityType: $('home-medicine-unit')?.value || 'Pack(s)',
                pharmacy: $('home-pharmacy-partner')?.value || 'Green Care Pharmacy',
                partner: $('home-pharmacy-partner')?.value || 'Green Care Pharmacy',
                delivery: $('medicine-delivery')?.value || 'Home Delivery',
                city: requiredValue('home-medicine-city', 'City'),
                area: requiredValue('home-medicine-area', 'Area'),
                address: requiredValue('home-medicine-address', 'Full address'),
                locationLink: $('home-medicine-map')?.value || '',
                deliveryNote: $('home-medicine-note')?.value || '',
                fullLocation: fullLocation('home-medicine'),
                source: 'Direct Home Page Order',
                submittedAt: now(),
                trackingId: id('MED'),
                status: 'Pending Pharmacy Approval',
                paymentStatus: 'Unpaid',
                paymentMethod: 'Not Selected'
            };
            const orders = read('medicineOrders', []);
            orders.unshift(order);
            write('medicineOrders', orders);
            localStorage.setItem('lastOrderTrackingId', order.trackingId);
            if (window.BusinessFeatures && typeof window.BusinessFeatures.syncNotificationsFromRecords === 'function') {
                window.BusinessFeatures.syncNotificationsFromRecords();
            }
            showDirectSuccess('medicine', `Medicine order sent directly to <strong>${esc(order.partner)}</strong>. Tracking ID: <strong>${esc(order.trackingId)}</strong>. Quantity: <strong>${esc(order.quantity)} ${esc(order.quantityType)}</strong>. Delivery: <strong>${esc(order.area)}, ${esc(order.city)}</strong>. <a href="order-tracking.html?tracking=${encodeURIComponent(order.trackingId)}">Track Order</a>`);
        } catch(err) {}
    }

    function submitHomeLabRequest(e) {
        e.preventDefault();
        try {
            const request = {
                patient: requiredValue('home-lab-patient', 'Patient name'),
                phone: requiredValue('home-lab-phone', 'Phone number'),
                details: requiredValue('direct-lab-test', 'Lab test'),
                tests: requiredValue('direct-lab-test', 'Lab test'),
                quantity: requiredValue('home-lab-quantity', 'Quantity'),
                quantityType: $('home-lab-unit')?.value || 'Test(s)',
                lab: $('home-lab-partner')?.value || 'City Diagnostic Lab',
                partner: $('home-lab-partner')?.value || 'City Diagnostic Lab',
                sampleMethod: $('direct-lab-method')?.value || 'Home Sample Collection - Lab Staff Comes Home',
                preferredDate: '',
                city: requiredValue('home-lab-city', 'City'),
                area: requiredValue('home-lab-area', 'Area'),
                address: requiredValue('home-lab-address', 'Full address'),
                locationLink: $('home-lab-map')?.value || '',
                locationNote: $('home-lab-note')?.value || '',
                fullLocation: fullLocation('home-lab'),
                source: 'Direct Home Page Booking',
                submittedAt: now(),
                trackingId: id('LAB'),
                status: 'Pending Lab Approval',
                paymentStatus: 'Unpaid',
                paymentMethod: 'Not Selected'
            };
            const requests = read('labTestRequests', []);
            requests.unshift(request);
            write('labTestRequests', requests);
            localStorage.setItem('lastOrderTrackingId', request.trackingId);
            if (window.BusinessFeatures && typeof window.BusinessFeatures.syncNotificationsFromRecords === 'function') {
                window.BusinessFeatures.syncNotificationsFromRecords();
            }
            showDirectSuccess('lab', `Lab test request sent directly to <strong>${esc(request.partner)}</strong>. Tracking ID: <strong>${esc(request.trackingId)}</strong>. Option: <strong>${esc(request.sampleMethod)}</strong>. Location: <strong>${esc(request.area)}, ${esc(request.city)}</strong>. <a href="order-tracking.html?tracking=${encodeURIComponent(request.trackingId)}">Track Request</a>`);
        } catch(err) {}
    }

    function showDirectSuccess(type, html) {
        const card = type === 'medicine' ? document.querySelector('.medicine-order-card') : document.querySelector('.direct-home-card');
        if (!card) return;
        let box = card.querySelector('.home-direct-success');
        if (!box) {
            box = document.createElement('div');
            box.className = 'booking-success home-direct-success';
            card.appendChild(box);
        }
        box.hidden = false;
        box.innerHTML = html;
        box.scrollIntoView({behavior:'smooth', block:'nearest'});
    }

    function refreshPartnerSelects() {
        const p = $('home-pharmacy-partner');
        if (p) p.innerHTML = partnerOptions('pharmacy');
        const l = $('home-lab-partner');
        if (l) l.innerHTML = partnerOptions('lab');
    }

    function init() {
        enhanceMedicineHomeCard();
        enhanceLabHomeCard();
        setTimeout(refreshPartnerSelects, 600);
        setTimeout(refreshPartnerSelects, 1500);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.HomeDirectOrders = { init, refreshPartnerSelects };
})();
