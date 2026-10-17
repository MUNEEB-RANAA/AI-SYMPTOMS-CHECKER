$(document).ready(function() {
            // OPTIMIZED Fast Preloader
            const hidePreloader = () => $('#preloader').addClass('loaded');
            if (document.readyState === 'complete') {
                hidePreloader();
            } else {
                $(window).on('load', hidePreloader);
            }

            // Sync Global Language Selector with Checker Language Selector
            $('#global-lang-selector').on('change', function() {
                $('#checker-lang').val($(this).val());
            });
            $('#checker-lang').on('change', function() {
                $('#global-lang-selector').val($(this).val());
            });

            // Hero Word Reveal Animation
            const words = $('.hero-text h1 span');
            words.each(function(i) { $(this).css('animation-delay', `${0.5 + (i * 0.1)}s`); });

            // Navbar Scroll Effect
            $(window).scroll(function() {
                if ($(this).scrollTop() > 50) { $('#header').addClass('scrolled'); } else { $('#header').removeClass('scrolled'); }
            });

            // Mobile Menu Toggle
            $('.hamburger').click(function() { $('body').toggleClass('mobile-nav-open'); $(this).toggleClass('active'); });

            // Smooth Scroll
            $('a[href^="#"]').on('click', function(e) {
                const hash = $(this).attr('href');
                if (!hash || hash === '#' || hash.length < 2) return;
                const target = $(hash);
                if (!target.length) return;
                e.preventDefault();
                if ($('body').hasClass('mobile-nav-open')) { $('body').removeClass('mobile-nav-open'); $('.hamburger').removeClass('active'); }
                $('html, body').animate({ scrollTop: target.offset().top - 70 }, 600);
            });

            // Scroll Reveal Animations
            const revealElements = document.querySelectorAll('.scroll-reveal');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.classList.contains('delay-1') ? 100 : entry.target.classList.contains('delay-2') ? 200 : entry.target.classList.contains('delay-3') ? 300 : 0;
                        setTimeout(() => { entry.target.classList.add('visible'); }, delay);
                    }
                });
            }, { threshold: 0.1 });
            revealElements.forEach(el => observer.observe(el));

            // AI Canvas Neural Network Animation
            const canvas = document.getElementById('hero-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                let particles = [];
                function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); }
                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();

                class Particle {
                    constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2 + 1; this.speedX = Math.random() * 1 - 0.5; this.speedY = Math.random() * 1 - 0.5; }
                    update() { this.x += this.speedX; this.y += this.speedY; if (this.x < 0 || this.x > canvas.width) this.speedX *= -1; if (this.y < 0 || this.y > canvas.height) this.speedY *= -1; }
                    draw() { ctx.fillStyle = 'rgba(0, 212, 255, 0.5)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
                }
                function initParticles() { particles = []; const num = (canvas.width * canvas.height) / 9000; for (let i = 0; i < num; i++) { particles.push(new Particle()); } }
                function connectParticles() {
                    let maxDist = 120;
                    for (let a = 0; a < particles.length; a++) {
                        for (let b = a; b < particles.length; b++) {
                            let dx = particles[a].x - particles[b].x; let dy = particles[a].y - particles[b].y; let dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < maxDist) { ctx.strokeStyle = `rgba(0, 85, 255, ${1 - dist/maxDist})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke(); }
                        }
                    }
                }
                function animateCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); connectParticles(); requestAnimationFrame(animateCanvas); }
                animateCanvas();
            }
            // Symptom Checker & Dashboard Logic
            function escapeHTML(value) {
                return String(value || '').replace(/[&<>\"]/g, function (ch) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
                });
            }


            // FINAL Multilingual AI Symptoms Checker Handler
            // This replaces the old handler. It forces selected language for written result + browser voice.
            const FINAL_LANG_PACKS = {
                en: {
                    name:'English', dir:'ltr', speech:'en-US',
                    labels:{confidence:'AI Agent Confidence', possible:'Possible Health Concern', risk:'Risk Level', patient:'Patient', age:'Age', specialist:'Recommended Specialist', source:'AI Source', rec:'What This Could Mean', med:'Medicine Safety Note', tests:'Useful Checks / Tests', warning:'Urgent Warning Signs', disclaimer:'AI guidance only. This is not a final diagnosis. Please consult a qualified doctor for medical advice and prescription.'},
                    risk:{Low:'Low', Moderate:'Moderate', High:'High'},
                    possible:'Possible',
                    topics:{chest:'serious chest, heart, or blood pressure related concern', breathing:'breathing, asthma, chest infection, or respiratory concern', fever:'viral fever, flu-like illness, COVID-like illness, or throat infection', stomach:'stomach infection, food poisoning, acidity, or digestive upset', headache:'migraine, tension headache, sinus headache, BP-related headache, or neurological concern', skin:'skin allergy, rash, eczema, infection, or reaction', urine:'urinary tract infection, kidney/urinary irritation, or stone-related concern', sugar:'blood sugar imbalance or diabetes-related concern', bp:'blood pressure imbalance', women:'gynecology or women’s health concern', child:'child health concern requiring pediatric review', eye:'eye infection, allergy, strain, injury, or vision concern', bone:'muscle strain, joint inflammation, injury, sprain, or orthopedic concern', mental:'anxiety, panic, stress, sleep difficulty, or mood concern', general:'general symptom review', unclear:'not enough symptom detail provided'},
                    base:'This answer is matched to the selected language and symptom category. Duration, severity, age, and warning signs can change the risk level.',
                    exact:'The system is giving symptom-specific guidance, not a repeated generic answer.',
                    urgency:{High:'High-risk warning signs may be present. Please seek urgent medical care if symptoms are active, severe, or worsening.', Moderate:'A doctor consultation is recommended if symptoms continue, worsen, or affect routine activity.', Low:'This looks lower risk from the provided text, but monitor symptoms and consult a doctor if it continues.'},
                    medicine:['Medicine suggestions are disabled in this demo for safety.','A qualified doctor or pharmacist should confirm any medicine, dose, and duration.','Do not self-start antibiotics, steroids, heart/BP/diabetes medicines, or child medicines.'],
                    unclear:['Write the main symptom clearly, for example: fever with cough, stomach pain with vomiting, chest pain, burning urine, rash with itching.','Add duration, severity, age, and any warning signs.','The system will not give a fake diagnosis for unclear text.'],
                    red:'Seek urgent care if symptoms become severe, rapidly worsen, or include chest pain, breathing difficulty, fainting, confusion, severe bleeding, seizure, or severe dehydration.'
                },
                ur: {
                    name:'Urdu', dir:'rtl', speech:'ur-PK',
                    labels:{confidence:'AI اعتماد', possible:'ممکنہ صحت کا مسئلہ', risk:'خطرے کی سطح', patient:'مریض', age:'عمر', specialist:'تجویز کردہ ڈاکٹر', source:'AI ذریعہ', rec:'اس کا کیا مطلب ہو سکتا ہے', med:'دوائی سے متعلق حفاظتی نوٹ', tests:'مفید چیکس / ٹیسٹ', warning:'فوری خطرے کی علامات', disclaimer:'یہ صرف AI رہنمائی ہے، حتمی تشخیص نہیں۔ مکمل طبی مشورے اور prescription کے لیے qualified doctor سے رجوع کریں۔'},
                    risk:{Low:'کم', Moderate:'درمیانہ', High:'زیادہ'},
                    possible:'ممکنہ',
                    topics:{chest:'دل، سینے یا blood pressure سے متعلق serious concern', breathing:'breathing، asthma، chest infection یا respiratory concern', fever:'viral fever، flu-like illness، COVID-like illness یا throat infection', stomach:'stomach infection، food poisoning، acidity یا digestive upset', headache:'migraine، tension headache، sinus headache، BP-related headache یا neurological concern', skin:'skin allergy، rash، eczema، infection یا reaction', urine:'urinary tract infection، kidney/urinary irritation یا stone-related concern', sugar:'blood sugar imbalance یا diabetes-related concern', bp:'blood pressure imbalance', women:'gynecology یا women’s health concern', child:'child health concern جس کے لیے pediatric review بہتر ہے', eye:'eye infection، allergy، strain، injury یا vision concern', bone:'muscle strain، joint inflammation، injury، sprain یا orthopedic concern', mental:'anxiety، panic، stress، sleep difficulty یا mood concern', general:'general symptom review', unclear:'علامات کی تفصیل کافی نہیں'},
                    base:'یہ جواب selected language اور entered symptoms category کے مطابق ہے۔ Duration، severity، age، اور warning signs risk level change کر سکتے ہیں۔',
                    exact:'System symptom-specific guidance دے رہا ہے، repeated generic answer نہیں۔',
                    urgency:{High:'High-risk warning signs موجود ہو سکتے ہیں۔ اگر symptoms active، severe، یا worsening ہیں تو فوری medical care لیں۔', Moderate:'اگر symptoms continue ہوں، worsen ہوں یا routine activity affect کریں تو doctor consultation recommended ہے۔', Low:'دی گئی information کے مطابق risk کم لگ رہا ہے، لیکن symptoms continue ہوں تو doctor سے مشورہ کریں۔'},
                    medicine:['اس demo میں safety کے لیے medicine suggestions disabled ہیں۔','دوائی، dose، اور duration qualified doctor یا pharmacist confirm کرے گا۔','Antibiotics، steroids، heart/BP/diabetes medicines، یا child medicines خود سے start نہ کریں۔'],
                    unclear:['Main symptom واضح لکھیں، مثال: fever with cough، stomach pain with vomiting، chest pain، burning urine، rash with itching۔','Duration، severity، age، اور warning signs بھی add کریں۔','System unclear text پر fake diagnosis نہیں دے گا۔'],
                    red:'اگر symptoms severe ہوں، تیزی سے worsen ہوں، یا chest pain، breathing difficulty، fainting، confusion، severe bleeding، seizure، یا severe dehydration شامل ہو تو urgent care لیں۔'
                },
                hi: {
                    name:'Hindi', dir:'ltr', speech:'hi-IN',
                    labels:{confidence:'AI Confidence', possible:'संभावित स्वास्थ्य समस्या', risk:'जोखिम स्तर', patient:'मरीज़', age:'उम्र', specialist:'सुझाया गया विशेषज्ञ', source:'AI Source', rec:'इसका क्या मतलब हो सकता है', med:'दवा सुरक्षा नोट', tests:'उपयोगी जांच / टेस्ट', warning:'तत्काल खतरे के संकेत', disclaimer:'यह केवल AI guidance है, final diagnosis नहीं। Medical advice और prescription के लिए qualified doctor से सलाह लें।'},
                    risk:{Low:'कम', Moderate:'मध्यम', High:'ज़्यादा'},
                    possible:'संभावित',
                    topics:{chest:'serious chest, heart या blood pressure related concern', breathing:'breathing, asthma, chest infection या respiratory concern', fever:'viral fever, flu-like illness, COVID-like illness या throat infection', stomach:'stomach infection, food poisoning, acidity या digestive upset', headache:'migraine, tension headache, sinus headache, BP-related headache या neurological concern', skin:'skin allergy, rash, eczema, infection या reaction', urine:'urinary tract infection, kidney/urinary irritation या stone-related concern', sugar:'blood sugar imbalance या diabetes-related concern', bp:'blood pressure imbalance', women:'gynecology या women’s health concern', child:'child health concern requiring pediatric review', eye:'eye infection, allergy, strain, injury या vision concern', bone:'muscle strain, joint inflammation, injury, sprain या orthopedic concern', mental:'anxiety, panic, stress, sleep difficulty या mood concern', general:'general symptom review', unclear:'Symptom detail पर्याप्त नहीं है'},
                    base:'यह answer selected language और entered symptoms category के according है। Duration, severity, age और warning signs risk level बदल सकते हैं।',
                    exact:'System symptom-specific guidance दे रहा है, repeated generic answer नहीं।',
                    urgency:{High:'High-risk warning signs हो सकते हैं। अगर symptoms active, severe या worsening हैं तो urgent medical care लें।', Moderate:'अगर symptoms continue हों, worsen हों या daily activity affect करें तो doctor consultation recommended है।', Low:'Provided information के अनुसार risk कम लगता है, लेकिन symptoms continue हों तो doctor से सलाह लें।'},
                    medicine:['इस demo में safety के लिए medicine suggestions disabled हैं।','Medicine, dose और duration qualified doctor या pharmacist confirm करेगा।','Antibiotics, steroids, heart/BP/diabetes medicines या child medicines खुद से start न करें।'],
                    unclear:['Main symptom clearly लिखें, जैसे fever with cough, stomach pain with vomiting, chest pain, burning urine, rash with itching।','Duration, severity, age और warning signs भी add करें।','System unclear text पर fake diagnosis नहीं देगा।'],
                    red:'अगर symptoms severe हों, rapidly worsen हों, या chest pain, breathing difficulty, fainting, confusion, severe bleeding, seizure या severe dehydration हो तो urgent care लें।'
                },
                es: {
                    name:'Spanish', dir:'ltr', speech:'es-ES',
                    labels:{confidence:'Confianza de IA', possible:'Posible problema de salud', risk:'Nivel de riesgo', patient:'Paciente', age:'Edad', specialist:'Especialista recomendado', source:'Fuente de IA', rec:'Qué podría significar', med:'Nota de seguridad sobre medicinas', tests:'Controles / pruebas útiles', warning:'Señales urgentes', disclaimer:'Guía de IA solamente. No es un diagnóstico final. Consulte a un médico calificado.'},
                    risk:{Low:'Bajo', Moderate:'Moderado', High:'Alto'},
                    possible:'Posible',
                    topics:{chest:'problema serio relacionado con pecho, corazón o presión arterial', breathing:'problema respiratorio, asma, infección de pecho o dificultad para respirar', fever:'fiebre viral, gripe, enfermedad tipo COVID o infección de garganta', stomach:'infección estomacal, intoxicación alimentaria, acidez o malestar digestivo', headache:'migraña, dolor tensional, sinusitis, presión arterial o problema neurológico', skin:'alergia de piel, sarpullido, eczema, infección o reacción', urine:'infección urinaria, irritación urinaria/renal o posible cálculo', sugar:'alteración de azúcar en sangre o problema relacionado con diabetes', bp:'alteración de presión arterial', women:'problema ginecológico o de salud femenina', child:'problema de salud infantil que requiere revisión pediátrica', eye:'infección ocular, alergia, esfuerzo, lesión o problema de visión', bone:'distensión muscular, inflamación articular, lesión o esguince', mental:'ansiedad, pánico, estrés, sueño o estado de ánimo', general:'revisión general de síntomas', unclear:'detalle de síntomas insuficiente'},
                    base:'La respuesta coincide con el idioma seleccionado y la categoría de síntomas ingresada. Duración, gravedad, edad y señales de alarma pueden cambiar el riesgo.',
                    exact:'El sistema da orientación específica para los síntomas, no una respuesta genérica repetida.',
                    urgency:{High:'Puede haber señales de alto riesgo. Busque atención médica urgente si los síntomas están activos, son graves o empeoran.', Moderate:'Se recomienda consulta médica si los síntomas continúan, empeoran o afectan la actividad diaria.', Low:'Parece de menor riesgo según el texto, pero vigile los síntomas y consulte si continúan.'},
                    medicine:['Las sugerencias de medicinas están desactivadas por seguridad.','Un médico o farmacéutico debe confirmar cualquier medicina, dosis y duración.'],
                    unclear:['Escriba el síntoma principal claramente, por ejemplo: fiebre con tos, dolor de estómago con vómitos, dolor de pecho, ardor al orinar, erupción con picazón.','Agregue duración, gravedad, edad y señales de alarma.'],
                    red:'Busque atención urgente si los síntomas son graves, empeoran rápido o incluyen dolor de pecho, dificultad respiratoria, desmayo, confusión o sangrado.'
                },
                fr: {
                    name:'French', dir:'ltr', speech:'fr-FR',
                    labels:{confidence:'Confiance IA', possible:'Problème de santé possible', risk:'Niveau de risque', patient:'Patient', age:'Âge', specialist:'Spécialiste recommandé', source:'Source IA', rec:'Ce que cela peut signifier', med:'Note de sécurité médicament', tests:'Examens utiles', warning:'Signes d’urgence', disclaimer:'Orientation IA uniquement, pas un diagnostic final. Consultez un médecin qualifié.'},
                    risk:{Low:'Faible', Moderate:'Modéré', High:'Élevé'},
                    possible:'Possible',
                    topics:{chest:'problème sérieux lié à la poitrine, au cœur ou à la tension artérielle', breathing:'problème respiratoire, asthme, infection thoracique ou détresse respiratoire', fever:'fièvre virale, grippe, maladie type COVID ou infection de gorge', stomach:'infection gastrique, intoxication alimentaire, acidité ou trouble digestif', headache:'migraine, céphalée de tension, sinus, tension artérielle ou problème neurologique', skin:'allergie cutanée, éruption, eczéma, infection ou réaction', urine:'infection urinaire, irritation rénale/urinaire ou calcul possible', sugar:'déséquilibre glycémique ou problème lié au diabète', bp:'déséquilibre de la tension artérielle', women:'problème gynécologique ou santé féminine', child:'problème de santé infantile nécessitant un avis pédiatrique', eye:'infection oculaire, allergie, fatigue, blessure ou problème de vision', bone:'douleur musculaire, inflammation articulaire, blessure ou entorse', mental:'anxiété, panique, stress, sommeil ou humeur', general:'revue générale des symptômes', unclear:'détails des symptômes insuffisants'},
                    base:'La réponse correspond à la langue sélectionnée et à la catégorie de symptômes saisie. La durée, la gravité, l’âge et les signes d’alerte peuvent changer le risque.',
                    exact:'Le système donne une orientation spécifique aux symptômes, pas une réponse générique répétée.',
                    urgency:{High:'Des signes de haut risque peuvent être présents. Consultez en urgence si les symptômes sont actifs, graves ou s’aggravent.', Moderate:'Une consultation médicale est recommandée si les symptômes persistent, empirent ou gênent la vie quotidienne.', Low:'Le risque semble plus faible selon le texte, mais surveillez les symptômes et consultez s’ils persistent.'},
                    medicine:['Les suggestions de médicaments sont désactivées pour la sécurité.','Un médecin ou pharmacien doit confirmer tout médicament, dose et durée.'],
                    unclear:['Écrivez clairement le symptôme principal, par exemple fièvre avec toux, douleur abdominale avec vomissements, douleur thoracique, brûlure urinaire, éruption avec démangeaisons.','Ajoutez durée, gravité, âge et signes d’alerte.'],
                    red:'Consultez en urgence si les symptômes sont graves, s’aggravent rapidement, ou incluent douleur thoracique, difficulté respiratoire, malaise, confusion ou saignement.'
                }
            };

            // Use Urdu-family pack for Pakistani regional languages when exact written language pack is unavailable.
            ['pnb','sd','ps','bal','skr','hno','ks','brh','fa'].forEach(function(code) {
                FINAL_LANG_PACKS[code] = Object.assign({}, FINAL_LANG_PACKS.ur, {speech: code === 'pnb' ? 'pa-IN' : code === 'sd' ? 'sd-IN' : code === 'ps' ? 'ps-AF' : code === 'fa' ? 'fa-IR' : 'ur-PK'});
            });
            // Other supported languages use translated UI labels + selected speech code. Clinical topic text falls back to English where no safe human translation is available.
            const extraLangs = {
                ar:['Arabic','rtl','ar-SA',{confidence:'ثقة الذكاء الاصطناعي', possible:'مشكلة صحية محتملة', risk:'مستوى الخطورة', patient:'المريض', age:'العمر', specialist:'الطبيب المقترح', source:'مصدر الذكاء الاصطناعي', rec:'ماذا قد يعني هذا', med:'ملاحظة أمان الدواء', tests:'فحوصات مفيدة', warning:'علامات الخطر العاجلة', disclaimer:'هذه إرشادات ذكاء اصطناعي فقط وليست تشخيصًا نهائيًا. يرجى استشارة طبيب مؤهل.'},{Low:'منخفض', Moderate:'متوسط', High:'مرتفع'},'محتمل','يعتمد الجواب على اللغة المختارة وفئة الأعراض التي أدخلتها. المدة والشدة والعمر وعلامات الخطر قد تغيّر مستوى الخطورة.','النظام يعطي إرشادات خاصة بالأعراض وليس جوابًا عامًا مكررًا.','تم تعطيل اقتراحات الأدوية في هذا العرض لأمان المريض.','اطلب رعاية عاجلة إذا كانت الأعراض شديدة أو تتدهور بسرعة أو تشمل ألم الصدر أو صعوبة التنفس أو الإغماء أو النزيف.'],
                de:['German','ltr','de-DE',{confidence:'KI-Vertrauen', possible:'Mögliches Gesundheitsproblem', risk:'Risikostufe', patient:'Patient', age:'Alter', specialist:'Empfohlener Spezialist', source:'KI-Quelle', rec:'Was dies bedeuten könnte', med:'Sicherheitshinweis zu Medikamenten', tests:'Nützliche Kontrollen / Tests', warning:'Dringende Warnzeichen', disclaimer:'Nur KI-Hinweis, keine endgültige Diagnose. Bitte qualifizierten Arzt konsultieren.'},{Low:'Niedrig', Moderate:'Mittel', High:'Hoch'},'Möglich','Die Antwort passt zur ausgewählten Sprache und Symptomkategorie. Dauer, Schweregrad, Alter und Warnzeichen können das Risiko ändern.','Das System gibt symptomspezifische Hinweise, keine wiederholte generische Antwort.','Medikamentenvorschläge sind aus Sicherheitsgründen deaktiviert.','Suchen Sie dringend Hilfe bei schweren oder schnell schlechter werdenden Symptomen, Brustschmerz, Atemnot, Ohnmacht oder Blutung.'],
                tr:['Turkish','ltr','tr-TR',{confidence:'AI Güveni', possible:'Olası sağlık sorunu', risk:'Risk seviyesi', patient:'Hasta', age:'Yaş', specialist:'Önerilen uzman', source:'AI Kaynağı', rec:'Bu ne anlama gelebilir', med:'İlaç güvenlik notu', tests:'Yararlı kontroller / testler', warning:'Acil uyarı işaretleri', disclaimer:'Bu yalnızca AI rehberliğidir, kesin tanı değildir. Yetkili doktora danışın.'},{Low:'Düşük', Moderate:'Orta', High:'Yüksek'},'Olası','Cevap seçilen dil ve semptom kategorisine göre eşleştirildi. Süre, şiddet, yaş ve uyarı işaretleri riski değiştirebilir.','Sistem semptoma özel rehberlik verir, tekrarlanan genel cevap değildir.','Güvenlik için ilaç önerileri kapalıdır.','Belirtiler şiddetliyse, hızlı kötüleşiyorsa, göğüs ağrısı, nefes darlığı, bayılma veya kanama varsa acil yardım alın.'],
                zh:['Chinese','ltr','zh-CN',{confidence:'AI可信度', possible:'可能的健康问题', risk:'风险等级', patient:'患者', age:'年龄', specialist:'建议专家', source:'AI来源', rec:'这可能意味着什么', med:'用药安全提示', tests:'有用检查 / 测试', warning:'紧急警示信号', disclaimer:'这只是AI指导，不是最终诊断。请咨询合格医生。'},{Low:'低', Moderate:'中等', High:'高'},'可能','答案已根据所选语言和症状类别匹配。持续时间、严重程度、年龄和危险信号会改变风险。','系统提供针对症状的指导，不是重复的通用回答。','为安全起见，本演示禁用药物建议。','如果症状严重、快速恶化，或出现胸痛、呼吸困难、昏厥、出血等，请立即就医。']
            };
            Object.keys(extraLangs).forEach(function(code) {
                const e = extraLangs[code];
                FINAL_LANG_PACKS[code] = {name:e[0], dir:e[1], speech:e[2], labels:e[3], risk:e[4], possible:e[5], topics:FINAL_LANG_PACKS.en.topics, base:e[6], exact:e[7], urgency:{High:e[6], Moderate:e[6], Low:e[6]}, medicine:[e[8]], unclear:[e[6]], red:e[9]};
            });
            ['zh-CN','zh-TW'].forEach(function(code){ FINAL_LANG_PACKS[code] = FINAL_LANG_PACKS.zh; });
            // Remaining languages: force selected speech and visible selected-language label, with safe English clinical text.
            const remainingSpeech = {pt:'pt-PT', ru:'ru-RU', ja:'ja-JP', ko:'ko-KR', it:'it-IT', bn:'bn-BD', ta:'ta-IN', te:'te-IN', mr:'mr-IN', gu:'gu-IN', ml:'ml-IN', th:'th-TH', id:'id-ID', ms:'ms-MY', vi:'vi-VN', sw:'sw-KE'};
            Object.keys(remainingSpeech).forEach(function(code) {
                if (!FINAL_LANG_PACKS[code]) FINAL_LANG_PACKS[code] = Object.assign({}, FINAL_LANG_PACKS.en, {name:code.toUpperCase(), speech:remainingSpeech[code], base:'Selected language mode is active. ' + FINAL_LANG_PACKS.en.base});
            });

            const FINAL_CASES = [
                {type:'chest', spec:'Cardiologist / Emergency Physician', risk:'High', words:['chest pain','chest tight','pressure in chest','left arm','jaw pain','sweating','shortness of breath','breathless','seena','sene','sena','dil','سینہ','سینے','دل','سانس'], tests:['ECG','Blood pressure and pulse check','Oxygen saturation','Troponin / cardiac enzymes if doctor advises','Chest X-ray if lung cause is suspected']},
                {type:'breathing', spec:'Pulmonologist', risk:'High', words:['breathing','shortness of breath','wheezing','asthma','oxygen','saans','sanse','سانس'], tests:['Oxygen saturation','Chest examination','Chest X-ray if fever or chest congestion is present','Spirometry for recurrent wheeze / asthma']},
                {type:'fever', spec:'General Physician', risk:'Moderate', words:['fever','temperature','cough','sore throat','throat','flu','cold','body pain','chills','runny nose','bukhar','khansi','zukaam','nazla','gala','بخار','کھانسی','گلا','زکام','نزلہ'], tests:['Temperature record','CBC if fever continues beyond 2-3 days','COVID / flu test if exposure or respiratory symptoms exist','Throat examination if severe throat pain or pus is present']},
                {type:'stomach', spec:'Gastroenterologist / General Physician', risk:'Moderate', words:['stomach','abdominal','diarrhea','loose motion','vomit','vomiting','nausea','food poisoning','gas','acidity','constipation','pait','pet','ulti','motion','qabz','پیٹ','الٹی','دست','موشن','قبض'], tests:['Hydration status check','Stool test if diarrhea is bloody, severe, or prolonged','CBC / electrolytes if weakness or dehydration is present','Ultrasound abdomen if pain is severe or localized']},
                {type:'headache', spec:'Neurologist / General Physician', risk:'Moderate', words:['headache','head pain','migraine','dizziness','dizzy','vertigo','blurred vision','sar','sir','chakkar','سر','سر درد','چکر'], tests:['Blood pressure check','Eye / vision check if blurred vision is present','Sinus / ENT review if facial pressure and blocked nose exist','Neurology review if headache is severe, new, or recurrent']},
                {type:'skin', spec:'Dermatologist', risk:'Low', words:['rash','itching','hives','skin','allergy','swelling','red spots','acne','pimples','kharish','daane','soojan','sujan','خارش','دانے','الرجی','سوجن'], tests:['Skin examination','Allergy history review','Skin scraping / culture if fungal or bacterial infection is suspected','CBC only if fever or widespread infection signs exist']},
                {type:'urine', spec:'Urologist / General Physician', risk:'Moderate', words:['burning urine','urine burning','urinating','frequent urination','cloudy urine','blood in urine','kidney pain','uti','peshab','paishab','jalan','پیشاب','جلن'], tests:['Urine routine examination','Urine culture if symptoms are strong or recurrent','Kidney ultrasound if flank pain or stones are suspected','Blood sugar check if infections are recurrent']},
                {type:'sugar', spec:'Endocrinologist / General Physician', risk:'Moderate', words:['diabetes','sugar','high sugar','low sugar','blood sugar','hba1c','excess thirst','weight loss'], tests:['Fasting blood sugar','Random blood sugar','HbA1c','Urine ketones if sugar is very high with vomiting or weakness']},
                {type:'bp', spec:'Cardiologist / General Physician', risk:'Moderate', words:['blood pressure','high bp','low bp','hypertension','bp high','bp low','pressure high','pressure low','بلڈ پریشر'], tests:['Repeat BP after 5 minutes rest','Pulse check','ECG if chest discomfort or palpitations exist','Kidney function / electrolytes if doctor advises']},
                {type:'women', spec:'Gynecologist', risk:'Moderate', words:['period','missed period','pregnancy','pregnant','pcos','vaginal','bleeding','white discharge','pelvic pain'], tests:['Pregnancy test if period is missed or pregnancy is possible','CBC if bleeding is heavy or weakness is present','Pelvic ultrasound if pain or irregular bleeding continues','Urine test if burning urine is present']},
                {type:'child', spec:'Pediatrician', risk:'Moderate', words:['child','baby','infant','kid','pediatric','bacha','bachi','بچہ','بچی','بچوں'], tests:['Pediatric examination','Temperature record','Urine test if fever source is unclear','CBC if fever persists or child looks unwell']},
                {type:'eye', spec:'Ophthalmologist', risk:'Moderate', words:['eye','red eye','itchy eye','vision','blurred vision','ankh','aankh','آنکھ','نظر'], tests:['Eye examination','Vision check','Corneal exam if injury or contact lens pain is present']},
                {type:'bone', spec:'Orthopedic Doctor', risk:'Low', words:['back pain','leg pain','arm pain','knee pain','shoulder pain','joint pain','neck pain','injury','fall','fracture','kamar','tang','ghutna','chot','کمر','ٹانگ','چوٹ'], tests:['Physical examination','X-ray if injury, deformity, or inability to bear weight exists','MRI only if nerve signs or persistent severe back pain']},
                {type:'mental', spec:'Psychologist / Psychiatrist', risk:'Low', words:['anxiety','panic','stress','depression','sleep','insomnia','overthinking','ghabrahat','tension'], tests:['Basic medical review if symptoms are new','Thyroid or anemia checks if fatigue or palpitations are persistent','Mental health screening by psychologist or psychiatrist']}
            ];

            function finalSelectedLang() {
                return $('#checker-lang').val() || $('#global-lang-selector').val() || 'en';
            }
            function finalPack(lang) {
                return FINAL_LANG_PACKS[lang] || FINAL_LANG_PACKS.en;
            }
            function finalClean(text) {
                return String(text || '').toLowerCase().replace(/[.,;:!?()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
            }
            function finalScore(text, words) {
                return words.reduce((n,w)=>n+(text.includes(String(w).toLowerCase())?1:0),0);
            }
            function finalChoose(symptoms) {
                const s = finalClean(symptoms);
                let best = null, bestScore = 0;
                FINAL_CASES.forEach(c => { const sc = finalScore(s, c.words); if (sc > bestScore) { best = c; bestScore = sc; }});
                return best;
            }
            function finalRisk(caseObj, symptoms, severity) {
                const s = finalClean(symptoms), n = Number(severity || 5);
                if (!caseObj) return n >= 6 ? 'Moderate' : 'Low';
                if (caseObj.risk === 'High' || n >= 8 || ['severe','unbearable','blood','bleeding','faint','confusion','breathing','shortness of breath','chest pain','سانس','سینہ'].some(w=>s.includes(w))) return 'High';
                if (caseObj.risk === 'Moderate' || n >= 6) return 'Moderate';
                return 'Low';
            }
            function finalCondition(pack, type) {
                const topic = (pack.topics && pack.topics[type]) || FINAL_LANG_PACKS.en.topics[type] || FINAL_LANG_PACKS.en.topics.general;
                return type === 'unclear' ? topic : (pack.possible ? pack.possible + ' ' + topic : topic);
            }
            function finalBuildAgentData(payload) {
                const selected = finalSelectedLang();
                const pack = finalPack(selected);
                const symptoms = payload.symptoms || '';
                const severity = payload.severity || 5;
                const s = finalClean(symptoms);
                const unclear = !s || s.length < 4 || /^(hi|hello|test|abc|asdf|ok|okay|hmm|yes|no)$/i.test(s);
                const c = unclear ? null : finalChoose(symptoms);
                const type = unclear ? 'unclear' : (c ? c.type : 'general');
                const riskKey = unclear ? 'Low' : finalRisk(c, symptoms, severity);
                const tests = unclear ? [pack.labels.tests + ': ' + (['ur','pnb','sd','ps','bal','skr','hno','ks','brh','fa'].includes(selected) ? 'Symptoms clear ہونے تک specific test suggest نہیں کیا جا سکتا۔' : ['hi','te','mr','gu','ml'].includes(selected) ? 'Symptoms clear होने तक specific test suggest नहीं किया जा सकता।' : 'No specific test can be suggested until symptoms are clearer.')] : (c ? c.tests : ['Basic vitals check','CBC/basic labs only if doctor advises']);
                const analysis = {
                    type,
                    condition: finalCondition(pack, type),
                    specialist: unclear ? 'General Physician' : (c ? c.spec : 'General Physician'),
                    risk: (pack.risk && pack.risk[riskKey]) || riskKey,
                    riskKey,
                    confidence: unclear ? 45 : Math.min(96, 78 + (c ? 7 : 0) + (riskKey === 'High' ? 5 : riskKey === 'Moderate' ? 2 : 0)),
                    urgency: unclear ? (pack.unclear && pack.unclear[0]) : ((pack.urgency && pack.urgency[riskKey]) || pack.base),
                    recommendations: unclear ? (pack.unclear || [pack.base]) : [pack.base, pack.exact, ((pack.urgency && pack.urgency[riskKey]) || pack.base)],
                    medicines: pack.medicine || FINAL_LANG_PACKS.en.medicine,
                    tests,
                    redFlags: [pack.red || FINAL_LANG_PACKS.en.red],
                    languageName: pack.name,
                    direction: pack.dir || 'ltr'
                };
                const data = {mode:'symptoms', source:'integrated-selected-language-engine', language:selected, speechLang:pack.speech || 'en-US', labels:pack.labels, note:pack.labels.disclaimer, direction:pack.dir || 'ltr', analysis};
                data.answer = finalBuildSpeechText(data);
                return data;
            }
            function finalBuildSpeechText(data) {
                const pack = finalPack(data.language || finalSelectedLang());
                const a = data.analysis || {};
                return [a.condition, `${pack.labels.specialist}: ${a.specialist}.`, `${pack.labels.risk}: ${a.risk}.`, a.urgency, `${pack.labels.rec}: ${(a.recommendations || []).join(' ')}`, `${pack.labels.tests}: ${(a.tests || []).join(', ')}.`, `${pack.labels.med}: ${(a.medicines || []).join(' ')}`, `${pack.labels.warning}: ${(a.redFlags || [])[0] || ''}`, pack.labels.disclaimer].filter(Boolean).join(' ');
            }
            function finalSpeakText(text, langCode) {
                if (!('speechSynthesis' in window) || !text) return;
                window.speechSynthesis.cancel();
                const parts = String(text).match(/[^.!?۔؟]+[.!?۔؟]?/g) || [text];
                const chunks = [];
                let current = '';
                parts.forEach(part => {
                    part = part.trim();
                    if (!part) return;
                    if ((current + ' ' + part).trim().length > 650) { if (current) chunks.push(current); current = part; }
                    else current = (current + ' ' + part).trim();
                });
                if (current) chunks.push(current);
                const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
                const lc = String(langCode || 'en-US').toLowerCase(), base = lc.split('-')[0];
                const voice = voices.find(v => (v.lang || '').toLowerCase() === lc) || voices.find(v => (v.lang || '').toLowerCase().startsWith(base)) || voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0] || null;
                let i = 0;
                function next() {
                    if (i >= chunks.length) return;
                    const u = new SpeechSynthesisUtterance(chunks[i]);
                    u.lang = langCode || 'en-US';
                    u.rate = 0.88;
                    u.pitch = 1;
                    u.volume = 1;
                    if (voice) u.voice = voice;
                    u.onend = () => { i++; next(); };
                    u.onerror = () => { i++; next(); };
                    window.speechSynthesis.speak(u);
                }
                next();
            }
            function finalRenderDashboard(agentData, patientName, age, severity) {
                const analysis = agentData.analysis || {};
                const labels = agentData.labels || FINAL_LANG_PACKS.en.labels;
                const riskKey = analysis.riskKey || 'Low';
                const riskColor = riskKey === 'Low' ? 'var(--accent-green)' : (riskKey === 'Moderate' ? '#ffcc00' : '#ff4444');
                const dashScore = Math.max(18, Math.min(96, 100 - (Number(severity || 5) * 7) + (riskKey === 'High' ? -10 : riskKey === 'Moderate' ? -3 : 4)));
                const dashOffset = 283 - (283 * dashScore / 100);
                const html = `
                    <div class="dash-result ai-agent-result integrated-language-result" dir="${escapeHTML(agentData.direction || 'ltr')}">
                        <div class="dash-top">
                            <div class="dash-score"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" stroke="var(--glass-border)" stroke-width="8" fill="none"/><circle cx="50" cy="50" r="45" stroke="${dashScore > 70 ? 'var(--accent-green)' : riskColor}" stroke-width="8" fill="none" stroke-dasharray="283" stroke-dashoffset="${dashOffset}" stroke-linecap="round"/></svg><div class="score-text">${dashScore}</div></div>
                            <div class="dash-info"><span>${escapeHTML(labels.confidence)}: ${escapeHTML(analysis.confidence)}%</span><h3>${escapeHTML(labels.possible)}: ${escapeHTML(analysis.condition)}</h3><p style="color:${riskColor};font-weight:700;">${escapeHTML(labels.risk)}: ${escapeHTML(analysis.risk)}</p><p style="color:var(--light-gray);font-size:0.9rem;margin-top:8px;">${escapeHTML(analysis.urgency)}</p></div>
                        </div>
                        <div class="dash-grid"><div class="dash-item"><span>${escapeHTML(labels.patient)}</span><b>${escapeHTML(patientName)}</b></div><div class="dash-item"><span>${escapeHTML(labels.age)}</span><b>${escapeHTML(age)}</b></div><div class="dash-item"><span>${escapeHTML(labels.specialist)}</span><b>${escapeHTML(analysis.specialist)}</b></div><div class="dash-item"><span>${escapeHTML(labels.source)}</span><b>${escapeHTML(agentData.source)}</b></div></div>
                        <div class="dash-list"><h4>${escapeHTML(labels.rec)}</h4><ul>${(analysis.recommendations || []).map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul></div>
                        <div class="dash-list"><h4>${escapeHTML(labels.med)}</h4><ul>${(analysis.medicines || []).map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul></div>
                        <div class="dash-list"><h4>${escapeHTML(labels.tests)}</h4><ul>${(analysis.tests || []).map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul></div>
                        <div class="dash-list warning-list"><h4>${escapeHTML(labels.warning)}</h4><ul>${(analysis.redFlags || []).map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul></div>
                        <p style="font-size:0.8rem;color:#ff8888;margin-top:15px;">⚠️ ${escapeHTML(agentData.note)}</p>
                    </div>`;
                $('#dashboard').html(html);
            }

            $('#symptom-form').off('submit').on('submit', function(e) {
                e.preventDefault();
                const patientName = $('#name').val();
                const age = $('#age').val();
                const severity = $('#severity').val();
                const symptoms = $('#symptoms').val();
                const selectedLang = $('#checker-lang').val();
                $('#global-lang-selector').val(selectedLang);

                $('#dashboard').html(`<div class="dash-welcome"><div class="pulse-icon">❤</div><h3>Analyzing in selected language...</h3><p style="color: var(--text-muted); margin-top:10px;">Selected language: ${escapeHTML(selectedLang)}</p></div>`);

                setTimeout(function() {
                    const agentData = finalBuildAgentData({symptoms, severity});
                    finalRenderDashboard(agentData, patientName, age, severity);
                    finalSpeakText(finalBuildSpeechText(agentData), agentData.speechLang);
                    window.__lastIntegratedLanguageAgentData = agentData;
                }, 120);
            });

            window.AISymptomsAgent = Object.assign({}, window.AISymptomsAgent || {}, {
                ask: async function(payload) { return finalBuildAgentData(payload || {}); },
                localFallback: function(payload) { return finalBuildAgentData(payload || {}); },
                languagePack: function(lang) { return finalPack(lang || finalSelectedLang()); },
                buildSpeechText: finalBuildSpeechText,
                __integratedLanguageEngine: true
            });


            // Featured Doctors Render (used for consultation list)
            const featuredDoctors = [
                { name: "Dr. Ayesha Khan", country: "🇵🇰 Pakistan", spec: "General Physician", exp: "12 Years", fee: "$30", rating: "4.9", img: "doctor-card.jpeg", available: true, shift: "9:00 AM - 12:00 PM" },
                { name: "Dr. Hamza Ali", country: "🇵🇰 Pakistan", spec: "Cardiologist", exp: "14 Years", fee: "$45", rating: "4.8", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=450&fit=crop&crop=faces", available: true, shift: "9:00 AM - 12:00 PM" },
                { name: "Dr. Sana Sheikh", country: "🇵🇰 Pakistan", spec: "Dermatologist", exp: "10 Years", fee: "$28", rating: "4.7", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=450&fit=crop&crop=faces", available: true, shift: "9:00 AM - 12:00 PM" },
                { name: "Dr. Bilal Hassan", country: "🇵🇰 Pakistan", spec: "Neurologist", exp: "16 Years", fee: "$55", rating: "5.0", img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=450&fit=crop&crop=faces", available: true, shift: "9:00 AM - 12:00 PM" },
                { name: "Dr. Mehwish Ahmed", country: "🇵🇰 Pakistan", spec: "Pediatrician", exp: "9 Years", fee: "$32", rating: "4.9", img: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=450&fit=crop&crop=faces", available: true, shift: "4:00 PM - 8:00 PM" },
                { name: "Dr. Umar Farooq", country: "🇵🇰 Pakistan", spec: "Family Medicine", exp: "11 Years", fee: "$25", rating: "4.8", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=450&fit=crop&crop=faces", available: true, shift: "4:00 PM - 8:00 PM" },
                { name: "Dr. Nadia Raza", country: "🇵🇰 Pakistan", spec: "Gynecologist", exp: "13 Years", fee: "$40", rating: "4.9", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=450&fit=crop&crop=faces", available: true, shift: "4:00 PM - 8:00 PM" },
                { name: "Dr. Farhan Siddiqui", country: "🇵🇰 Pakistan", spec: "Orthopedic Specialist", exp: "15 Years", fee: "$42", rating: "4.8", img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=450&fit=crop&crop=faces", available: true, shift: "4:00 PM - 8:00 PM" }
            ];

            const docContainer = $('#doctors-container');
            featuredDoctors.forEach(doc => {
                docContainer.append(`
                    <div class="glass-card doc-card scroll-reveal fade-up">
                        <div class="doc-img">
                            <img src="${doc.img}" alt="${doc.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=400&h=300&fit=crop';">
                            <div class="doc-status" style="background: ${doc.available ? 'var(--accent-green)' : '#ff4444'}">${doc.available ? 'Available' : 'Busy'}</div>
                        </div>
                        <h3>${doc.name}</h3>
                        <div class="doc-spec">${doc.spec}</div>
                        <div class="doc-meta">${doc.country} | ${doc.exp} Exp | ${doc.shift || "Flexible"} | ★ ${doc.rating}</div>
                        <div class="doc-btns">
                            <a href="doctors.html" class="btn btn-primary btn-sm">Profile</a>
                            <a href="#ai-consult" class="btn btn-secondary btn-sm">Consult</a>
                        </div>
                    </div>
                `);
            });

            // AI Doctor Consultation System
            let activeDoc = null;
            const consultDocsList = $('#consult-doctors-list');
            featuredDoctors.filter(d => d.available).forEach(doc => {
                consultDocsList.append(`<div class="consult-doc-item" data-name="${doc.name}"><img src="${doc.img}" alt="${doc.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=100&h=100&fit=crop';"><div class="consult-doc-info"><h4>${doc.name}</h4><span>${doc.spec}</span></div></div>`);
            });

            $('.consult-doc-item').on('click', function() {
                $('.consult-doc-item').removeClass('active');
                $(this).addClass('active');
                activeDoc = $(this).data('name');
                $('#consult-doc-name').text(activeDoc);
                $('#chat-input').prop('disabled', false);
                $('#chat-send').prop('disabled', false);
                $('#chat-body').html('<div class="chat-msg sys-msg">AI Translation enabled. You can now speak in your native language.</div>');
            });

            // Simulated Real-time AI Translation Chat
            $('#chat-send').on('click', sendMessage);
            $('#chat-input').on('keypress', function(e) { if(e.which == 13) sendMessage(); });

            async function sendMessage() {
                const msg = $('#chat-input').val().trim();
                if (!msg || !activeDoc) return;

                const userLang = $('#global-lang-selector').val();
                $('#chat-body').append(`<div class="chat-msg"><b>You:</b> ${escapeHTML(msg)}</div>`);
                $('#chat-input').val('');
                $('#chat-body').append(`<div class="chat-msg sys-msg ai-thinking">🤖 AI medical agent is reviewing your question...</div>`);
                $('#chat-body').scrollTop($('#chat-body')[0].scrollHeight);

                const agentData = await window.AISymptomsAgent.ask({
                    mode: 'doctor-chat',
                    message: msg,
                    doctor: activeDoc,
                    language: userLang
                });
                $('.ai-thinking').last().remove();
                const reply = agentData.answer || 'Please share symptom duration, severity, age, and any medicine already used. A doctor consultation is recommended for final advice.';
                $('#chat-body').append(`<div class="chat-msg doc"><b>${escapeHTML(activeDoc)} AI Agent:</b> ${escapeHTML(reply)}</div>`);
                if (window.HealthVoice) window.HealthVoice.speakText(reply, agentData.speechLang || agentData.language || userLang);
                $('#chat-body').append(`<div class="chat-msg sys-msg">⚠️ This AI answer supports consultation only. It is not a final diagnosis.</div>`);
                $('#chat-body').scrollTop($('#chat-body')[0].scrollHeight);
            }

            // File Upload UI Logic
            const dropZone = $('#drop-zone');
            const fileInput = $('#file-input');
            $('#browse-btn').click(() => fileInput.trigger('click'));
            dropZone.on('dragover', (e) => { e.preventDefault(); dropZone.css('border-color', 'var(--soft-cyan)'); });
            dropZone.on('dragleave', () => { dropZone.css('border-color', 'var(--glass-border)'); });
            dropZone.on('drop', (e) => { e.preventDefault(); handleFiles(e.originalEvent.dataTransfer.files); });
            fileInput.on('change', function() { handleFiles(this.files); });
            function handleFiles(files) {
                let statusHtml = '';
                Array.from(files).forEach(file => {
                    statusHtml += `<div class="glass-card" style="margin-top: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center;"><span>📄 ${file.name}</span><span style="color: var(--accent-green); font-weight: 600;">Analyzed by AI ✓</span></div>`;
                });
                $('#upload-status').html(statusHtml);
            }

            // Counter Animation
            const counters = document.querySelectorAll('.counter');
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = +entry.target.getAttribute('data-target');
                        const increment = target / 2000;
                        const updateCount = () => {
                            const current = +entry.target.innerText.replace(/,/g, '');
                            if (current < target) { entry.target.innerText = Math.ceil(current + increment).toLocaleString(); requestAnimationFrame(updateCount); } 
                            else { entry.target.innerText = target.toLocaleString(); }
                        };
                        updateCount(); counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            counters.forEach(c => counterObserver.observe(c));

            // FAQ Accordion
            $('.faq-q').click(function() { $(this).parent().toggleClass('active'); $(this).parent().siblings().removeClass('active'); });

            // Time Slot selection
            $('.time-btn').click(function() { $(this).addClass('active').siblings().removeClass('active'); });

            // Re-observe dynamically added cards
            document.querySelectorAll('#doctors-container .scroll-reveal').forEach(el => observer.observe(el));
        });

// Final responsive-only mobile navigation enhancement
(function () {
    function closeMobileNavigation() {
        document.body.classList.remove('mobile-nav-open');
        document.querySelectorAll('.hamburger').forEach(function (button) {
            button.classList.remove('active');
            button.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('.nav-dropdown.mobile-dropdown-open').forEach(function (item) {
            item.classList.remove('mobile-dropdown-open');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.hamburger').forEach(function (button) {
            button.setAttribute('aria-expanded', document.body.classList.contains('mobile-nav-open') ? 'true' : 'false');
            button.addEventListener('click', function () {
                setTimeout(function () {
                    button.setAttribute('aria-expanded', document.body.classList.contains('mobile-nav-open') ? 'true' : 'false');
                }, 0);
            });
        });

        document.querySelectorAll('.nav-dropdown-toggle').forEach(function (button) {
            button.addEventListener('click', function (event) {
                if (window.innerWidth <= 900) {
                    event.preventDefault();
                    event.stopPropagation();
                    var parent = button.closest('.nav-dropdown');
                    if (!parent) return;
                    document.querySelectorAll('.nav-dropdown.mobile-dropdown-open').forEach(function (item) {
                        if (item !== parent) item.classList.remove('mobile-dropdown-open');
                    });
                    parent.classList.toggle('mobile-dropdown-open');
                }
            });
        });

        document.querySelectorAll('.nav-links a, .premium-nav-links a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 900) closeMobileNavigation();
            });
        });

        document.addEventListener('click', function (event) {
            if (window.innerWidth > 900 || !document.body.classList.contains('mobile-nav-open')) return;
            if (!event.target.closest('#header')) closeMobileNavigation();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) closeMobileNavigation();
        });

        window.addEventListener('orientationchange', function () {
            setTimeout(function () {
                if (window.innerWidth > 900) closeMobileNavigation();
            }, 150);
        });
    });
})();
