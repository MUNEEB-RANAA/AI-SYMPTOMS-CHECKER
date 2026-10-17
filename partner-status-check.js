
(function () {
    function $(id) { return document.getElementById(id); }
    function read(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
        catch (e) { return fallback; }
    }
    function esc(value) {
        return String(value || '').replace(/[&<>"']/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }
    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }
    const defaultPartners = [
        {id:'PHR-DEMO-001', type:'pharmacy', status:'Selected', published:true, businessName:'Green Care Pharmacy', ownerName:'Demo Pharmacy Owner', email:'pharmacy@partner.com', phone:'0300 1112223', city:'Karachi', area:'North Nazimabad', license:'PHR-DEMO-001', password:'partner123', submittedAt:'Demo Data', publishedAt:'Demo Data'},
        {id:'LAB-DEMO-001', type:'lab', status:'Selected', published:true, businessName:'City Diagnostic Lab', ownerName:'Demo Lab Manager', email:'lab@partner.com', phone:'0300 5556667', city:'Karachi', area:'Gulshan', license:'LAB-DEMO-001', password:'partner123', submittedAt:'Demo Data', publishedAt:'Demo Data'}
    ];
    function allPartnerRecords() {
        return [
            ...defaultPartners,
            ...read('partnerApplications', []),
            ...read('approvedPartners', [])
        ];
    }
    function statusClass(status) {
        const s = normalize(status);
        if (s.includes('selected') || s.includes('approved')) return 'selected';
        if (s.includes('reject') || s.includes('not selected')) return 'rejected';
        return 'pending';
    }
    function statusMessage(status) {
        if (status === 'Selected') return 'Your application is approved. You can login from login page and open your dashboard.';
        if (status === 'Not Selected') return 'Your application was rejected/not selected. Please contact admin or submit updated information.';
        return 'Your application is pending review. Admin has not approved it yet.';
    }
    function findRecord(type, query) {
        const q = normalize(query);
        const list = allPartnerRecords().filter(item => item.type === type);
        return list.find(item => {
            return normalize(item.id) === q ||
                   normalize(item.email) === q ||
                   normalize(item.license) === q ||
                   normalize(item.businessName) === q;
        });
    }
    function initStatusForm(type) {
        const form = $(type + '-status-check-form');
        const result = $(type + '-status-result');
        if (!form || !result) return;
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = form.querySelector('[name="statusQuery"]').value;
            const record = findRecord(type, query);
            result.hidden = false;
            if (!record) {
                result.innerHTML = `<strong>No application found.</strong><br>Please check your Application ID or registered email.`;
                return;
            }
            const status = record.status || 'Pending Review';
            result.innerHTML = `
                <div class="partner-status-result">
                    <strong>${esc(record.businessName || 'Partner Application')}</strong><br>
                    <span class="admin-status ${statusClass(status)}">${esc(status)}</span>
                    <p>${esc(statusMessage(status))}</p>
                    <small>
                        Application ID: <b>${esc(record.id)}</b><br>
                        Email: ${esc(record.email)}<br>
                        Submitted: ${esc(record.submittedAt || '-')}${record.reviewedAt ? '<br>Reviewed: ' + esc(record.reviewedAt) : ''}
                    </small>
                </div>`;
        });
    }
    document.addEventListener('DOMContentLoaded', function () {
        initStatusForm('pharmacy');
        initStatusForm('lab');
    });
})();
