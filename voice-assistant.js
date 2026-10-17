/* Enhanced Voice Assistant for AI Symptoms Checker
   Working flow:
   - User selects language
   - Clicks voice button
   - Spoken symptoms/question are written into the textbox
   - AI analyzes/sends message in the selected language
   - Final AI answer is read aloud in the selected language
*/
(function () {
    let lastAgentDataForVoice = null;
    let activeRecognition = null;
    let activeTimer = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const langData = {
        en:{speech:'en-US', recog:['en-US','en-GB','en-IN']},
        ur:{speech:'ur-PK', recog:['ur-PK','ur-IN','hi-IN','en-US']},
        pnb:{speech:'pa-IN', recog:['pa-IN','ur-PK','hi-IN','en-US']},
        pa:{speech:'pa-IN', recog:['pa-IN','ur-PK','hi-IN','en-US']},
        sd:{speech:'sd-IN', recog:['sd-IN','ur-PK','hi-IN','en-US']},
        ps:{speech:'ps-AF', recog:['ps-AF','ur-PK','hi-IN','en-US']},
        bal:{speech:'ur-PK', recog:['ur-PK','hi-IN','en-US']},
        skr:{speech:'ur-PK', recog:['ur-PK','hi-IN','en-US']},
        hno:{speech:'ur-PK', recog:['ur-PK','hi-IN','en-US']},
        ks:{speech:'ur-PK', recog:['ur-PK','ur-IN','hi-IN','en-US']},
        brh:{speech:'ur-PK', recog:['ur-PK','hi-IN','en-US']},
        ar:{speech:'ar-SA', recog:['ar-SA','ar-AE','ar-EG','en-US']},
        hi:{speech:'hi-IN', recog:['hi-IN','en-IN','en-US']},
        fa:{speech:'fa-IR', recog:['fa-IR','en-US']},
        tr:{speech:'tr-TR', recog:['tr-TR','en-US']},
        zh:{speech:'zh-CN', recog:['zh-CN','cmn-Hans-CN','zh-TW','en-US']},
        'zh-CN':{speech:'zh-CN', recog:['zh-CN','cmn-Hans-CN','en-US']},
        'zh-TW':{speech:'zh-TW', recog:['zh-TW','zh-CN','en-US']},
        es:{speech:'es-ES', recog:['es-ES','es-MX','en-US']},
        fr:{speech:'fr-FR', recog:['fr-FR','fr-CA','en-US']},
        de:{speech:'de-DE', recog:['de-DE','en-US']},
        pt:{speech:'pt-PT', recog:['pt-PT','pt-BR','en-US']},
        ru:{speech:'ru-RU', recog:['ru-RU','en-US']},
        ja:{speech:'ja-JP', recog:['ja-JP','en-US']},
        ko:{speech:'ko-KR', recog:['ko-KR','en-US']},
        it:{speech:'it-IT', recog:['it-IT','en-US']},
        bn:{speech:'bn-BD', recog:['bn-BD','bn-IN','hi-IN','en-US']},
        ta:{speech:'ta-IN', recog:['ta-IN','en-IN','en-US']},
        te:{speech:'te-IN', recog:['te-IN','en-IN','en-US']},
        mr:{speech:'mr-IN', recog:['mr-IN','hi-IN','en-US']},
        gu:{speech:'gu-IN', recog:['gu-IN','hi-IN','en-US']},
        ml:{speech:'ml-IN', recog:['ml-IN','en-IN','en-US']},
        th:{speech:'th-TH', recog:['th-TH','en-US']},
        id:{speech:'id-ID', recog:['id-ID','en-US']},
        ms:{speech:'ms-MY', recog:['ms-MY','id-ID','en-US']},
        vi:{speech:'vi-VN', recog:['vi-VN','en-US']},
        sw:{speech:'sw-KE', recog:['sw-KE','en-US']}
    };

    const aliases = {
        english:'en', urdu:'ur', punjabi:'pnb', panjabi:'pnb', sindhi:'sd', pashto:'ps', pushto:'ps',
        balochi:'bal', saraiki:'skr', siraiki:'skr', hindko:'hno', kashmiri:'ks', brahui:'brh',
        arabic:'ar', hindi:'hi', persian:'fa', farsi:'fa', turkish:'tr', chinese:'zh',
        spanish:'es', french:'fr', german:'de', portuguese:'pt', russian:'ru', japanese:'ja',
        korean:'ko', italian:'it', bengali:'bn', bangla:'bn', tamil:'ta', telugu:'te',
        marathi:'mr', gujarati:'gu', malayalam:'ml', thai:'th', indonesian:'id', malay:'ms',
        vietnamese:'vi', swahili:'sw'
    };

    function normalizeLang(lang) {
        const raw = String(lang || 'en').trim();
        if (!raw) return 'en';
        const lower = raw.toLowerCase();
        return aliases[lower] || raw;
    }

    function unique(list) {
        return Array.from(new Set((list || []).filter(Boolean)));
    }

    function getLangCode(lang) {
        const key = normalizeLang(lang);
        const data = langData[key] || langData[String(key).toLowerCase()];
        return data ? data.speech : (key || 'en-US');
    }

    function getRecognitionCodes(lang) {
        const key = normalizeLang(lang);
        const strict = {
            en:['en-US'],ur:['ur-PK'],pnb:['pa-IN'],sd:['sd-IN'],ps:['ps-AF'],
            bal:['bal-PK'],skr:['skr-PK'],hno:['hno-PK'],ks:['ks-IN'],brh:['brh-PK'],
            ar:['ar-SA'],hi:['hi-IN'],fa:['fa-IR'],tr:['tr-TR'],'zh-CN':['zh-CN'],'zh-TW':['zh-TW'],
            es:['es-ES'],fr:['fr-FR'],de:['de-DE'],pt:['pt-PT'],ru:['ru-RU'],ja:['ja-JP'],ko:['ko-KR'],
            it:['it-IT'],bn:['bn-BD'],ta:['ta-IN'],te:['te-IN'],mr:['mr-IN'],gu:['gu-IN'],ml:['ml-IN'],
            th:['th-TH'],id:['id-ID'],ms:['ms-MY'],vi:['vi-VN'],sw:['sw-KE']
        };
        return strict[key] || [getLangCode(key)];
    }

    function getSelectedLang(selectorId) {
        return document.getElementById(selectorId)?.value
            || document.getElementById('checker-lang')?.value
            || document.getElementById('chat-language')?.value
            || document.getElementById('global-lang-selector')?.value
            || 'en';
    }

    function clean(text) {
        return String(text || '').replace(/\s+/g, ' ').trim();
    }

    function stripForSpeech(text) {
        return clean(text)
            .replace(/<[^>]*>/g, ' ')
            .replace(/[\/\\|]+/g, '، ')
            .replace(/[•●▪■◆◇→←↔]+/g, '، ')
            .replace(/[()[\]{}<>*_#~`]+/g, ' ')
            .replace(/[:;]+/g, '، ')
            .replace(/[⚠️✓❤℞📌📋💊🧪🚨🎙️🔊⏹️]/g, ' ')
            .replace(/\s*،\s*/g, '، ')
            .replace(/\s+/g, ' ')
            .trim();
    }


    function nativeUI(lang) {
        try {
            return window.AISymptomLanguagePack ? window.AISymptomLanguagePack(normalizeLang(lang)) : null;
        } catch (e) { return null; }
    }
    function nativeStatus(lang, kind, transcript) {
        const p = nativeUI(lang);
        if (!p) return transcript || '';
        if (kind === 'listening') return p.symptoms || '';
        if (kind === 'detected') return transcript || p.symptoms || '';
        if (kind === 'success') return p.analysis || '';
        if (kind === 'error') return p.noteText || p.note || '';
        return p.analysis || '';
    }

    function setStatus(id, msg, type) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = msg || '';
        el.dataset.statusType = type || 'info';
    }

    function addStatusLine(target, id) {
        if (document.getElementById(id)) return document.getElementById(id);
        const small = document.createElement('small');
        small.id = id;
        small.className = 'voice-status-line';
        target.parentNode.appendChild(small);
        return small;
    }

    async function askMicPermission(statusId) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            setStatus(statusId, nativeStatus(getSelectedLang(langSelectorId), 'error'), 'error');
            return false;
        }
    }

    function ensureSymptomDefaults() {
        const name = document.getElementById('name');
        const age = document.getElementById('age');
        const severity = document.getElementById('severity');
        if (name && !name.value.trim()) name.value = 'Voice User';
        if (age && !age.value.trim()) age.value = '30';
        if (severity && !severity.value.trim()) severity.value = '5';
    }

    function submitSymptomsForm() {
        ensureSymptomDefaults();
        const form = document.getElementById('symptom-form');
        if (!form) return;
        if (window.jQuery) window.jQuery(form).trigger('submit');
        else form.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
    }

    function triggerChatSend() {
        const sendBtn = document.getElementById('doctor-chat-send');
        if (sendBtn) sendBtn.click();
    }

    function stopActiveRecognition() {
        if (activeTimer) {
            clearTimeout(activeTimer);
            activeTimer = null;
        }
        if (activeRecognition) {
            try { activeRecognition.stop(); } catch (e) {}
            try { activeRecognition.abort(); } catch (e) {}
            activeRecognition = null;
        }
    }

    async function startRecognition(targetId, langSelectorId, statusId, options) {
        const target = document.getElementById(targetId);
        const opts = options || {};
        if (!target) return;

        if (!SpeechRecognition) {
            setStatus(statusId, nativeStatus(getSelectedLang(langSelectorId), 'error'), 'error');
            return;
        }

        if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            setStatus(statusId, 'Voice needs HTTPS or localhost. Please run website on Netlify or localhost, not direct file open.', 'error');
            return;
        }

        const micAllowed = await askMicPermission(statusId);
        if (!micAllowed) return;

        stopActiveRecognition();

        const selectedLang = getSelectedLang(langSelectorId);
        const languageList = getRecognitionCodes(selectedLang);
        let attempt = 0;
        let finalTranscript = '';
        let interimTranscript = '';
        let didReceiveSpeech = false;

        function finishWithTranscript() {
            const transcript = clean(finalTranscript || interimTranscript);
            if (!transcript) {
                setStatus(statusId, nativeStatus(getSelectedLang(langSelectorId), 'error'), 'error');
                return;
            }

            target.value = transcript;
            target.dispatchEvent(new Event('input', { bubbles:true }));
            target.dispatchEvent(new Event('change', { bubbles:true }));

            if (opts.type === 'symptoms') {
                setStatus(statusId, nativeStatus(selectedLang, 'success'), 'success');
                setTimeout(submitSymptomsForm, 500);
            } else if (opts.type === 'chat') {
                setStatus(statusId, 'Voice question written. AI is sending and will read the answer...', 'success');
                setTimeout(triggerChatSend, 400);
            } else {
                setStatus(statusId, 'Voice written successfully.', 'success');
            }
        }

        function runRecognition() {
            let rec;
            try {
                rec = new SpeechRecognition();
            } catch (e) {
                setStatus(statusId, 'Voice input could not start. Please refresh page and try again.', 'error');
                return;
            }

            activeRecognition = rec;
            rec.lang = languageList[attempt] || 'en-US';
            rec.interimResults = true;
            rec.continuous = true;
            rec.maxAlternatives = 3;

            const friendlyLanguage = document.getElementById(langSelectorId)?.selectedOptions?.[0]?.textContent || selectedLang;
            setStatus(statusId, nativeStatus(selectedLang, 'listening') || friendlyLanguage, 'listening');

            rec.onstart = function () {
                if (activeTimer) clearTimeout(activeTimer);
                activeTimer = setTimeout(function () {
                    try { rec.stop(); } catch (e) {}
                }, opts.timeout || 12000);
            };

            rec.onresult = function (event) {
                didReceiveSpeech = true;
                interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const text = event.results[i][0] ? event.results[i][0].transcript : '';
                    if (event.results[i].isFinal) finalTranscript += ' ' + text;
                    else interimTranscript += ' ' + text;
                }
                const liveText = clean(finalTranscript || interimTranscript);
                if (liveText) {
                    target.value = liveText;
                    target.dispatchEvent(new Event('input', { bubbles:true }));
                    setStatus(statusId, nativeStatus(selectedLang, 'detected', liveText), 'listening');
                }

                if (activeTimer) clearTimeout(activeTimer);
                activeTimer = setTimeout(function () {
                    try { rec.stop(); } catch (e) {}
                }, 1800);
            };

            rec.onnomatch = function () {
                if (attempt < languageList.length - 1) {
                    attempt += 1;
                    setStatus(statusId, 'Trying another voice language mode...', 'info');
                    setTimeout(runRecognition, 350);
                } else {
                    setStatus(statusId, nativeStatus(getSelectedLang(langSelectorId), 'error'), 'error');
                }
            };

            rec.onerror = function (event) {
                const error = event.error || 'unknown';
                if (activeTimer) clearTimeout(activeTimer);

                if (error === 'not-allowed' || error === 'service-not-allowed') {
                    setStatus(statusId, 'Microphone permission is blocked. Allow microphone access and try again.', 'error');
                    return;
                }

                if ((error === 'language-not-supported' || error === 'network' || error === 'aborted' || error === 'audio-capture') && attempt < languageList.length - 1) {
                    attempt += 1;
                    setStatus(statusId, 'Selected language voice mode was not supported. Trying fallback mode...', 'info');
                    setTimeout(runRecognition, 400);
                    return;
                }

                if (error === 'no-speech') {
                    setStatus(statusId, nativeStatus(getSelectedLang(langSelectorId), 'error'), 'error');
                } else if (error === 'audio-capture') {
                    setStatus(statusId, 'No microphone found. Please connect/enable microphone.', 'error');
                } else if (error === 'network') {
                    setStatus(statusId, 'Voice service network error. Use Chrome/Edge with internet, then try again.', 'error');
                } else {
                    setStatus(statusId, 'Voice input error: ' + error + '. Please try again.', 'error');
                }
            };

            rec.onend = function () {
                if (activeTimer) {
                    clearTimeout(activeTimer);
                    activeTimer = null;
                }
                if (activeRecognition === rec) activeRecognition = null;

                if (didReceiveSpeech) {
                    finishWithTranscript();
                } else {
                    const el = document.getElementById(statusId);
                    if (el && /Listening now/i.test(el.textContent || '')) {
                        setStatus(statusId, nativeStatus(getSelectedLang(langSelectorId), 'error'), 'error');
                    }
                }
            };

            try {
                rec.start();
            } catch (e) {
                if (attempt < languageList.length - 1) {
                    attempt += 1;
                    setTimeout(runRecognition, 300);
                } else {
                    setStatus(statusId, nativeStatus(getSelectedLang(langSelectorId), 'error'), 'error');
                }
            }
        }

        runRecognition();
    }

    function getVoicesAsync() {
        return new Promise(resolve => {
            if (!('speechSynthesis' in window)) return resolve([]);
            let voices = window.speechSynthesis.getVoices();
            if (voices && voices.length) return resolve(voices);
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                resolve(window.speechSynthesis.getVoices() || []);
            };
            window.speechSynthesis.onvoiceschanged = finish;
            setTimeout(finish, 800);
        });
    }

    async function chooseVoice(langCode) {
        const voices = await getVoicesAsync();
        const lc = String(langCode || 'ur-PK').toLowerCase();
        const base = lc.split('-')[0];

        const exact = voices.find(v => (v.lang || '').toLowerCase() === lc);
        if (exact) return exact;

        const baseMatch = voices.find(v => (v.lang || '').toLowerCase().startsWith(base));
        if (baseMatch) return baseMatch;

        const fallbacks = {
            ur:['ur-PK','ur-IN','hi-IN'],
            pa:['pa-IN','ur-PK','hi-IN'],
            pnb:['pa-IN','ur-PK','hi-IN'],
            sd:['sd-IN','ur-PK','hi-IN'],
            ps:['ps-AF','fa-IR','ur-PK','hi-IN'],
            bal:['bal-PK','fa-IR','ur-PK','hi-IN'],
            skr:['skr-PK','ur-PK','pa-IN','hi-IN'],
            hno:['hno-PK','ur-PK','pa-IN','hi-IN'],
            ks:['ks-IN','ur-PK','hi-IN'],
            brh:['brh-PK','ur-PK','fa-IR','hi-IN']
        };

        const candidates = fallbacks[base] || [langCode];
        for (const candidate of candidates) {
            const wanted = String(candidate).toLowerCase();
            const match = voices.find(v => (v.lang || '').toLowerCase() === wanted)
                || voices.find(v => (v.lang || '').toLowerCase().startsWith(wanted.split('-')[0]));
            if (match) return match;
        }

        return voices.find(v => (v.lang || '').toLowerCase().startsWith('ur'))
            || voices.find(v => (v.lang || '').toLowerCase().startsWith('hi'))
            || voices[0]
            || null;
    }

    function splitSpeechText(text) {
        const safe = stripForSpeech(text);
        if (!safe) return [];
        const chunks = [];
        const sentences = safe.match(/[^.!?۔؟]+[.!?۔؟]?/g) || [safe];
        let current = '';
        sentences.forEach(function(sentence) {
            sentence = sentence.trim();
            if (!sentence) return;
            if ((current + ' ' + sentence).trim().length > 650) {
                if (current) chunks.push(current.trim());
                current = sentence;
            } else {
                current = (current + ' ' + sentence).trim();
            }
        });
        if (current) chunks.push(current.trim());
        return chunks;
    }

    async function speakText(text, lang) {
        if (!('speechSynthesis' in window)) return;
        const chunks = splitSpeechText(text);
        if (!chunks.length) return;

        window.speechSynthesis.cancel();

        const langCode = getLangCode(lang);
        const voice = await chooseVoice(langCode);
        let index = 0;

        function speakNext() {
            if (index >= chunks.length) return;
            const utter = new SpeechSynthesisUtterance(chunks[index]);
            utter.lang = (voice && voice.lang) || langCode;
            utter.rate = 0.84;
            utter.pitch = 1;
            utter.volume = 1;
            if (voice) utter.voice = voice;
            utter.onend = function () { index += 1; speakNext(); };
            utter.onerror = function () { index += 1; speakNext(); };
            window.speechSynthesis.speak(utter);
        }

        speakNext();
    }

    function speakDashboard(lang) {
        if (lastAgentDataForVoice && window.AISymptomsAgent && window.AISymptomsAgent.buildSpeechText) {
            speakText(window.AISymptomsAgent.buildSpeechText(lastAgentDataForVoice, lang), lang);
            return;
        }

        const dash = document.querySelector('#dashboard .dash-result');
        if (!dash) {
            setStatus('voice-symptoms-status', 'Please analyze symptoms first, then click Read Full AI Answer.', 'error');
            return;
        }

        const parts = [];
        dash.querySelectorAll('.dash-info h3, .dash-info p, .dash-item, .dash-list h4, .dash-list li, .emergency-alert, .risk-alert').forEach(el => {
            const t = clean(el.innerText);
            if (t) parts.push(t);
        });
        speakText(parts.join('. '), lang);
    }

    function speakSummaryFromAgent(agentData, lang) {
        lastAgentDataForVoice = agentData || null;
        if (window.AISymptomsAgent && window.AISymptomsAgent.buildSpeechText) {
            speakText(window.AISymptomsAgent.buildSpeechText(agentData, lang), lang);
            return;
        }

        const a = (agentData && agentData.analysis) || {};
        const lines = [
            a.condition,
            a.specialist ? 'Specialist: ' + a.specialist : '',
            a.risk ? 'Risk level: ' + a.risk : '',
            a.urgency,
            ...(a.recommendations || []),
            ...(a.medicines || []),
            ...(a.tests || []),
            ...(a.redFlags || [])
        ];
        speakText(lines.filter(Boolean).join('. '), lang);
    }

    function addSymptomVoiceControls() {
        const symptoms = document.getElementById('symptoms');
        if (!symptoms || document.getElementById('voice-symptoms-btn')) return;

        const box = document.createElement('div');
        box.className = 'voice-control-box';
        box.innerHTML = `
            <div class="voice-control-row">
                <button type="button" class="btn btn-secondary voice-btn" id="voice-symptoms-btn">🎙️ Speak Symptoms & Analyze</button>
                <button type="button" class="btn btn-secondary voice-btn" id="stop-voice-btn">⏹ Stop Voice</button>
            </div>
            <small id="voice-symptoms-status">Select language, click Speak, say symptoms clearly. AI will write, analyze, and read answer.</small>
        `;
        symptoms.closest('.input-group').appendChild(box);

        document.getElementById('voice-symptoms-btn').addEventListener('click', function () {
            startRecognition('symptoms', 'checker-lang', 'voice-symptoms-status', { type:'symptoms', timeout:13000 });
        });

        document.getElementById('stop-voice-btn').addEventListener('click', function () {
            stopActiveRecognition();
            setStatus('voice-symptoms-status', 'Voice stopped manually.', 'info');
        });
    }

    function addConsultationVoiceControls() {
        const input = document.getElementById('doctor-chat-input');
        if (!input || document.getElementById('voice-chat-btn')) return;

        const actions = input.closest('.doctor-chat-actions');
        const box = document.createElement('div');
        box.className = 'voice-control-box voice-chat-box';
        box.innerHTML = `
            <div class="voice-control-row">
                <button type="button" class="btn btn-secondary voice-btn" id="voice-chat-btn">🎙️ Speak Question & Send</button>
                <button type="button" class="btn btn-secondary voice-btn" id="stop-chat-voice-btn">⏹ Stop Voice</button>
                <button type="button" class="btn btn-secondary voice-btn" id="speak-last-chat-btn">🔊 Read Last Answer</button>
            </div>
            <small id="voice-chat-status">Select language, speak your question, and AI will answer/read it.</small>
        `;
        actions.parentNode.insertBefore(box, actions.nextSibling);

        document.getElementById('voice-chat-btn').addEventListener('click', function () {
            startRecognition('doctor-chat-input', 'chat-language', 'voice-chat-status', { type:'chat', timeout:13000 });
        });

        document.getElementById('stop-chat-voice-btn').addEventListener('click', function () {
            stopActiveRecognition();
            setStatus('voice-chat-status', 'Voice stopped manually.', 'info');
        });

        document.getElementById('speak-last-chat-btn').addEventListener('click', function () {
            const messages = document.querySelectorAll('.doctor-chat-message.doctor');
            const last = messages[messages.length - 1];
            if (last) speakText(last.innerText, document.getElementById('chat-language')?.value || 'en');
            else setStatus('voice-chat-status', 'No answer available yet.', 'error');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        addSymptomVoiceControls();
        addConsultationVoiceControls();

        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = function(){ window.speechSynthesis.getVoices(); };
        }
    });

    window.HealthVoice = {
        startRecognition,
        speakText,
        speakDashboard,
        speakSummaryFromAgent,
        getLangCode,
        getRecognitionCodes,
        stopActiveRecognition,
        setLastAgentData:function(data){ lastAgentDataForVoice = data || null; },
        autoAnalyzeSymptoms:submitSymptomsForm
    };
})();
