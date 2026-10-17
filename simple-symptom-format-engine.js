
(function () {
  "use strict";
  // FAST MODE ENABLED: instant answer, deferred voice, no artificial delay.

  const LANG = {
    en: {dir:"ltr", speech:"en-US", labels:{
      analyzing:"Checking symptoms...",
      possible:"Possible Issue", risk:"Risk", level:"Reading / Level", ignored:"If ignored", doctor:"Doctor",
      do:"What to do", dont:"What not to do", emergency:"Emergency", note:"Note", source:"Screening Engine",
      low:"Low", moderate:"Moderate", high:"High", notProvided:"Not provided",
      disclaimer:"This is not a final diagnosis. Consult a qualified doctor for confirmation."
    }},
    ur: {dir:"rtl", speech:"ur-PK", labels:{
      analyzing:"علامات چیک ہو رہی ہیں...",
      possible:"ممکنہ مسئلہ", risk:"خطرہ", level:"ریڈنگ / لیول", ignored:"نظر انداز کیا تو", doctor:"ڈاکٹر",
      do:"کیا کریں", dont:"کیا نہ کریں", emergency:"ایمرجنسی", note:"نوٹ", source:"Screening Engine",
      low:"کم", moderate:"درمیانہ", high:"زیادہ", notProvided:"نہیں دی گئی",
      disclaimer:"یہ حتمی تشخیص نہیں۔ تصدیق کے لیے مستند ڈاکٹر سے رجوع کریں۔"
    }},
    hi: {dir:"ltr", speech:"hi-IN", labels:{
      analyzing:"लक्षण चेक हो रहे हैं...",
      possible:"संभावित समस्या", risk:"जोखिम", level:"रीडिंग / लेवल", ignored:"नज़रअंदाज़ किया तो", doctor:"डॉक्टर",
      do:"क्या करें", dont:"क्या न करें", emergency:"इमरजेंसी", note:"नोट", source:"Screening Engine",
      low:"कम", moderate:"मध्यम", high:"ज़्यादा", notProvided:"नहीं दी गई",
      disclaimer:"यह final diagnosis नहीं है। पुष्टि के लिए qualified doctor से सलाह लें।"
    }},
    ar: {dir:"rtl", speech:"ar-SA", labels:{
      analyzing:"يتم فحص الأعراض...", possible:"المشكلة المحتملة", risk:"درجة الخطورة", level:"القراءة / المستوى", ignored:"إذا تم تجاهلها", doctor:"الطبيب المناسب",
      do:"ماذا تفعل", dont:"ما يجب تجنبه", emergency:"الطوارئ", note:"ملاحظة", source:"محرك الفحص",
      low:"منخفض", moderate:"متوسط", high:"مرتفع", notProvided:"غير مذكور",
      disclaimer:"هذه نتيجة فحص أولية وليست تشخيصًا نهائيًا. راجع طبيبًا مؤهلًا للتأكيد."
    }},
    es: {dir:"ltr", speech:"es-ES", labels:{
      analyzing:"Analizando síntomas...", possible:"Posible problema", risk:"Riesgo", level:"Lectura / nivel", ignored:"Si se ignora", doctor:"Médico",
      do:"Qué hacer", dont:"Qué no hacer", emergency:"Emergencia", note:"Nota", source:"Motor de evaluación",
      low:"Bajo", moderate:"Moderado", high:"Alto", notProvided:"No indicado",
      disclaimer:"Esto no es un diagnóstico final. Consulte a un médico calificado para confirmación."
    }},
    fr: {dir:"ltr", speech:"fr-FR", labels:{
      analyzing:"Analyse des symptômes...", possible:"Problème possible", risk:"Risque", level:"Lecture / niveau", ignored:"Si ignoré", doctor:"Médecin",
      do:"Que faire", dont:"À éviter", emergency:"Urgence", note:"Remarque", source:"Moteur de dépistage",
      low:"Faible", moderate:"Modéré", high:"Élevé", notProvided:"Non indiqué",
      disclaimer:"Ce n’est pas un diagnostic final. Consultez un médecin qualifié pour confirmation."
    }},
    de: {dir:"ltr", speech:"de-DE", labels:{
      analyzing:"Symptome werden geprüft...", possible:"Mögliches Problem", risk:"Risiko", level:"Messwert / Level", ignored:"Wenn ignoriert", doctor:"Arzt",
      do:"Was tun", dont:"Was vermeiden", emergency:"Notfall", note:"Hinweis", source:"Screening Engine",
      low:"Niedrig", moderate:"Mittel", high:"Hoch", notProvided:"Nicht angegeben",
      disclaimer:"Dies ist keine endgültige Diagnose. Bitte ärztlich bestätigen lassen."
    }},
    pt: {dir:"ltr", speech:"pt-PT", labels:{
      analyzing:"Analisando sintomas...", possible:"Possível problema", risk:"Risco", level:"Leitura / nível", ignored:"Se ignorado", doctor:"Médico",
      do:"O que fazer", dont:"O que evitar", emergency:"Emergência", note:"Nota", source:"Motor de triagem",
      low:"Baixo", moderate:"Moderado", high:"Alto", notProvided:"Não informado",
      disclaimer:"Isto não é diagnóstico final. Consulte um médico qualificado para confirmação."
    }},
    ru: {dir:"ltr", speech:"ru-RU", labels:{
      analyzing:"Проверка симптомов...", possible:"Возможная проблема", risk:"Риск", level:"Показатель / уровень", ignored:"Если игнорировать", doctor:"Врач",
      do:"Что делать", dont:"Чего не делать", emergency:"Экстренно", note:"Примечание", source:"Скрининг",
      low:"Низкий", moderate:"Средний", high:"Высокий", notProvided:"Не указано",
      disclaimer:"Это не окончательный диагноз. Обратитесь к квалифицированному врачу для подтверждения."
    }},
    tr: {dir:"ltr", speech:"tr-TR", labels:{
      analyzing:"Belirtiler kontrol ediliyor...", possible:"Olası sorun", risk:"Risk", level:"Ölçüm / seviye", ignored:"İhmal edilirse", doctor:"Doktor",
      do:"Ne yapmalı", dont:"Ne yapmamalı", emergency:"Acil durum", note:"Not", source:"Tarama motoru",
      low:"Düşük", moderate:"Orta", high:"Yüksek", notProvided:"Belirtilmedi",
      disclaimer:"Bu kesin tanı değildir. Onay için yetkili doktora başvurun."
    }},
    zh: {dir:"ltr", speech:"zh-CN", labels:{
      analyzing:"正在检查症状...", possible:"可能问题", risk:"风险", level:"读数 / 水平", ignored:"如果忽视", doctor:"建议医生",
      do:"应该做什么", dont:"不要做什么", emergency:"急诊情况", note:"提示", source:"筛查引擎",
      low:"低", moderate:"中等", high:"高", notProvided:"未提供",
      disclaimer:"这不是最终诊断。请咨询合格医生确认。"
    }},
    ja: {dir:"ltr", speech:"ja-JP", labels:{
      analyzing:"症状を確認しています...", possible:"考えられる問題", risk:"リスク", level:"数値 / レベル", ignored:"放置した場合", doctor:"推奨医師",
      do:"すること", dont:"避けること", emergency:"緊急", note:"注意", source:"スクリーニング",
      low:"低い", moderate:"中等度", high:"高い", notProvided:"未入力",
      disclaimer:"これは確定診断ではありません。確認のため医師に相談してください。"
    }},
    ko: {dir:"ltr", speech:"ko-KR", labels:{
      analyzing:"증상을 확인하는 중...", possible:"가능한 문제", risk:"위험도", level:"수치 / 수준", ignored:"방치하면", doctor:"권장 의사",
      do:"해야 할 일", dont:"하지 말아야 할 일", emergency:"응급", note:"참고", source:"스크리닝 엔진",
      low:"낮음", moderate:"보통", high:"높음", notProvided:"제공되지 않음",
      disclaimer:"이것은 최종 진단이 아닙니다. 확인을 위해 의사와 상담하세요."
    }},
    it: {dir:"ltr", speech:"it-IT", labels:{
      analyzing:"Controllo dei sintomi...", possible:"Possibile problema", risk:"Rischio", level:"Lettura / livello", ignored:"Se ignorato", doctor:"Medico",
      do:"Cosa fare", dont:"Cosa evitare", emergency:"Emergenza", note:"Nota", source:"Motore di screening",
      low:"Basso", moderate:"Moderato", high:"Alto", notProvided:"Non indicato",
      disclaimer:"Non è una diagnosi finale. Consultare un medico qualificato per conferma."
    }},
    bn: {dir:"ltr", speech:"bn-BD", labels:{
      analyzing:"লক্ষণ পরীক্ষা করা হচ্ছে...", possible:"সম্ভাব্য সমস্যা", risk:"ঝুঁকি", level:"রিডিং / লেভেল", ignored:"উপেক্ষা করলে", doctor:"ডাক্তার",
      do:"কি করবেন", dont:"কি করবেন না", emergency:"জরুরি", note:"নোট", source:"স্ক্রিনিং ইঞ্জিন",
      low:"কম", moderate:"মাঝারি", high:"উচ্চ", notProvided:"দেওয়া হয়নি",
      disclaimer:"এটি চূড়ান্ত রোগনির্ণয় নয়। নিশ্চিত করতে যোগ্য ডাক্তারের পরামর্শ নিন।"
    }},
    id: {dir:"ltr", speech:"id-ID", labels:{
      analyzing:"Memeriksa gejala...", possible:"Masalah yang mungkin", risk:"Risiko", level:"Bacaan / level", ignored:"Jika diabaikan", doctor:"Dokter",
      do:"Yang harus dilakukan", dont:"Yang harus dihindari", emergency:"Darurat", note:"Catatan", source:"Mesin skrining",
      low:"Rendah", moderate:"Sedang", high:"Tinggi", notProvided:"Tidak diberikan",
      disclaimer:"Ini bukan diagnosis akhir. Konsultasikan dengan dokter untuk konfirmasi."
    }},
    ms: {dir:"ltr", speech:"ms-MY", labels:{
      analyzing:"Memeriksa simptom...", possible:"Masalah mungkin", risk:"Risiko", level:"Bacaan / tahap", ignored:"Jika diabaikan", doctor:"Doktor",
      do:"Apa perlu dibuat", dont:"Apa perlu dielakkan", emergency:"Kecemasan", note:"Nota", source:"Enjin saringan",
      low:"Rendah", moderate:"Sederhana", high:"Tinggi", notProvided:"Tidak diberi",
      disclaimer:"Ini bukan diagnosis akhir. Sila rujuk doktor bertauliah untuk pengesahan."
    }},
    vi: {dir:"ltr", speech:"vi-VN", labels:{
      analyzing:"Đang kiểm tra triệu chứng...", possible:"Vấn đề có thể", risk:"Mức rủi ro", level:"Chỉ số / mức", ignored:"Nếu bỏ qua", doctor:"Bác sĩ",
      do:"Nên làm", dont:"Không nên làm", emergency:"Khẩn cấp", note:"Ghi chú", source:"Công cụ sàng lọc",
      low:"Thấp", moderate:"Trung bình", high:"Cao", notProvided:"Không cung cấp",
      disclaimer:"Đây không phải chẩn đoán cuối cùng. Hãy gặp bác sĩ để xác nhận."
    }},
    sw: {dir:"ltr", speech:"sw-KE", labels:{
      analyzing:"Inakagua dalili...", possible:"Tatizo linalowezekana", risk:"Hatari", level:"Kiwango / kipimo", ignored:"Ukikipuuza", doctor:"Daktari",
      do:"Cha kufanya", dont:"Usichofanya", emergency:"Dharura", note:"Kumbuka", source:"Mfumo wa uchunguzi",
      low:"Chini", moderate:"Wastani", high:"Juu", notProvided:"Haijatolewa",
      disclaimer:"Hii si utambuzi wa mwisho. Muone daktari kuthibitisha."
    }}
  };

  const ALIAS = {
    "zh-CN":"zh","zh-TW":"zh", "fa":"ur", "pnb":"ur", "sd":"ur", "ps":"ur", "bal":"ur", "skr":"ur", "hno":"ur", "ks":"ur", "brh":"ur",
    "ta":"hi", "te":"hi", "mr":"hi", "gu":"hi", "ml":"hi", "th":"en"
  };

  const TEXT = {
    en: {
      general: ["Unclear symptoms", "The symptoms are not specific enough to identify one issue.", "General Physician", "Write symptoms clearly with duration and severity. Monitor if it improves or worsens.", "Do not self-medicate when symptoms are unclear.", "Severe pain, breathing difficulty, chest pain, fainting, bleeding or confusion.", "Unclear symptoms can delay correct care.", "No specific reading provided."],
      fever: ["Fever / Flu / Viral infection", "Fever with cough, body pain, sore throat or runny nose can be flu or viral infection.", "General Physician", "Rest, drink fluids, monitor temperature, and consult doctor if fever lasts 2-3 days or worsens.", "Do not take unnecessary antibiotics or mix fever medicines.", "Breathing issue, chest pain, confusion, dehydration, very high fever, or fever in infant.", "Ignoring fever may cause dehydration or delay diagnosis of dengue, malaria or infection.", "Temperature reading should be monitored."],
      dengue: ["Possible Dengue / Malaria fever", "High fever with severe body pain, rash, eye pain, mosquito exposure or platelets concern may need dengue/malaria testing.", "General Physician / Internal Medicine", "Drink fluids, avoid dehydration, and get CBC/platelet test if fever is high or persistent.", "Avoid aspirin/ibuprofen unless doctor says safe.", "Bleeding, severe abdominal pain, persistent vomiting, drowsiness, cold hands/feet or low platelets.", "Ignoring it may lead to dehydration, bleeding risk, platelet drop or severe infection.", "Check CBC and platelet count."],
      chest: ["Chest pain / possible heart warning", "Chest pain, pressure, sweating, arm/jaw pain or breathlessness can be serious.", "Emergency Physician / Cardiologist", "Stop activity, sit upright, and seek urgent medical care if pain is active or severe.", "Do not drive yourself or take random heart medicines.", "Chest pain with sweating, left arm/jaw pain, breathlessness, fainting or severe weakness.", "Ignoring chest pain can delay treatment for heart attack or serious heart condition.", "BP and oxygen should be checked; ECG may be needed."],
      breathing: ["Breathing problem", "Shortness of breath, wheezing or oxygen issue can involve lungs, asthma or infection.", "Pulmonologist / Emergency Physician", "Sit upright, avoid smoke/dust, use prescribed inhaler only if already given, and seek urgent care if breathing is difficult.", "Do not start antibiotics or steroids without doctor advice.", "Blue lips, severe breathlessness, chest pain, confusion, low oxygen, or unable to speak full sentences.", "Ignoring breathing difficulty can cause oxygen drop and serious complications.", "Oxygen saturation should be checked."],
      stomach: ["Stomach infection / acidity / gastroenteritis", "Vomiting, diarrhea, nausea or stomach pain can be infection, food poisoning, acidity or dehydration.", "General Physician / Gastroenterologist", "Take small sips of clean fluids/ORS, eat light food, and consult doctor if pain or vomiting/diarrhea continues.", "Do not take random antibiotics or strong painkillers.", "Blood in stool/vomit, severe abdominal pain, persistent vomiting, fainting or dehydration.", "Ignoring it may cause dehydration or missed abdominal emergency.", "Hydration status should be checked."],
      headache: ["Headache / Migraine / BP-related headache", "Headache may be from migraine, stress, dehydration, BP issue or infection depending on symptoms.", "General Physician / Neurologist", "Rest in a quiet place, drink fluids, check BP if possible, and consult doctor if severe or repeated.", "Do not overuse painkillers.", "Sudden worst headache, neck stiffness, weakness, confusion, fainting, seizure or vision loss.", "Ignoring severe headache may delay stroke, infection or BP-related care.", "BP and sugar may need checking."],
      skin: ["Skin / scalp allergy or irritation", "Itching, rash, dandruff or irritation after hair/skin product may be allergy or dermatitis.", "Dermatologist", "Stop suspected product, wash gently with mild shampoo/water, avoid scratching, and see dermatologist if it continues.", "Do not apply strong creams, acids, lemon, garlic or harsh home remedies.", "Face/lip swelling, breathing difficulty, widespread rash, pus, fever or severe burning.", "Ignoring allergy can worsen rash, infection or swelling.", "No blood level needed; skin/scalp exam may be needed."],
      urine: ["Urinary infection / UTI", "Burning urine, frequent urination, lower abdominal pain or fever may suggest UTI.", "General Physician / Urologist", "Drink water if allowed, do urine test, and consult doctor for proper treatment.", "Do not start antibiotics without urine test/doctor advice.", "Fever with back pain, blood in urine, pregnancy with urinary symptoms, severe pain or unable to pass urine.", "Ignoring UTI can spread to kidneys and cause serious infection.", "Urine complete test and culture may be needed."],
      sugar: ["High / low blood sugar concern", "Sugar symptoms or abnormal readings need measured interpretation.", "Endocrinologist / General Physician", "Check sugar reading, drink water if high, avoid sugary drinks, and consult doctor if repeatedly high/low.", "Do not change insulin or diabetes medicines without doctor advice.", "Confusion, unconsciousness, vomiting with high sugar, severe weakness or very low sugar symptoms.", "Ignoring abnormal sugar can cause dehydration, weakness, fainting, kidney/eye/nerve complications over time.", "Fasting 100-125 mg/dL suggests prediabetes range; fasting 126+ mg/dL or random 200+ with symptoms needs doctor confirmation."],
      bp: ["Blood pressure concern", "High or low BP, palpitations, dizziness or headache may need BP review.", "General Physician / Cardiologist", "Rest 5 minutes, recheck BP, write systolic/diastolic and pulse, and consult doctor if repeated abnormal.", "Do not start/stop BP medicine without doctor advice.", "BP over 180/120 with chest pain, breathlessness, weakness, vision change or speaking difficulty.", "Ignoring high BP can increase risk of stroke, heart attack, kidney or eye damage.", "Normal BP is below 120/80; 180/120 or higher with symptoms is emergency."],
      women: ["Women health concern", "Periods, pregnancy, pelvic pain, discharge or abnormal bleeding need gynecology review.", "Gynecologist", "Track cycle dates, bleeding, pain location and pregnancy possibility; consult gynecologist.", "Do not take hormonal/pregnancy medicines without doctor advice.", "Heavy bleeding, pregnancy with severe pain/bleeding, fainting, fever or severe pelvic pain.", "Ignoring symptoms may delay treatment for pregnancy complication, infection or anemia.", "Pregnancy test/CBC/ultrasound may be needed."],
      child: ["Child health concern", "Children and infants need safer assessment because symptoms can worsen faster.", "Pediatrician", "Monitor fever, feeding, urine, activity and breathing; consult pediatrician if symptoms continue.", "Do not give adult medicines or adult doses.", "Infant fever, breathing difficulty, dehydration, persistent vomiting, seizure, blue lips or drowsiness.", "Ignoring child symptoms can lead to dehydration or rapid worsening.", "Temperature and hydration should be checked."],
      mental: ["Anxiety / stress / mental health concern", "Stress, panic, sleep problems or low mood may need mental-health support.", "Psychologist / Psychiatrist", "Talk to a trusted person, slow breathing during panic, and seek professional support if daily life is affected.", "Do not start sleeping pills or psychiatric medicine without psychiatrist.", "Self-harm thoughts, suicidal plan, hallucinations, severe panic or feeling unsafe.", "Ignoring mental health symptoms can worsen sleep, mood, panic and daily functioning.", "No blood level; mental health screening may be needed."]
    },
    ur: {
      general: ["غیر واضح علامات", "علامات ایک واضح مسئلے کے لیے کافی specific نہیں۔", "جنرل فزیشن", "علامات duration اور severity کے ساتھ واضح لکھیں، اور دیکھیں بہتر ہو رہی ہیں یا خراب۔", "علامات واضح نہ ہوں تو خود سے دوا نہ لیں۔", "شدید درد، سانس کی مشکل، سینے کا درد، بے ہوشی، خون یا confusion۔", "نظر انداز کرنے سے درست علاج میں دیر ہو سکتی ہے۔", "کوئی specific reading نہیں دی گئی۔"],
      fever: ["بخار / فلو / وائرل انفیکشن", "بخار کے ساتھ کھانسی، جسم درد، گلا درد یا نزلہ flu/viral infection ہو سکتا ہے۔", "جنرل فزیشن", "آرام کریں، پانی/fluids لیں، temperature monitor کریں، بخار 2-3 دن رہے یا بڑھے تو doctor سے ملیں۔", "غیر ضروری antibiotic یا fever medicines mix نہ کریں۔", "سانس کی مشکل، سینے کا درد، confusion، dehydration، بہت تیز بخار یا infant fever۔", "بخار نظر انداز کرنے سے dehydration یا dengue/malaria/infection کی diagnosis delay ہو سکتی ہے۔", "Temperature reading monitor کریں۔"],
      dengue: ["ممکنہ ڈینگی / ملیریا بخار", "تیز بخار، شدید جسم درد، rash، eye pain، mosquito exposure یا platelets concern dengue/malaria testing چاہتا ہے۔", "جنرل فزیشن / Internal Medicine", "Fluids لیں، dehydration سے بچیں، high/persistent fever میں CBC/platelet test کروائیں۔", "Doctor کے بغیر aspirin/ibuprofen نہ لیں۔", "Bleeding، شدید پیٹ درد، مسلسل vomiting، drowsiness، cold hands/feet یا low platelets۔", "نظر انداز کرنے سے dehydration، bleeding risk، platelet drop یا severe infection ہو سکتا ہے۔", "CBC اور platelet count check کریں۔"],
      chest: ["سینے کا درد / دل کی warning", "سینے کا درد، دباؤ، پسینہ، بازو/جبڑے میں درد یا سانس کی مشکل serious ہو سکتی ہے۔", "Emergency Physician / Cardiologist", "Activity روکیں، سیدھا بیٹھیں، درد active یا severe ہو تو urgent medical care لیں۔", "خود drive نہ کریں اور random heart medicine نہ لیں۔", "سینے کا درد + پسینہ، left arm/jaw pain، breathlessness، fainting یا severe weakness۔", "Chest pain ignore کرنے سے heart attack/serious heart condition کا treatment delay ہو سکتا ہے۔", "BP اور oxygen check کریں؛ ECG needed ہو سکتا ہے۔"],
      breathing: ["سانس کا مسئلہ", "سانس پھولنا، wheezing یا oxygen issue lungs/asthma/infection سے related ہو سکتا ہے۔", "Pulmonologist / Emergency Physician", "سیدھا بیٹھیں، smoke/dust سے بچیں، prescribed inhaler ہو تو ہی استعمال کریں، breathing difficult ہو تو urgent care لیں۔", "Doctor advice کے بغیر antibiotic/steroid نہ لیں۔", "Blue lips، severe breathlessness، chest pain، confusion، low oxygen یا مکمل sentence نہ بول پانا۔", "Breathing issue ignore کرنے سے oxygen drop اور serious complications ہو سکتے ہیں۔", "Oxygen saturation check کریں۔"],
      stomach: ["پیٹ کا infection / acidity / gastroenteritis", "Vomiting، diarrhea، nausea یا stomach pain infection/food poisoning/acidity/dehydration ہو سکتا ہے۔", "General Physician / Gastroenterologist", "ORS/clean fluids کے چھوٹے گھونٹ لیں، light food لیں، pain/vomiting/diarrhea continue ہو تو doctor سے ملیں۔", "Random antibiotics یا strong painkillers نہ لیں۔", "Stool/vomit میں blood، severe abdominal pain، persistent vomiting، fainting یا dehydration۔", "نظر انداز کرنے سے dehydration یا abdominal emergency miss ہو سکتی ہے۔", "Hydration status check کریں۔"],
      headache: ["سر درد / Migraine / BP-related headache", "Headache migraine، stress، dehydration، BP issue یا infection سے ہو سکتا ہے۔", "General Physician / Neurologist", "Quiet place میں rest کریں، fluids لیں، possible ہو تو BP check کریں، severe/repeated ہو تو doctor سے ملیں۔", "Painkillers زیادہ استعمال نہ کریں۔", "Sudden worst headache، neck stiffness، weakness، confusion، fainting، seizure یا vision loss۔", "Severe headache ignore کرنے سے stroke/infection/BP care delay ہو سکتی ہے۔", "BP اور sugar check ہو سکتی ہے۔"],
      skin: ["Skin / scalp allergy یا irritation", "Itching، rash، dandruff یا hair/skin product کے بعد irritation allergy/dermatitis ہو سکتی ہے۔", "Dermatologist", "مشکوک product بند کریں، mild shampoo/water سے wash کریں، scratching avoid کریں، continue ہو تو dermatologist سے ملیں۔", "Strong creams، acids، lemon، garlic یا harsh home remedies نہ لگائیں۔", "Face/lip swelling، breathing difficulty، widespread rash، pus، fever یا severe burning۔", "Allergy ignore کرنے سے rash، infection یا swelling worsen ہو سکتی ہے۔", "Blood level کی ضرورت نہیں؛ skin/scalp exam ہو سکتا ہے۔"],
      urine: ["Urinary infection / UTI", "پیشاب میں جلن، بار بار پیشاب، lower abdominal pain یا fever UTI suggest کر سکتا ہے۔", "General Physician / Urologist", "پانی پئیں اگر doctor نے منع نہیں کیا، urine test کروائیں، proper treatment کے لیے doctor سے ملیں۔", "Urine test/doctor advice کے بغیر antibiotic نہ لیں۔", "Fever with back pain، urine میں blood، pregnancy with urinary symptoms، severe pain یا urine pass نہ ہونا۔", "UTI ignore کرنے سے infection kidneys تک جا سکتا ہے۔", "Urine complete test اور culture needed ہو سکتا ہے۔"],
      sugar: ["High / low blood sugar concern", "Sugar symptoms یا abnormal readings کو measured interpretation چاہیے۔", "Endocrinologist / General Physician", "Sugar reading check کریں، high ہو تو پانی لیں، sugary drinks avoid کریں، repeatedly high/low ہو تو doctor سے ملیں۔", "Doctor advice کے بغیر insulin/diabetes medicine dose change نہ کریں۔", "Confusion، unconsciousness، high sugar کے ساتھ vomiting، severe weakness یا very low sugar symptoms۔", "Abnormal sugar ignore کرنے سے dehydration، weakness، fainting، kidney/eye/nerve issues ہو سکتے ہیں۔", "Fasting 100-125 mg/dL prediabetes range؛ fasting 126+ یا random 200+ with symptoms doctor confirmation چاہتا ہے۔"],
      bp: ["Blood pressure concern", "High/low BP، palpitations، dizziness یا headache BP review چاہتا ہے۔", "General Physician / Cardiologist", "5 منٹ rest کے بعد BP دوبارہ check کریں، systolic/diastolic اور pulse لکھیں، repeated abnormal ہو تو doctor سے ملیں۔", "Doctor advice کے بغیر BP medicine start/stop نہ کریں۔", "BP 180/120 سے اوپر + chest pain، breathlessness، weakness، vision change یا speaking difficulty۔", "High BP ignore کرنے سے stroke، heart attack، kidney/eye damage کا risk بڑھ سکتا ہے۔", "Normal BP 120/80 سے کم؛ 180/120 یا اوپر symptoms کے ساتھ emergency ہے۔"],
      women: ["Women health concern", "Periods، pregnancy، pelvic pain، discharge یا abnormal bleeding gynecology review چاہتا ہے۔", "Gynecologist", "Cycle dates، bleeding، pain location اور pregnancy possibility track کریں؛ gynecologist سے ملیں۔", "Doctor advice کے بغیر hormonal/pregnancy medicines نہ لیں۔", "Heavy bleeding، pregnancy with severe pain/bleeding، fainting، fever یا severe pelvic pain۔", "نظر انداز کرنے سے pregnancy complication، infection یا anemia کا treatment delay ہو سکتا ہے۔", "Pregnancy test/CBC/ultrasound needed ہو سکتا ہے۔"],
      child: ["Child health concern", "Children/infants میں symptoms adults سے جلد worsen ہو سکتے ہیں۔", "Pediatrician", "Fever، feeding، urine، activity اور breathing monitor کریں؛ continue ہو تو pediatrician سے ملیں۔", "Adult medicines یا adult doses نہ دیں۔", "Infant fever، breathing difficulty، dehydration، persistent vomiting، seizure، blue lips یا drowsiness۔", "Child symptoms ignore کرنے سے dehydration یا rapid worsening ہو سکتی ہے۔", "Temperature اور hydration check کریں۔"],
      mental: ["Anxiety / stress / mental health concern", "Stress، panic، sleep problems یا low mood mental-health support چاہتا ہے۔", "Psychologist / Psychiatrist", "Trusted person سے بات کریں، panic میں slow breathing کریں، daily life affect ہو تو professional support لیں۔", "Psychiatrist کے بغیر sleeping pills/psychiatric medicine نہ لیں۔", "Self-harm thoughts، suicidal plan، hallucinations، severe panic یا unsafe feel کرنا۔", "Mental health ignore کرنے سے sleep، mood، panic اور daily functioning worsen ہو سکتی ہے۔", "Blood level نہیں؛ mental health screening ہو سکتی ہے۔"]
    },
    hi: {
      general: ["अस्पष्ट लक्षण", "लक्षण एक स्पष्ट समस्या पहचानने के लिए specific नहीं हैं।", "General Physician", "Symptoms को duration और severity के साथ साफ लिखें।", "Unclear symptoms में self-medication न करें।", "Severe pain, breathing difficulty, chest pain, fainting, bleeding या confusion.", "Ignore करने से सही care delay हो सकती है।", "Specific reading नहीं दी गई।"],
      fever: ["Fever / Flu / Viral infection", "Fever with cough, body pain, sore throat या runny nose viral/flu हो सकता है।", "General Physician", "Rest करें, fluids लें, temperature monitor करें, fever 2-3 days रहे या worse हो तो doctor से मिलें।", "Unnecessary antibiotics या fever medicines mix न करें।", "Breathing issue, chest pain, confusion, dehydration, very high fever या infant fever.", "Ignore करने से dehydration या dengue/malaria/infection diagnosis delay हो सकती है।", "Temperature reading monitor करें।"],
      dengue: ["Possible Dengue / Malaria fever", "High fever with body pain, rash, eye pain, mosquito exposure या platelets concern dengue/malaria testing चाहता है।", "General Physician / Internal Medicine", "Fluids लें, dehydration avoid करें, high/persistent fever में CBC/platelet test करवाएं।", "Doctor advice के बिना aspirin/ibuprofen avoid करें।", "Bleeding, severe abdominal pain, persistent vomiting, drowsiness, cold hands/feet, low platelets.", "Ignore करने से dehydration, bleeding risk, platelet drop या severe infection हो सकता है।", "CBC और platelet count check करें।"],
      chest: ["Chest pain / possible heart warning", "Chest pain, pressure, sweating, arm/jaw pain या breathlessness serious हो सकता है।", "Emergency Physician / Cardiologist", "Activity रोकें, upright बैठें, active/severe pain में urgent medical care लें।", "खुद drive न करें और random heart medicines न लें।", "Chest pain with sweating, arm/jaw pain, breathlessness, fainting या weakness.", "Chest pain ignore करने से heart attack/serious condition का treatment delay हो सकता है।", "BP और oxygen check करें; ECG needed हो सकता है।"],
      breathing: ["Breathing problem", "Shortness of breath, wheezing या oxygen issue lungs/asthma/infection से related हो सकता है।", "Pulmonologist / Emergency Physician", "Upright बैठें, smoke/dust avoid करें, prescribed inhaler हो तो use करें, breathing difficult हो तो urgent care लें।", "Doctor advice के बिना antibiotics/steroids न लें।", "Blue lips, severe breathlessness, chest pain, confusion, low oxygen, unable to speak.", "Ignore करने से oxygen drop और serious complications हो सकते हैं।", "Oxygen saturation check करें।"],
      stomach: ["Stomach infection / acidity / gastroenteritis", "Vomiting, diarrhea, nausea या stomach pain infection/food poisoning/acidity हो सकता है।", "General Physician / Gastroenterologist", "ORS/clean fluids लें, light food लें, pain/vomiting/diarrhea continue हो तो doctor से मिलें।", "Random antibiotics या strong painkillers न लें।", "Blood in stool/vomit, severe abdominal pain, persistent vomiting, fainting, dehydration.", "Ignore करने से dehydration या abdominal emergency miss हो सकती है।", "Hydration status check करें।"],
      headache: ["Headache / Migraine / BP-related headache", "Headache migraine, stress, dehydration, BP issue या infection से हो सकता है।", "General Physician / Neurologist", "Quiet place में rest करें, fluids लें, BP check करें, severe/repeated हो तो doctor से मिलें।", "Painkillers overuse न करें।", "Sudden worst headache, neck stiffness, weakness, confusion, fainting, seizure, vision loss.", "Severe headache ignore करने से stroke/infection/BP care delay हो सकती है।", "BP और sugar check हो सकती है।"],
      skin: ["Skin / scalp allergy or irritation", "Itching, rash, dandruff या product के बाद irritation allergy/dermatitis हो सकती है।", "Dermatologist", "Suspected product बंद करें, mild shampoo/water से wash करें, scratching avoid करें, continue हो तो dermatologist से मिलें।", "Strong creams, acids, lemon, garlic या harsh remedies न लगाएं।", "Face/lip swelling, breathing difficulty, widespread rash, pus, fever, severe burning.", "Allergy ignore करने से rash/infection/swelling worsen हो सकती है।", "Blood level नहीं; skin/scalp exam needed हो सकता है।"],
      urine: ["Urinary infection / UTI", "Burning urine, frequent urination, lower abdominal pain या fever UTI suggest कर सकता है।", "General Physician / Urologist", "Water लें अगर allowed हो, urine test करवाएं, doctor से treatment लें।", "Urine test/doctor advice के बिना antibiotics न लें।", "Fever with back pain, blood in urine, pregnancy symptoms, severe pain, unable to pass urine.", "Ignoring UTI can spread to kidneys and cause serious infection.", "Urine complete test/culture needed हो सकता है।"],
      sugar: ["High / low blood sugar concern", "Sugar symptoms या abnormal readings measured interpretation चाहते हैं।", "Endocrinologist / General Physician", "Sugar reading check करें, high हो तो water लें, sugary drinks avoid करें, repeatedly high/low हो तो doctor से मिलें।", "Doctor advice के बिना insulin/diabetes dose change न करें।", "Confusion, unconsciousness, vomiting with high sugar, severe weakness, low sugar symptoms.", "Ignoring abnormal sugar can cause dehydration, weakness, fainting, kidney/eye/nerve complications.", "Fasting 100-125 mg/dL prediabetes range; fasting 126+ or random 200+ with symptoms needs doctor confirmation."],
      bp: ["Blood pressure concern", "High/low BP, palpitations, dizziness या headache BP review चाहता है।", "General Physician / Cardiologist", "5 min rest के बाद BP recheck करें, systolic/diastolic और pulse लिखें, abnormal repeated हो तो doctor से मिलें।", "Doctor advice के बिना BP medicine start/stop न करें।", "BP over 180/120 with chest pain, breathlessness, weakness, vision change or speaking difficulty.", "Ignoring high BP can increase stroke, heart attack, kidney/eye damage risk.", "Normal BP below 120/80; 180/120 or higher with symptoms is emergency."],
      women: ["Women health concern", "Periods, pregnancy, pelvic pain, discharge या abnormal bleeding gynecology review चाहता है।", "Gynecologist", "Cycle dates, bleeding, pain location, pregnancy possibility track करें; gynecologist से मिलें।", "Doctor advice के बिना hormonal/pregnancy medicine न लें।", "Heavy bleeding, pregnancy with severe pain/bleeding, fainting, fever, severe pelvic pain.", "Ignoring may delay pregnancy complication, infection or anemia treatment.", "Pregnancy test/CBC/ultrasound needed हो सकता है।"],
      child: ["Child health concern", "Children/infants में symptoms faster worsen हो सकते हैं।", "Pediatrician", "Fever, feeding, urine, activity, breathing monitor करें; continue हो तो pediatrician से मिलें।", "Adult medicines/doses न दें।", "Infant fever, breathing difficulty, dehydration, vomiting, seizure, blue lips, drowsiness.", "Ignoring child symptoms can lead to dehydration or rapid worsening.", "Temperature और hydration check करें।"],
      mental: ["Anxiety / stress / mental health concern", "Stress, panic, sleep problem या low mood mental-health support चाहता है।", "Psychologist / Psychiatrist", "Trusted person से बात करें, panic में slow breathing करें, daily life affect हो तो support लें।", "Psychiatrist के बिना sleeping pills/psychiatric medicines न लें।", "Self-harm thoughts, suicidal plan, hallucinations, severe panic, unsafe feeling.", "Ignoring mental health symptoms can worsen sleep, mood, panic and functioning.", "No blood level; mental health screening may be needed."]
    }
  };

  const COPY_FALLBACK = {
    ar:"en", es:"en", fr:"en", de:"en", pt:"en", ru:"en", tr:"en", zh:"en", ja:"en", ko:"en", it:"en", bn:"hi", id:"en", ms:"en", vi:"en", sw:"en"
  };

  function rawLang(){
    return document.getElementById("checker-lang")?.value || document.getElementById("global-lang-selector")?.value || "en";
  }
  function langKey(){
    const raw = rawLang();
    const key = LANG[raw] ? raw : (ALIAS[raw] || raw);
    return LANG[key] ? key : "en";
  }
  function copyKey(){
    const lk = langKey();
    return TEXT[lk] ? lk : (COPY_FALLBACK[lk] || "en");
  }
  function pack(){ return LANG[langKey()] || LANG.en; }
  function labels(){ return pack().labels; }
  function esc(x){ return String(x ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function clean(x){ return String(x||"").toLowerCase().replace(/[^\p{L}\p{N}\s/.%-]/gu, " ").replace(/\s+/g, " ").trim(); }
  function value(id,fallback=""){ const el=document.getElementById(id); return el ? (el.value || fallback) : fallback; }
  function has(s, arr){ return arr.some(w => s.includes(w)); }

  function parseReadings(symptoms){
    const s = clean(symptoms);
    const bp = s.match(/\b(?:bp|blood pressure)\s*(\d{2,3})\s*\/\s*(\d{2,3})\b/) || s.match(/\b(\d{2,3})\s*\/\s*(\d{2,3})\b/);
    const sugar = s.match(/\b(?:sugar|glucose|blood sugar)\s*(?:is|level|reading)?\s*(\d{2,3})\b/);
    const temp = s.match(/\b(?:fever|temperature|temp)\s*(?:is|level)?\s*(\d{2,3}(?:\.\d)?)\b/);
    return {
      bp: bp ? {sys:Number(bp[1]), dia:Number(bp[2])} : null,
      sugar: sugar ? Number(sugar[1]) : null,
      temp: temp ? Number(temp[1]) : null
    };
  }

  function detect(symptoms, mode){
    const s = clean(symptoms + " " + mode);
    if(!s || /^(hi|hello|test|abc|asdf|ok|okay|yes|no|hmm)$/i.test(s)) return "general";
    if(has(s,["chest pain","chest tightness","heart pain","left arm","jaw pain","sweating","سینے","دل"])) return "chest";
    if(has(s,["breath","breathing","shortness","wheezing","asthma","oxygen","spo2","saans","sans","سانس"])) return "breathing";
    if(has(s,["dengue","malaria","platelet","rash","eye pain","severe body pain","joint pain","mosquito","ڈینگی","ملیریا","پلیٹلیٹس"])) return "dengue";
    if(has(s,["sugar","diabetes","glucose","hba1c","insulin","thirst","frequent urine","شوگر","ذیابیطس"])) return "sugar";
    if(has(s,["bp","blood pressure","hypertension","high pressure","low pressure","palpitation","dharkan","بلڈ پریشر","دھڑکن"])) return "bp";
    if(has(s,["urine","burning urination","uti","peshab","پیشاب","جلن"])) return "urine";
    if(has(s,["stomach","abdomen","vomit","vomiting","diarrhea","loose motion","nausea","acidity","gastric","pait","ulti","dast","پیٹ","الٹی","دست"])) return "stomach";
    if(has(s,["headache","migraine","head pain","dizziness","sar dard","chakkar","سر درد","چکر"])) return "headache";
    if(has(s,["itching","rash","skin","scalp","dandruff","hair spray","hair oil","allergy","kharish","khujli","خارش","بال"])) return "skin";
    if(has(s,["period","pregnancy","pregnant","pcos","vaginal","pelvic","bleeding","women","حمل","ماہواری"])) return "women";
    if(has(s,["child","baby","infant","kid","pediatric","bacha","بچہ"])) return "child";
    if(has(s,["anxiety","stress","depression","panic","sleep","insomnia","suicidal","self harm","tension","ڈپریشن","خودکشی"])) return "mental";
    if(has(s,["fever","temperature","cough","flu","cold","sore throat","body pain","runny nose","bukhar","khansi","بخار","کھانسی"])) return "fever";
    return "general";
  }

  function riskFor(type, symptoms, severity, readings){
    const s = clean(symptoms);
    const sev = Number(severity || 5);
    let risk = "Low";
    if(["chest","breathing"].includes(type)) risk = "High";
    if(["dengue","sugar","bp","urine","stomach","headache","women","child"].includes(type)) risk = "Moderate";
    if(sev >= 8) risk = "High";
    else if(sev >= 6 && risk === "Low") risk = "Moderate";
    if(has(s,["faint","unconscious","confusion","blood","bleeding","severe","worst","blue lips","vision loss","self harm","suicidal","بے ہوش","خون","شدید"])) risk = "High";
    if(readings.bp && (readings.bp.sys >= 180 || readings.bp.dia >= 120)) risk = "High";
    if(readings.sugar && readings.sugar >= 300) risk = "High";
    return risk;
  }

  function readingText(type, readings, base){
    const Lb = labels();
    if(readings.bp){
      let cat = readings.bp.sys < 120 && readings.bp.dia < 80 ? "Normal range" :
                readings.bp.sys >= 180 || readings.bp.dia >= 120 ? "Severe / emergency range if symptoms are present" :
                readings.bp.sys >= 140 || readings.bp.dia >= 90 ? "High BP Stage 2 range" :
                readings.bp.sys >= 130 || readings.bp.dia >= 80 ? "High BP Stage 1 range" : "Elevated range";
      return `BP ${readings.bp.sys}/${readings.bp.dia} mmHg — ${cat}`;
    }
    if(readings.sugar){
      let cat = readings.sugar < 70 ? "Low sugar range" :
                readings.sugar >= 300 ? "Very high sugar range" :
                readings.sugar >= 200 ? "High sugar range; doctor confirmation needed" :
                readings.sugar >= 126 ? "High if fasting; doctor confirmation needed" :
                readings.sugar >= 100 ? "Borderline if fasting" : "Usually normal fasting range";
      return `Sugar ${readings.sugar} mg/dL — ${cat}`;
    }
    if(readings.temp) return `Temperature ${readings.temp}°F — monitor fever trend`;
    return base[7] || Lb.notProvided;
  }

  function makeResult(symptoms, severity, age, duration, mode){
    const key = detect(symptoms, mode);
    const readings = parseReadings(symptoms);
    const ck = copyKey();
    const rows = (TEXT[ck] && TEXT[ck][key]) || TEXT.en[key] || TEXT.en.general;
    const risk = riskFor(key, symptoms, severity, readings);
    return {key, rows, risk, readings, age, duration, mode, symptoms};
  }

  function render(result, patientName, severity){
    const P = pack(), Lb = P.labels;
    const riskText = result.risk === "High" ? Lb.high : result.risk === "Moderate" ? Lb.moderate : Lb.low;
    const color = result.risk === "High" ? "#ff4444" : result.risk === "Moderate" ? "#ffcc00" : "var(--accent-green)";
    const reading = readingText(result.key, result.readings, result.rows);

    const html = `
      <div class="simple-symptom-result" dir="${esc(P.dir)}">
        <div class="simple-result-header">
          <h3>${esc(Lb.possible)}: ${esc(result.rows[0])}</h3>
          <span style="background:${color};">${esc(Lb.risk)}: ${esc(riskText)}</span>
        </div>
        <div class="simple-result-grid">
          <div><b>${esc(Lb.level)}</b><p>${esc(reading)}</p></div>
          <div><b>${esc(Lb.doctor)}</b><p>${esc(result.rows[2])}</p></div>
        </div>
        <div class="simple-result-block"><b>${esc(Lb.ignored)}</b><p>${esc(result.rows[6])}</p></div>
        <div class="simple-result-block"><b>${esc(Lb.do)}</b><p>${esc(result.rows[3])}</p></div>
        <div class="simple-result-block"><b>${esc(Lb.dont)}</b><p>${esc(result.rows[4])}</p></div>
        <div class="simple-result-block emergency"><b>${esc(Lb.emergency)}</b><p>${esc(result.rows[5])}</p></div>
        <div class="simple-result-note"><b>${esc(Lb.note)}:</b> ${esc(Lb.disclaimer)}</div>
      </div>`;
    const d = document.getElementById("dashboard");
    if(d) d.innerHTML = html;
  }

  function speakResult(result){
    const P = pack(), Lb = P.labels;
    const riskText = result.risk === "High" ? Lb.high : result.risk === "Moderate" ? Lb.moderate : Lb.low;
    const text = [
      `${Lb.possible}: ${result.rows[0]}.`,
      `${Lb.risk}: ${riskText}.`,
      `${Lb.level}: ${readingText(result.key,result.readings,result.rows)}.`,
      `${Lb.doctor}: ${result.rows[2]}.`,
      `${Lb.do}: ${result.rows[3]}.`,
      `${Lb.dont}: ${result.rows[4]}.`,
      `${Lb.emergency}: ${result.rows[5]}.`,
      `${Lb.note}: ${Lb.disclaimer}`
    ].join(" ");
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = P.speech;
    utter.rate = 0.9;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const base = String(P.speech).split("-")[0].toLowerCase();
    const voice = voices.find(v => String(v.lang).toLowerCase() === String(P.speech).toLowerCase()) ||
                  voices.find(v => String(v.lang).toLowerCase().startsWith(base));
    if(voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
  }

  function addStyle(){
    if(document.getElementById("simple-symptom-format-style")) return;
    const style = document.createElement("style");
    style.id = "simple-symptom-format-style";
    style.textContent = `
      .simple-symptom-result{padding:4px;color:var(--white);}
      .simple-result-header{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
      .simple-result-header h3{margin:0;line-height:1.45;font-size:1.25rem;}
      .simple-result-header span{border-radius:999px;color:#061018;font-weight:900;padding:8px 12px;white-space:nowrap;}
      .simple-result-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:12px;}
      .simple-result-grid>div,.simple-result-block,.simple-result-note{border:1px solid var(--glass-border);background:rgba(255,255,255,.055);border-radius:16px;padding:14px;margin-bottom:12px;}
      .simple-symptom-result b{display:block;margin-bottom:6px;color:var(--accent-cyan);}
      .simple-symptom-result p{margin:0;color:var(--light-gray);line-height:1.65;}
      .simple-result-block.emergency{border-color:rgba(255,68,68,.5);background:rgba(255,68,68,.09);}
      .simple-result-note{color:#ffb1b1;line-height:1.55;font-size:.92rem;}
      @media(max-width:680px){.simple-result-grid{grid-template-columns:1fr}.simple-result-header{flex-direction:column}.simple-result-header span{white-space:normal}}
    `;
    document.head.appendChild(style);
  }

  function install(){
    addStyle();
    const form = document.getElementById("symptom-form");
    if(!form || form.__simpleSymptomFormatInstalled) return;
    form.__simpleSymptomFormatInstalled = true;
    if(window.jQuery) window.jQuery(form).off("submit");
    form.addEventListener("submit", function(e){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const Lb = labels();
      try {
        const res = makeResult(value("symptoms"), value("severity","5"), value("age"), value("symptom-duration"), value("patient-mode"));
        render(res, value("name","Patient"), value("severity","5"));
        window.__simpleSymptomLastResult = res;

        // Fast mode: answer shows instantly; voice starts after render in the background.
        const startVoice = () => speakResult(res);
        if ("requestIdleCallback" in window) {
          requestIdleCallback(startVoice, { timeout: 700 });
        } else {
          setTimeout(startVoice, 180);
        }
      } catch (err) {
        console.error("Symptom checker error:", err);
        const d = document.getElementById("dashboard");
        const Lb2 = labels();
        if (d) {
          d.innerHTML = `<div class="simple-symptom-result">
            <div class="simple-result-header"><h3>${esc(Lb2.possible)}: ${esc("General health concern")}</h3><span>${esc(Lb2.risk)}: ${esc(Lb2.moderate)}</span></div>
            <div class="simple-result-block"><b>${esc(Lb2.doctor)}</b><p>General Physician</p></div>
            <div class="simple-result-block"><b>${esc(Lb2.do)}</b><p>Write clear symptoms, duration, severity and consult a doctor if symptoms continue or worsen.</p></div>
            <div class="simple-result-block emergency"><b>${esc(Lb2.emergency)}</b><p>Chest pain, breathing difficulty, fainting, severe pain, bleeding or confusion.</p></div>
            <div class="simple-result-note"><b>${esc(Lb2.note)}:</b> ${esc(Lb2.disclaimer)}</div>
          </div>`;
        }
      }
    }, true);
  }

  window.SimpleSymptomFormat = {install, makeResult, render, speakResult};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", install); else install();
})();
