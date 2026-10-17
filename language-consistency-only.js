
/* Language Consistency Only Fix
   Does not change Speech-to-Text.
   Forces analysis output + Text-to-Speech to use the currently selected language.
*/
(function () {
    const DATA = window.LANGUAGE_CONSISTENCY_DATA || {cases: [], packs: {}};
    const CASES = DATA.cases || [];
    const PACKS = DATA.packs || {};
    function esc(x){return String(x||'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
    function clean(x){return String(x||'').toLowerCase().replace(/[.,;:!?()[\]{}]/g,' ').replace(/\s+/g,' ').trim();}
    function score(s, words){return (words||[]).reduce((n,w)=>n+(s.includes(String(w).toLowerCase())?1:0),0);}
    function selectedLang(){return document.getElementById('checker-lang')?.value || document.getElementById('global-lang-selector')?.value || 'en';}
    function pack(lang){return PACKS[lang] || PACKS.en;}
    function sync(value){['checker-lang','global-lang-selector','chat-language'].forEach(id=>{const el=document.getElementById(id); if(el && Array.from(el.options||[]).some(o=>o.value===value)) el.value=value;});}
    function choose(symptoms){const s=clean(symptoms); let best=null,bestScore=0; CASES.forEach(c=>{const sc=score(s,c.words); if(sc>bestScore){best=c; bestScore=sc;}}); return best;}
    function riskOf(c, symptoms, severity){const s=clean(symptoms); const n=Number(severity||5); if(!c)return n>=6?'Moderate':'Low'; if(c.risk==='High'||n>=8||['severe','unbearable','blood','bleeding','faint','confusion','breathing','shortness of breath','chest pain','سانس','سینہ'].some(w=>s.includes(w)))return'High'; if(c.risk==='Moderate'||n>=6)return'Moderate'; return'Low';}
    function conditionText(p, type){const topic=(p.topics&&p.topics[type]) || (PACKS.en.topics&&PACKS.en.topics[type]) || PACKS.en.topics.general; return topic;}
    function build(symptoms, severity){
        const lang=selectedLang(); sync(lang); const p=pack(lang);
        const s=clean(symptoms); const unclear=!s || s.length<4 || /^(hi|hello|test|abc|asdf|ok|okay|hmm|yes|no)$/i.test(s);
        const c=unclear?null:choose(symptoms); const type=unclear?'unclear':(c?c.type:'general'); const riskKey=unclear?'Low':riskOf(c,symptoms,severity);
        const tests = unclear ? [p.unclear || PACKS.en.unclear] : [(p.tests && (c ? p.tests[c.tests] : p.tests.general)) || (PACKS.en.tests && (c ? PACKS.en.tests[c.tests] : PACKS.en.tests.general)) || 'Doctor-guided checks may be needed.'];
        const a={
            type,
            condition: conditionText(p,type),
            specialist: (p.specs && (c ? p.specs[c.spec] : p.specs.general)) || (PACKS.en.specs && (c ? PACKS.en.specs[c.spec] : PACKS.en.specs.general)) || 'General Physician',
            risk:(p.risk&&p.risk[riskKey])||riskKey,
            riskKey,
            confidence: unclear?45:Math.min(96,78+(c?7:0)+(riskKey==='High'?5:riskKey==='Moderate'?2:0)),
            urgency: unclear ? (Array.isArray(p.unclear)?p.unclear[0]:p.unclear) : p.base,
            recommendations: unclear ? (Array.isArray(p.unclear)?p.unclear:[p.unclear]) : [p.base, p.rec2],
            medicines: Array.isArray(p.medicine)?p.medicine:[p.medicine],
            tests,
            redFlags:[p.red],
            languageName:p.name,
            direction:p.dir||'ltr'
        };
        const data={mode:'symptoms',source:'language-consistency-engine',language:lang,speechLang:p.speech||'en-US',labels:p.labels,note:p.labels.disclaimer,direction:p.dir||'ltr',analysis:a};
        data.answer = speechText(data);
        return data;
    }
    function speechText(data){
        const p=pack(data.language||selectedLang()); const a=data.analysis||{};
        return [a.condition, `${p.labels.specialist}: ${a.specialist}.`, `${p.labels.risk}: ${a.risk}.`, `${p.labels.severity}: ${a.urgency}.`, `${p.labels.rec}: ${(a.recommendations||[]).join(' ')}`, `${p.labels.tests}: ${(a.tests||[]).join(' ')}`, `${p.labels.med}: ${(a.medicines||[]).join(' ')}`, `${p.labels.warning}: ${(a.redFlags||[])[0]||''}`, p.labels.disclaimer].filter(Boolean).join(' ');
    }
    function voiceFor(langCode){
        if(!window.speechSynthesis || !window.speechSynthesis.getVoices) return null;
        const voices=window.speechSynthesis.getVoices(); const lc=String(langCode||'').toLowerCase(); const base=lc.split('-')[0];
        // Do NOT deliberately switch to English/Urdu fallback. Use only exact/base selected language voice if available.
        return voices.find(v=>(v.lang||'').toLowerCase()===lc) || voices.find(v=>(v.lang||'').toLowerCase().startsWith(base)) || null;
    }
    function speak(text, langCode){
        if(!window.speechSynthesis || !text) return;
        window.speechSynthesis.cancel();
        const parts=String(text).match(/[^.!?۔؟]+[.!?۔؟]?/g)||[text]; const chunks=[]; let cur='';
        parts.forEach(s=>{s=s.trim(); if(!s)return; if((cur+' '+s).trim().length>650){if(cur)chunks.push(cur); cur=s;}else cur=(cur+' '+s).trim();});
        if(cur)chunks.push(cur);
        const voice=voiceFor(langCode); let i=0;
        function next(){ if(i>=chunks.length)return; const u=new SpeechSynthesisUtterance(chunks[i]); u.lang=langCode||'en-US'; u.rate=0.88; u.pitch=1; u.volume=1; if(voice)u.voice=voice; u.onend=()=>{i++;next();}; u.onerror=()=>{i++;next();}; window.speechSynthesis.speak(u); }
        next();
    }
    function render(data, patientName, age, severity){
        const a=data.analysis,p=data.labels,r=a.riskKey||'Low'; const color=r==='Low'?'var(--accent-green)':(r==='Moderate'?'#ffcc00':'#ff4444');
        const scoreVal=Math.max(18,Math.min(96,100-(Number(severity||5)*7)+(r==='High'?-10:r==='Moderate'?-3:4))); const off=283-(283*scoreVal/100);
        const html=`<div class="dash-result ai-agent-result language-consistency-result" dir="${esc(data.direction||'ltr')}"><div class="dash-top"><div class="dash-score"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" stroke="var(--glass-border)" stroke-width="8" fill="none"/><circle cx="50" cy="50" r="45" stroke="${scoreVal>70?'var(--accent-green)':color}" stroke-width="8" fill="none" stroke-dasharray="283" stroke-dashoffset="${off}" stroke-linecap="round"/></svg><div class="score-text">${scoreVal}</div></div><div class="dash-info"><span>${esc(p.confidence)}: ${esc(a.confidence)}%</span><h3>${esc(p.possible)}: ${esc(a.condition)}</h3><p style="color:${color};font-weight:700;">${esc(p.risk)}: ${esc(a.risk)}</p><p style="color:var(--light-gray);font-size:0.9rem;margin-top:8px;">${esc(a.urgency)}</p></div></div><div class="dash-grid"><div class="dash-item"><span>${esc(p.patient)}</span><b>${esc(patientName)}</b></div><div class="dash-item"><span>${esc(p.age)}</span><b>${esc(age)}</b></div><div class="dash-item"><span>${esc(p.specialist)}</span><b>${esc(a.specialist)}</b></div><div class="dash-item"><span>${esc(p.source)}</span><b>${esc(data.source)}</b></div></div><div class="dash-list"><h4>${esc(p.rec)}</h4><ul>${(a.recommendations||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="dash-list"><h4>${esc(p.med)}</h4><ul>${(a.medicines||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="dash-list"><h4>${esc(p.tests)}</h4><ul>${(a.tests||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="dash-list warning-list"><h4>${esc(p.warning)}</h4><ul>${(a.redFlags||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><p style="font-size:0.8rem;color:#ff8888;margin-top:15px;">⚠️ ${esc(data.note)}</p></div>`;
        const d=document.getElementById('dashboard'); if(d)d.innerHTML=html;
    }
    function install(){
        const form=document.getElementById('symptom-form'); if(!form || form.__languageConsistencyInstalled) return;
        form.__languageConsistencyInstalled=true;
        if(window.jQuery) window.jQuery(form).off('submit');
        form.addEventListener('submit', function(e){
            e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
            const name=document.getElementById('name')?.value||'Patient'; const age=document.getElementById('age')?.value||''; const sev=document.getElementById('severity')?.value||5; const symptoms=document.getElementById('symptoms')?.value||'';
            const d=document.getElementById('dashboard'); if(d)d.innerHTML='<div class="dash-welcome"><div class="pulse-icon">❤</div><h3>Analyzing in selected language...</h3><p style="color:var(--text-muted);margin-top:10px;">Analysis and voice will follow the selected language.</p></div>';
            setTimeout(()=>{const data=build(symptoms,sev); render(data,name,age,sev); speak(speechText(data),data.speechLang); window.__languageConsistencyLastResult=data;},100);
        }, true);
    }
    window.AISymptomsAgent=Object.assign({},window.AISymptomsAgent||{},{ask:async payload=>build(payload?.symptoms||'',payload?.severity||5),localFallback:payload=>build(payload?.symptoms||'',payload?.severity||5),languagePack:lang=>pack(lang||selectedLang()),buildSpeechText:speechText,__languageConsistencyOnly:true});
    window.LanguageConsistencyOnly={install,build,speak,speechText,pack};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install); else install();
})();
