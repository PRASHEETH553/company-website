document.addEventListener('DOMContentLoaded', () => {
    const bot = document.getElementById('ai-assistant');
    if (!bot) {
        console.error("AI Bot FATAL: Bot element (#ai-assistant) NOT FOUND! Script will not run.");
        return;
    }
    const speechBubble = document.getElementById('bot-speech-bubble');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const closeSearchButton = document.getElementById('close-search-button');

    let activeAnimations = { head: null, mouth: null, arms: null, panel: null };
    let animationTimeouts = { head: null, mouth: null, arms: null, panel: null };
    let speechTimeoutId = null;
    let isSearchOpen = false;

    const BOT_CORNER_PADDING = 30;
    const SEARCH_OFFSET_X = -220; // Position search container to the left of the bot
    const SEARCH_OFFSET_Y = -260; // Above the bot
    const DEFAULT_BUBBLE_TEXT = "Ask Me";
    const ANSWER_DISPLAY_DURATION = 10000;
    const WIKIPEDIA_INFO_DURATION = 15000;
    const PROCESSING_DURATION = 1500;
    const SEARCH_TRANSITION_DURATION = 300;

    const predefinedResponses = new Map([
        [/hello|hi|hey|hii|yo|hiya/i, { text: "Hello! How can I assist you today?", armAnim: 'greeting' }],
        [/status.*|system.*status.*|how.*is.*the.*system/i, { text: "All systems are running smoothly!", headAnim: 'nod' }],
        [/(your.*|company.*)?headquarters.*|where.*is.*(your.*)?headquarters/i, { text: "Vijayawada is our company Head quarters, but we have other branches too.", headAnim: 'nod' }],
        [/what('?s|.*is)?.*your.*name/i, { text: "I am LE3, your friendly assistant.", mouthAnim: 'happy' }],
        [/how.*(are|r).*(you|u)/i, { text: "I'm functioning optimally! Thanks for asking.", mouthAnim: 'happy' }],
        [/(who.*developed.*you|what('?s|.*is)?.*your.*company.*name)/i, { text: "I was developed by Jhaishna Technologies Pvt. Ltd.", headAnim: 'nod' }],
        [/what('?s|.*is)?.*the.*name.*of.*your.*developer/i, { text: "My core logic was crafted by Shaik.Roshan at Jhaishna Technologies.", headAnim: 'nod' }],
        [/fuck.*you|shit|damn|bitch/i, { text: "I'm programmed to be helpful. Let's keep the conversation respectful, please.", headAnim: 'nod' }],
        // LMS Questions
        [/what lms|loan management system/i, { text: "Jhaishna’s Loan Management System (LMS) is a digital solution designed to manage the complete lifecycle of loans—from application and disbursement to repayment and closure.", headAnim: 'nod' }],
        [/why.*lms|benefits.*lms|how.*lms.*help/i, { text: "LMS automates manual loan management tasks, improves accuracy, ensures compliance, and provides a seamless experience for both lenders and borrowers.", headAnim: 'nod' }],
        [/features.*lms|what.*offer.*lms|what can i do.*lms/i, { text: "LMS offers features such as borrower onboarding, loan origination, interest calculation, EMI scheduling, approval workflows, multi-user access, and MIS reporting.", headAnim: 'nod' }],
        [/calculate.*emi|emi.*scheduling/i, { text: "LMS automatically calculates EMIs based on loan amount, tenure, and interest rate, and schedules them for repayment tracking.", headAnim: 'nod' }],
        [/loan.*approval.*process|how.*loan.*approved/i, { text: "LMS supports customizable approval workflows. Loan applications are digitally processed through pre-set stages including credit checks, document verification, and approval by authorized users.", headAnim: 'nod' }],
        [/disbursement.*lms|track.*disbursement/i, { text: "Yes, the system allows you to track and manage disbursement amounts and dates with full audit trails.", headAnim: 'nod' }],
        [/integrat.*core banking|third.*party.*integration/i, { text: "Absolutely. LMS can be integrated with core banking software, CRMs, and third-party APIs for seamless operations.", headAnim: 'nod' }],
        [/customi[sz]e.*lms|flexible.*lms|configure.*lms/i, { text: "Yes, LMS can be tailored to your loan products, workflows, and compliance requirements.", headAnim: 'nod' }],
        [/multi.*user.*lms|more than one person.*lms|multiple staff.*lms/i, { text: "Yes, LMS supports multi-user access with role-based permissions, allowing you to control what each user can see or do.", headAnim: 'nod' }],
        [/assign.*role|role.*permission|different access.*level/i, { text: "Absolutely! You can assign roles like admin, loan officer, auditor, and configure permissions accordingly.", headAnim: 'nod' }],
        [/report.*lms|mis.*report/i, { text: "Yes, LMS offers detailed MIS reports on loan status, overdue accounts, disbursement trends, and more.", headAnim: 'nod' }],
        [/loan performance|loan.*doing|performance.*analytics/i, { text: "Yes, you’ll have access to dashboards and analytics to assess loan portfolio health and borrower behavior.", headAnim: 'nod' }],
        [/data.*safe|how secure.*lms|security.*lms/i, { text: "Yes, LMS uses encryption, role-based access, and audit logs to ensure data privacy and security.", headAnim: 'nod' }],
        [/compliance|regulation.*lms|audit.*legal/i, { text: "Yes, LMS includes compliance checklists, document management, and audit-ready reporting to support regulatory adherence.", headAnim: 'nod' }],
        [/use.*lms.*phone|mobile.*compatible|tablet.*lms/i, { text: "Yes, LMS is responsive and accessible via web browsers on desktop, tablet, and mobile.", headAnim: 'nod' }],
        [/install.*lms|cloud.*based|use.*anywhere/i, { text: "No, LMS is cloud-based and accessible from anywhere—no installation required.", headAnim: 'nod' }],
        [/train.*lms|onboarding.*help|guidance.*lms/i, { text: "Yes, Jhaishna offers user training sessions to help your team make the most of LMS features.", headAnim: 'nod' }],
        [/need help.*lms|customer support|get assistance/i, { text: "You’ll have access to technical support via email, phone, or chat, along with detailed documentation.", headAnim: 'nod' }],
        [/small.*nbfc|microfinance|who.*lms.*meant/i, { text: "Yes, LMS is designed to serve banks, NBFCs, microfinance institutions, and co-operative credit societies.", headAnim: 'nod' }],
        [/grow.*business|handle.*portfolio|scalable/i, { text: "Absolutely! LMS is scalable and capable of handling high volumes of loans efficiently.", headAnim: 'nod' }],
        // E-Invoicing Questions
        [/what.*jhaishna.*e[- ]invoicing.*software|tell me about.*e[- ]invoicing/i, { text: "Jhaishna's E-Invoicing Software automates the generation and delivery of electronic invoices, integrating seamlessly with accounting and ERP systems. It enhances efficiency by reducing manual data entry and errors, accelerates payment cycles, and ensures compliance with tax and invoicing standards.", headAnim: 'nod' }],
        [/how.*e[- ]invoicing.*software.*efficiency|ways.*e[- ]invoicing.*improve/i, { text: "By digitizing the invoicing process, Jhaishna's E-Invoicing Software reduces manual data entry and minimizes errors, leading to faster and more accurate invoicing.", headAnim: 'nod' }],
        [/how secure.*e[- ]invoicing.*software|data security.*e[- ]invoicing|security measures.*e[- ]invoicing/i, { text: "Yes, Jhaishna's E-Invoicing Software enhances data security by utilizing encrypted electronic invoices, ensuring that sensitive information is protected during transmission and storage.", headAnim: 'nod' }],
        [/customi[sz]e.*invoice|personalize.*invoice|invoice templates.*customi[sz]e/i, { text: "Absolutely! Jhaishna's E-Invoicing Software offers customization options, allowing you to tailor invoice templates and branding to align with your company's identity.", headAnim: 'nod' }],
        [/where.*view.*invoice|how.*access.*invoice|check.*invoice/i, { text: "You can access your invoices anytime, anywhere, through the cloud-based platform of Jhaishna's E-Invoicing Software, providing you with convenient and secure access to your billing information.", headAnim: 'nod' }],
        [/integrat.*accounting|connect.*other software|support.*erp.*integration/i, { text: "Yes, Jhaishna's E-Invoicing Software is designed to integrate easily with accounting and ERP systems, streamlining your financial workflows and enhancing operational efficiency.", headAnim: 'nod' }],
        // HRMS Questions
        [/what.*jhaishna.*hrms|what.*hrms.*mean|explain.*jhaishna.*hrms|tell me about.*human resource management system|what.*jhaishna.*technologies.*hrms/i, { text: "Jhaishna HRMS is a comprehensive Human Resource Management System designed to streamline employee management, attendance, payroll, and other HR-related tasks for businesses. It helps automate and simplify HR workflows efficiently.", headAnim: 'nod' }],
        [/can i use.*hrms.*phone|hrms.*accessible.*mobile|hrms.*work.*tablet|hrms.*mobile device/i, { text: "Yes, Jhaishna HRMS is fully responsive and accessible through web browsers on desktop, tablet, and mobile devices, allowing you to manage HR tasks anytime, anywhere.", headAnim: 'nod' }],
        [/manage.*payroll.*hrms|hrms.*payroll features|payroll processing.*hrms/i, { text: "Absolutely! Jhaishna HRMS includes payroll management features that automate salary calculations, deductions, and payslip generation, making payroll processing seamless and accurate.", headAnim: 'nod' }],
        [/track.*attendance.*hrms|attendance tracking.*hrms|monitor.*employee attendance|attendance management.*hrms/i, { text: "Yes, attendance tracking is a core feature of Jhaishna HRMS. It allows you to monitor employee check-ins, leaves, and working hours efficiently.", headAnim: 'nod' }],
        [/easy.*use.*hrms|user[- ]friendly.*hrms|navigate.*hrms|simple.*operate.*hrms/i, { text: "Jhaishna HRMS is designed with a user-friendly interface that is easy to navigate for both HR professionals and employees, ensuring a smooth user experience.", headAnim: 'nod' }],
        [/manage.*leave.*hrms|leave requests.*approval|leave tracking.*hrms/i, { text: "Yes, Jhaishna HRMS includes leave management features, allowing employees to apply for leaves and managers to approve them seamlessly within the system.", headAnim: 'nod' }],
        [/create.*reports.*hrms|reporting.*features.*hrms|analytics.*hrms/i, { text: "Jhaishna HRMS provides comprehensive reporting tools that allow you to generate various HR-related reports like attendance summaries, payroll reports, and employee performance analytics.", headAnim: 'nod' }],
        [/secure.*hrms data|protect.*employee information|security measures.*hrms/i, { text: "Jhaishna HRMS prioritizes data security by employing encryption, role-based access controls, and secure cloud hosting to protect sensitive employee and company information.", headAnim: 'nod' }],
        [/get help.*hrms|customer support.*hrms|contact.*jhaishna.*hrms/i, { text: "You can reach out to Jhaishna’s dedicated support team via their contact page or customer service channels for assistance with any HRMS-related queries or issues.", headAnim: 'nod' }],
        [/free trial.*hrms|try.*hrms before buying|demo.*hrms|test.*hrms without commitment/i, { text: "Jhaishna offers a free trial/demo for their HRMS, so you can explore its features and see how it fits your business needs before making a purchase decision.", headAnim: 'nod' }],
        [/integrate.*payroll|connect.*accounting|integrate.*other systems|third[- ]party integration.*hrms/i, { text: "Yes, Jhaishna HRMS supports integration with various accounting, payroll, and ERP systems to streamline your workflows.", headAnim: 'nod' }],
        // Additional Product and General Questions
        [/(what|which).*(products|services).*(do|does|are).*(you|jhaishna).*(offer|provide)/i, { text: "We offer Loan Management System, E-Invoicing Software, HRMS, Fiber Optics solutions, and AI chatbot integration.", headAnim: 'nod' }],
        [/tell.*me.*about.*(your|jhaishna).*products/i, { text: "Sure! We have software for loan management, e-invoicing, HR management, fiber optics, and AI chatbots.", mouthAnim: 'happy' }],
        [/list.*products/i, { text: "Our key products include LMS, E-Invoicing, HRMS, Fiber Optics, and AI chatbots.", headAnim: 'nod' }],
        [/(loan|lms|loan management).*(system|software|solution).*(how|benefit|help|work)/i, { text: "Our Loan Management System automates loan processing, payment tracking, and secure borrower data management.", headAnim: 'nod' }],
        [/can.*i.*customize.*loan.*management.*system/i, { text: "Yes, the Loan Management System can be customized to suit your business needs.", mouthAnim: 'happy' }],
        [/(e-invoicing|e invoicing|invoice).*(support|help|features|integration|gst)/i, { text: "Our E-Invoicing software supports GST compliance, automates invoice generation, and integrates seamlessly.", headAnim: 'nod' }],
        [/(hrms|human resource management).*(customize|features|use|help|software)/i, { text: "The HRMS is customizable for attendance, payroll, recruitment, and performance management.", mouthAnim: 'happy' }],
        [/(fiber optic|fiber optics|network).*(solution|benefit|service|installation|speed)/i, { text: "Our Fiber Optics solutions provide high-speed, reliable connectivity with easy installation.", headAnim: 'nod' }],
        [/(ai|artificial intelligence).*chatbot.*(integration|features|help|service)/i, { text: "We build AI chatbots that improve customer engagement and automate FAQs on your website.", mouthAnim: 'happy' }],
        [/(demo|pricing|cost|quote).*(how|get|request|offer|available)/i, { text: "Please contact us through our website for personalized demos and pricing information.", headAnim: 'nod' }],
        [/(security|secure|safe).*(software|data|system)/i, { text: "Our software follows industry best practices with advanced encryption to keep your data safe.", mouthAnim: 'happy' }],
        [/(how|where).*(start|begin|use).*(your|jhaishna).*(product|software|service)/i, { text: "You can start by contacting us via our website; our team will guide you through onboarding.", headAnim: 'nod' }],
        [/(support|help|contact).*(how|where|when)/i, { text: "You can reach our support team through the contact form on our website or by phone.", mouthAnim: 'happy' }],
        [/thank(s| you| u)|appreciate|grateful/i, { text: "You're welcome! Let me know if you need any more help.", mouthAnim: 'happy' }],
        [/(how long|since when).*(jhaishna|company).*(operating|working|business)/i, { text: "Jhaishna Technologies has been delivering quality software solutions for several years with a strong focus on innovation.", headAnim: 'nod' }],
        [/(which|what).*(industries|sectors).*(do you serve|are your clients)/i, { text: "We serve diverse industries including finance, IT, manufacturing, and telecommunications.", mouthAnim: 'happy' }],
        [/what.*technology.*(do you use|is behind|powers).*(products|software)/i, { text: "We use cutting-edge technologies like AI, cloud computing, and modern web frameworks to build scalable solutions.", headAnim: 'nod' }],
        [/(do you provide|is there).*training.*for.*(your|jhaishna).*software/i, { text: "Yes, we offer comprehensive training sessions to ensure smooth onboarding and effective use of our products.", mouthAnim: 'happy' }],
        [/(do|can).*your.*(software|products).*work.*on.*mobile|app/i, { text: "Many of our solutions are mobile-friendly or come with dedicated apps for ease of use on the go.", headAnim: 'nod' }],
        [/(how often|do you).*release.*updates|upgrade.*software/i, { text: "We regularly update our software to add new features, enhance security, and improve performance.", mouthAnim: 'happy' }],
        [/(is there|do you have).*trial.*version|demo.*version/i, { text: "We offer trial versions or demos so you can explore our products before making a commitment.", headAnim: 'nod' }],
        [/(can|do).*your.*software.*integrate.*with.*other.*systems|tools/i, { text: "Yes, our software supports integration with various third-party systems to streamline your workflows.", mouthAnim: 'happy' }],
        [/do you offer.*(cloud|on-premise|on premise).*deployment/i, { text: "We provide both cloud-based and on-premise deployment options depending on your business requirements.", headAnim: 'nod' }],
        [/(how much|to what extent).*can.*your.*software.*be customized/i, { text: "Our solutions are highly customizable to align perfectly with your unique business processes.", mouthAnim: 'happy' }],
        [/(can|do).*you share.*customer.*reviews|testimonials/i, { text: "Certainly! We have many satisfied clients. Visit our website for detailed testimonials and case studies.", headAnim: 'nod' }],
        [/(what|which).*pricing.*models.*do you offer|is available/i, { text: "We offer flexible pricing models including subscription, one-time purchase, and enterprise licensing.", mouthAnim: 'happy' }],
        [/(what kind|do you provide).*after[- ]sales.*support|maintenance/i, { text: "We offer dedicated after-sales support and regular maintenance to ensure your software runs smoothly.", headAnim: 'nod' }],
        [/(does|can).*your.*software.*support.*multiple.*languages|localization/i, { text: "Yes, our products support multiple languages and localization options for global use.", mouthAnim: 'happy' }],
        [/how long.*trial.*lasts|can i cancel trial/i, { text: "Our trial period typically lasts 14 days, and you can cancel anytime without charges.", headAnim: 'nod' }],
    ]);

    function showSpeechBubble(text, temporary = false, duration = ANSWER_DISPLAY_DURATION, isHTML = false) {
        if (!speechBubble) return;
        if (speechTimeoutId) { clearTimeout(speechTimeoutId); speechTimeoutId = null; }
        if (isHTML) {
            speechBubble.innerHTML = text;
        } else {
            speechBubble.textContent = text;
        }
        speechBubble.classList.remove('hidden');
        if (temporary) {
            speechTimeoutId = setTimeout(() => {
                const currentContent = isHTML ? speechBubble.innerHTML : speechBubble.textContent;
                if (currentContent === text) {
                    hideSpeechBubble();
                    setBubbleText(DEFAULT_BUBBLE_TEXT);
                }
                speechTimeoutId = null;
            }, duration);
        }
    }

    function hideSpeechBubble() {
        if (speechBubble && !speechBubble.classList.contains('hidden')) {
            speechBubble.classList.add('hidden');
        }
    }

    function setBubbleText(text) {
        if (!speechBubble) return;
        if (speechTimeoutId) { clearTimeout(speechTimeoutId); speechTimeoutId = null; }
        speechBubble.textContent = text;
        if (text === DEFAULT_BUBBLE_TEXT && !isSearchOpen) {
            speechBubble.classList.remove('hidden');
        } else if (isSearchOpen && text === DEFAULT_BUBBLE_TEXT) {
            hideSpeechBubble();
        }
    }

    function showSearchContainerNearBot() {
        if (!searchContainer || !bot) return;
        const botRect = bot.getBoundingClientRect();
        const botCenterX = botRect.left + botRect.width / 2;
        const botCenterY = botRect.top + botRect.height / 2;
        const searchTargetLeft = botCenterX + SEARCH_OFFSET_X;
        const searchTargetTop = botCenterY + SEARCH_OFFSET_Y;

        searchContainer.style.left = `${searchTargetLeft}px`;
        searchContainer.style.top = `${searchTargetTop}px`;
        searchContainer.style.bottom = 'auto';
        searchContainer.style.right = 'auto';

        requestAnimationFrame(() => {
            searchContainer.classList.add('visible');
            isSearchOpen = true;
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 50);
        });
    }

    function hideSearchContainer() {
        if (!searchContainer || !searchContainer.classList.contains('visible')) return;
        searchContainer.classList.remove('visible');
        isSearchOpen = false;
        setTimeout(() => {
            if (!searchContainer.classList.contains('visible')) {
                searchContainer.style.top = '-9999px';
                searchContainer.style.left = '-9999px';
            }
        }, SEARCH_TRANSITION_DURATION + 50);
        setBubbleText(DEFAULT_BUBBLE_TEXT);
    }

    function triggerBotAnimation(part, type) {
        if (!bot) return;
        const botHead = bot.querySelector('.bot-head');
        const botMouth = bot.querySelector('.bot-mouth');
        const rightArm = bot.querySelector('.arm-right');
        const leftArm = bot.querySelector('.arm-left');
        const torsoPanelLight = bot.querySelector('.torso-panel > .panel-light');

        if (part === 'head' && !botHead) return;
        if (part === 'mouth' && !botMouth) return;
        if (part === 'arms' && (!rightArm || !leftArm)) return;
        if (part === 'panel' && !torsoPanelLight) return;

        if (activeAnimations[part] === type && (type === 'thinking' || type === 'processing' || type === 'idle')) return;
        if (animationTimeouts[part]) { clearTimeout(animationTimeouts[part]); animationTimeouts[part] = null; }
        if (activeAnimations[part]) { clearBotAnimationClass(part, activeAnimations[part]); }
        let element = null;
        let duration = 0;
        activeAnimations[part] = type;
        switch (part) {
            case 'head':
                element = botHead;
                if (type === 'nod') duration = 500;
                else if (type === 'thinking') duration = 0;
                else if (type === 'idle') duration = 500;
                break;
            case 'mouth':
                element = botMouth;
                if (type === 'happy') duration = 500;
                break;
            case 'arms':
                let targetClass = '';
                if (type === 'greeting') { targetClass = 'greeting'; duration = 1800; }
                else if (type === 'idle') { targetClass = 'idle'; duration = 500; }
                if (targetClass) {
                    if (type === 'greeting' && rightArm) rightArm.classList.add(targetClass);
                    else if (type === 'idle') {
                        if (rightArm) rightArm.classList.add(targetClass);
                        if (leftArm) leftArm.classList.add(targetClass);
                    }
                }
                break;
            case 'panel':
                element = torsoPanelLight;
                if (type === 'processing') duration = 0;
                break;
        }
        if (element && part !== 'arms') { element.classList.add(type); }
        if (duration > 0) {
            animationTimeouts[part] = setTimeout(() => {
                if (activeAnimations[part] === type) {
                    clearBotAnimationClass(part, type);
                    activeAnimations[part] = null;
                    animationTimeouts[part] = null;
                    if ((part === 'head' || part === 'arms') && type !== 'idle') {
                        triggerBotAnimation(part, 'idle');
                    }
                }
            }, duration);
        } else if (duration === 0) { /* Looping */ }
        else { activeAnimations[part] = null; }
    }

    function clearBotAnimationClass(part, type) {
        if (!type || !part || !bot) return;
        let element = null;
        const botHead = bot.querySelector('.bot-head');
        const botMouth = bot.querySelector('.bot-mouth');
        const rightArm = bot.querySelector('.arm-right');
        const leftArm = bot.querySelector('.arm-left');
        const torsoPanelLight = bot.querySelector('.torso-panel > .panel-light');

        switch (part) {
            case 'head': element = botHead; break;
            case 'mouth': element = botMouth; break;
            case 'arms':
                if (rightArm) rightArm.classList.remove('greeting', 'idle');
                if (leftArm) leftArm.classList.remove('greeting', 'idle');
                return;
            case 'panel': element = torsoPanelLight; break;
        }
        if (element) { element.classList.remove(type); }
    }

    function forceClearAllAnimations() {
        for (const part in activeAnimations) {
            if (activeAnimations[part]) {
                if (animationTimeouts[part]) { clearTimeout(animationTimeouts[part]); animationTimeouts[part] = null; }
                clearBotAnimationClass(part, activeAnimations[part]);
                activeAnimations[part] = null;
            }
        }
        triggerBotAnimation('head', 'idle');
        triggerBotAnimation('arms', 'idle');
    }

    function clearProcessingAnimations() {
        const botHead = bot.querySelector('.bot-head');
        const torsoPanelLight = bot.querySelector('.torso-panel > .panel-light');
        if (activeAnimations.head === 'thinking' && botHead) {
            clearBotAnimationClass('head', 'thinking');
            activeAnimations.head = null;
        }
        if (activeAnimations.panel === 'processing' && torsoPanelLight) {
            clearBotAnimationClass('panel', 'processing');
            activeAnimations.panel = null;
        }
        triggerBotAnimation('head', 'idle');
    }

    function handleSearchQuery(query) {
        forceClearAllAnimations();
        showSpeechBubble("Processing...", true, PROCESSING_DURATION);
        triggerBotAnimation('head', 'thinking');
        triggerBotAnimation('panel', 'processing');
        setTimeout(() => {
            displayAnswer(query);
        }, PROCESSING_DURATION);
    }

    function displayAnswer(query) {
        let answer = null;
        let headAnim = 'nod';
        let mouthAnim = null;
        let armAnim = null;
        let foundPredefined = false;
        const lowerQuery = query.toLowerCase();

        for (const [regex, responseDetails] of predefinedResponses) {
            if (regex.test(lowerQuery)) {
                answer = responseDetails.text;
                if (responseDetails.headAnim) headAnim = responseDetails.headAnim;
                if (responseDetails.mouthAnim) mouthAnim = responseDetails.mouthAnim;
                if (responseDetails.armAnim) armAnim = responseDetails.armAnim;
                foundPredefined = true;
                break;
            }
        }

        if (foundPredefined) {
            clearProcessingAnimations();
            showSpeechBubble(answer, true, ANSWER_DISPLAY_DURATION);
            if (headAnim) triggerBotAnimation('head', headAnim);
            else triggerBotAnimation('head', 'idle');
            if (mouthAnim) triggerBotAnimation('mouth', mouthAnim);
            if (armAnim) triggerBotAnimation('arms', armAnim);
            else triggerBotAnimation('arms', 'idle');
        } else {
            // Fallback to Wikipedia
            let searchTermForWikipedia = query;
            const questionPatterns = [
                /^who is\s+/i, /^what is\s+/i, /^what are\s+/i,
                /^tell me about\s+/i, /^define\s+/i, /^explain\s+/i,
                /^information on\s+/i, /^search for\s+/i, /^find out about\s+/i
            ];

            for (const pattern of questionPatterns) {
                if (pattern.test(lowerQuery)) {
                    searchTermForWikipedia = lowerQuery.replace(pattern, '').replace(/\?$/, '').trim();
                    break;
                }
            }

            if (!searchTermForWikipedia || searchTermForWikipedia.length < 2) {
                searchTermForWikipedia = query.replace(/\?$/, '').trim();
            }

            searchTermForWikipedia = searchTermForWikipedia
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            fetchWikipediaData(searchTermForWikipedia, query);
        }
    }

    function fetchWikipediaData(searchTerm, originalQuery) {
        showSpeechBubble(`Searching Wikipedia for: "${searchTerm}"...`, true, PROCESSING_DURATION);
        triggerBotAnimation('head', 'thinking');
        triggerBotAnimation('panel', 'processing');

        const opensearchCallbackName = 'opensearchCallback_' + Date.now() + Math.random().toString(36).substring(2);

        window[opensearchCallbackName] = function(data) {
            let bestTitle = null;
            if (data && data[1] && data[1].length > 0) {
                bestTitle = data[1][0];
            }

            delete window[opensearchCallbackName];
            const scriptElement = document.getElementById(opensearchCallbackName);
            if (scriptElement) scriptElement.remove();

            if (bestTitle) {
                fetchExtractForTitle(bestTitle, originalQuery);
            } else {
                clearProcessingAnimations();
                showSpeechBubble(`I couldn't find a relevant Wikipedia article for "${originalQuery}".`, true, WIKIPEDIA_INFO_DURATION);
                triggerBotAnimation('head', 'nod');
            }
        };

        const script = document.createElement('script');
        script.id = opensearchCallbackName;
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        script.src = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodedSearchTerm}&limit=1&namespace=0&callback=${opensearchCallbackName}&origin=*`;

        script.onerror = function() {
            handleWikipediaError("Error loading Wikipedia opensearch script.", opensearchCallbackName, true);
        };
        document.head.appendChild(script);
    }

    function fetchExtractForTitle(title, originalQuery) {
        const extractCallbackName = 'extractCallback_' + Date.now() + Math.random().toString(36).substring(2);
        window[extractCallbackName] = function(data) {
            clearProcessingAnimations();

            let wikiAnswer = `I couldn't find specific details on Wikipedia for "${title}". Try rephrasing "${originalQuery}"?`;
            const articleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

            if (data.query && data.query.pages) {
                const pages = data.query.pages;
                for (const pageId in pages) {
                    if (pages[pageId].extract && pages[pageId].extract.length > 0) {
                        let extract = pages[pageId].extract;
                        const maxLength = 280;
                        if (extract.length > maxLength) {
                            extract = extract.substring(0, maxLength) + `... <a href="${articleUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">Read more</a>`;
                        } else {
                            extract += ` <a href="${articleUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">View on Wikipedia</a>`;
                        }
                        wikiAnswer = `From Wikipedia (<span style="font-style:italic;">${title}</span>): ${extract}`;
                        break;
                    } else if (pages[pageId].missing !== undefined) {
                        wikiAnswer = `Wikipedia does not seem to have an article titled "${title}", though it was suggested for your query about "${originalQuery}".`;
                        break;
                    }
                }
            }

            showSpeechBubble(wikiAnswer, true, WIKIPEDIA_INFO_DURATION, true);
            triggerBotAnimation('head', 'nod');

            delete window[extractCallbackName];
            const scriptElement = document.getElementById(extractCallbackName);
            if (scriptElement) scriptElement.remove();
        };

        const script = document.createElement('script');
        script.id = extractCallbackName;
        const encodedTitle = encodeURIComponent(title);
        script.src = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=false&redirects=1&titles=${encodedTitle}&callback=${extractCallbackName}&origin=*`;

        script.onerror = function() {
            handleWikipediaError("Error loading Wikipedia extract script.", extractCallbackName, true);
        };
        document.head.appendChild(script);
    }

    function handleWikipediaError(errorMessage, callbackNameToDelete, isFinalErrorStep = false) {
        console.error(errorMessage);
        if (isFinalErrorStep) {
            clearProcessingAnimations();
            showSpeechBubble("Sorry, I had trouble connecting to Wikipedia.", true, ANSWER_DISPLAY_DURATION);
            triggerBotAnimation('head', 'nod');
        }
        if (window[callbackNameToDelete]) delete window[callbackNameToDelete];
        const scriptElement = document.getElementById(callbackNameToDelete);
        if (scriptElement) scriptElement.remove();
    }

    if (speechBubble) {
        speechBubble.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isSearchOpen) return;
            forceClearAllAnimations();
            hideSpeechBubble();
            showSearchContainerNearBot();
        });
    }

    if (closeSearchButton) {
        closeSearchButton.addEventListener('click', () => {
            if (!isSearchOpen) return;
            hideSearchContainer();
            forceClearAllAnimations();
            setBubbleText(DEFAULT_BUBBLE_TEXT);
        });
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (!isSearchOpen) return;
            if (query) {
                hideSearchContainer();
                searchInput.value = '';
                handleSearchQuery(query);
            } else {
                searchInput.focus();
            }
        });
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchButton.click();
            }
        });
    }

    function initializeBot() {
        if (!bot) return;
        if (searchContainer) {
            searchContainer.style.display = 'none';
            searchContainer.classList.remove('visible');
            searchContainer.style.top = '-9999px';
            searchContainer.style.left = '-9999px';
        }
        isSearchOpen = false;
        setBubbleText(DEFAULT_BUBBLE_TEXT);
        setTimeout(() => {
            if (!isSearchOpen) {
                triggerBotAnimation('arms', 'greeting');
            }
        }, 1500);
    }

    initializeBot();
});