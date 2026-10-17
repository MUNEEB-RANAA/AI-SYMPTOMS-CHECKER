const fallbackProfiles = {
  general: {
    condition: 'General Symptom Review', specialist: 'General Physician', risk: 'Low', confidence: 76,
    recommendations: ['Rest properly and drink enough water.', 'Track temperature, pain level, and symptom duration.', 'Book a doctor consultation if symptoms continue or become worse.'],
    redFlags: ['Chest pain, severe breathing difficulty, fainting, severe dehydration, confusion, or uncontrolled bleeding need urgent medical help.'],
    medicines: ['No medicine should be started without doctor or pharmacist confirmation.'],
    tests: ['Basic checkup may be enough unless symptoms continue.']
  }
};

function localFallback(payload) {
  const msg = String(payload.symptoms || payload.message || '').toLowerCase();
  const sev = Number(payload.severity || 5);
  let p = { ...fallbackProfiles.general };
  if (msg.includes('chest') || msg.includes('heart') || msg.includes('palpitation')) p = { condition: 'Possible Heart or Blood Pressure Concern', specialist: 'Cardiologist', risk: 'High', confidence: 88, recommendations: ['Avoid heavy activity.', 'Sit upright and stay calm.', 'Book urgent cardiology consultation or visit emergency care if pain is severe.'], redFlags: ['Chest pressure, sweating, left arm pain, jaw pain, severe shortness of breath, or fainting need emergency care.'], medicines: ['Do not self-medicate for chest pain. A doctor must review first.'], tests: ['ECG', 'Blood Pressure Check'] };
  else if (msg.includes('fever') || msg.includes('cough') || msg.includes('flu') || msg.includes('cold')) p = { condition: 'Possible Viral Fever, Flu, or Throat Infection', specialist: 'General Physician', risk: sev >= 7 ? 'Moderate' : 'Low', confidence: 84, recommendations: ['Drink fluids.', 'Rest and monitor fever.', 'Use mask if cough or flu symptoms are present.', 'Consult a doctor if fever lasts more than 3 days.'], redFlags: ['Very high fever, breathing problem, stiff neck, confusion, rash, or severe weakness need urgent care.'], medicines: ['Fever medicine may be used only as advised by a doctor/pharmacist.'], tests: ['CBC if fever continues', 'COVID/Flu test if exposure or severe symptoms exist'] };
  else if (msg.includes('headache') || msg.includes('migraine') || msg.includes('dizziness')) p = { condition: 'Possible Migraine, Tension Headache, or Neurological Concern', specialist: 'Neurologist', risk: sev >= 8 ? 'High' : 'Moderate', confidence: 82, recommendations: ['Rest in a quiet room.', 'Drink water.', 'Avoid bright screens.', 'Note triggers such as stress, sleep loss, or certain foods.'], redFlags: ['Sudden worst headache, weakness on one side, confusion, seizures, or head injury need emergency care.'], medicines: ['Pain medicine should be used only as advised.'], tests: ['Blood pressure check', 'Eye checkup if blurred vision exists'] };
  else if (msg.includes('stomach') || msg.includes('diarrhea') || msg.includes('vomit') || msg.includes('nausea')) p = { condition: 'Possible Stomach Infection or Gastric Upset', specialist: 'Gastroenterologist', risk: sev >= 7 ? 'Moderate' : 'Low', confidence: 83, recommendations: ['Drink ORS or clean fluids.', 'Eat light food.', 'Avoid spicy or oily food.', 'Monitor urine output and weakness.'], redFlags: ['Blood in stool, severe abdominal pain, repeated vomiting, dry mouth, very low urine, or extreme weakness need urgent care.'], medicines: ['ORS / hydration support may help.'], tests: ['CBC if fever exists', 'Stool test if diarrhea continues'] };
  if (payload.mode === 'symptoms') return { mode: 'symptoms', source: 'netlify-local-fallback', analysis: p, note: 'AI guidance only. Not a final diagnosis.' };
  return { mode: 'doctor-chat', source: 'netlify-local-fallback', answer: `Based on your message, this may relate to ${p.condition}. Recommended specialist: ${p.specialist}. Risk level: ${p.risk}. ${p.recommendations.join(' ')} Important: ${p.redFlags[0]} Please consult a doctor for a confirmed diagnosis and prescription.`, analysis: p };
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(localFallback(payload)) };

  const selectedLanguage = payload.language || 'English';
  const system = `You are a careful healthcare triage AI for an AI Symptoms Checker website. The user selected language is: ${selectedLanguage}. Return every user-facing field in that selected language. Give safe, simple, concise guidance. Do not claim a final diagnosis. Mention red flags and recommend a doctor when needed. For symptom mode, return JSON only with keys: analysis {condition, specialist, risk, confidence, urgency, recommendations[], redFlags[], medicines[], tests[]}, note, labels {confidence, possible, risk, patient, age, specialist, source, rec, med, tests, warning, disclaimer}. For doctor-chat mode, return JSON only with keys: answer, analysis, labels. Keep riskKey in English as Low, Moderate, or High if possible.`;
  const user = JSON.stringify(payload);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'gpt-4o-mini', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.2 })
    });
    if (!r.ok) throw new Error('AI API error');
    const data = await r.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: content || JSON.stringify(localFallback(payload)) };
  } catch (e) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(localFallback(payload)) };
  }
};
