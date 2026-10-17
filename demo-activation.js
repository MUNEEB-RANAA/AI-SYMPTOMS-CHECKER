
/* Demo Activation
   Activates the static demo without requiring passwords for the default patient dashboard,
   and seeds website/admin data so all demo modules have records to show.
*/
(function () {
    function read(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
        catch (e) { return fallback; }
    }
    function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
    function hasById(list, id) { return Array.isArray(list) && list.some(item => item && item.id === id); }
    function now() { return new Date().toLocaleString(); }

    const demoPatient = {
        id:'PAT-DEMO-001',
        role:'patient',
        name:'Demo Patient',
        email:'demo.patient@example.com',
        phone:'+92 300 0000000',
        password:'demo123',
        createdAt:now(),
        dashboardVisits:0,
        autoDemo:true
    };

    const demoDoctor = {
        id:'DOC-DEMO-001',
        role:'doctor',
        status:'Selected',
        published:true,
        name:'Dr. Demo Ahmed',
        email:'doctor@demo.com',
        phone:'+92 300 1111111',
        password:'doctor123',
        license:'PMDC-DEMO-001',
        degree:'MBBS, FCPS',
        specialization:'General Physician',
        experience:'8 Years',
        hospital:'Demo Medical Center',
        clinic:'Demo Clinic',
        clinicAddress:'Main Medical Road, Karachi',
        city:'Karachi',
        fee:'2500',
        videoFee:'1800',
        availability:'10:00 AM - 4:00 PM',
        languages:'English, Urdu',
        submittedAt:now(),
        publishedAt:now()
    };

    const demoPharmacy = {
        id:'PHR-DEMO-001',
        type:'pharmacy',
        role:'pharmacy',
        status:'Selected',
        published:true,
        businessName:'Green Care Pharmacy',
        ownerName:'Demo Pharmacy Owner',
        email:'pharmacy@partner.com',
        phone:'0300 1112223',
        city:'Karachi',
        area:'North Nazimabad',
        license:'PHR-DEMO-001',
        password:'partner123',
        delivery:'Yes',
        pickup:'Yes',
        available24:'No',
        commission:'20%',
        address:'Main Market, Karachi',
        submittedAt:now(),
        publishedAt:now()
    };

    const demoLab = {
        id:'LAB-DEMO-001',
        type:'lab',
        role:'lab',
        status:'Selected',
        published:true,
        businessName:'City Diagnostic Lab',
        ownerName:'Demo Lab Manager',
        email:'lab@partner.com',
        phone:'0300 5556667',
        city:'Karachi',
        area:'Gulshan',
        license:'LAB-DEMO-001',
        password:'partner123',
        tests:'CBC, Sugar, HbA1c, Lipid Profile, Thyroid, Urine Test',
        homeSampling:'Yes',
        reportUpload:'Yes',
        reportTime:'24 Hours',
        commission:'20%',
        address:'Diagnostic Road, Karachi',
        submittedAt:now(),
        publishedAt:now()
    };

    function seedList(key, records) {
        const list = read(key, []);
        let changed = false;
        records.forEach(record => {
            if (!hasById(list, record.id)) {
                list.unshift(record);
                changed = true;
            }
        });
        if (changed) write(key, list);
    }

    function activateDemo() {
        seedList('patientUsers', [demoPatient]);
        seedList('doctorApplications', [demoDoctor]);
        seedList('approvedDoctors', [demoDoctor]);
        seedList('partnerApplications', [demoPharmacy, demoLab]);
        seedList('approvedPartners', [demoPharmacy, demoLab]);
        // Login is required. Demo data is seeded, but no automatic session is created.

        seedList('appointmentRequests', [{
            id:'APT-DEMO-001',
            patient:demoPatient.name,
            patientEmail:demoPatient.email,
            email:demoPatient.email,
            phone:demoPatient.phone,
            doctor:demoDoctor.name,
            specialist:demoDoctor.specialization,
            reason:'Fever with cough and body pain',
            symptoms:'Fever with cough and body pain for 2 days',
            date:new Date().toLocaleDateString(),
            time:'11:30 AM',
            method:'Clinic Visit',
            mode:'Clinic Visit',
            status:'Waiting',
            queueNumber:3,
            appointmentToken:'TOK-DEMO-001',
            token:'TOK-DEMO-001',
            reports:['CBC Report Demo'],
            sortTime:Date.now(),
            createdAt:now()
        }]);

        seedList('patientHealthHistory', [{
            id:'HIS-DEMO-001',
            patient:demoPatient.name,
            patientEmail:demoPatient.email,
            symptoms:'Fever, cough, sore throat and body pain',
            duration:'2 days',
            mode:'AI Symptom Checker',
            risk:'Moderate',
            specialist:'General Physician',
            createdAt:now()
        }]);

        seedList('medicineOrders', [{
            id:'MED-DEMO-001',
            trackingId:'MED-DEMO-001',
            patient:demoPatient.name,
            patientEmail:demoPatient.email,
            email:demoPatient.email,
            phone:demoPatient.phone,
            address:'Demo Address, Karachi',
            partner:demoPharmacy.businessName,
            partnerEmail:demoPharmacy.email,
            medicine:'Doctor suggested supportive medicine request',
            items:'Paracetamol request, cough syrup request',
            status:'Processing',
            total:'1200',
            createdAt:now()
        }]);

        seedList('labTestRequests', [{
            id:'LABREQ-DEMO-001',
            trackingId:'LABREQ-DEMO-001',
            patient:demoPatient.name,
            patientEmail:demoPatient.email,
            email:demoPatient.email,
            phone:demoPatient.phone,
            address:'Demo Address, Karachi',
            lab:demoLab.businessName,
            partner:demoLab.businessName,
            partnerEmail:demoLab.email,
            tests:'CBC, Random Blood Sugar',
            testName:'CBC, Random Blood Sugar',
            status:'Sample Scheduled',
            total:'1800',
            createdAt:now()
        }]);
    }

    activateDemo();
    window.DemoActivation = { activateDemo };
})();
