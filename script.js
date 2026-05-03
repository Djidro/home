const supabaseUrl = 'https://jwjyrsikkxenmfuprmra.supabase.co';
const supabaseKey = 'sb_publishable_PHN_TDMztYkLLKkxbeFanA_cKKHEu94';

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

(function () {
  "use strict";
    // ---------- 🔐 PASSWORD PROTECTION ----------
    const CORRECT_PASSWORD = "28.dec";   // CHANGE THIS TO YOUR PASSWORD

    const loginOverlay = document.getElementById('loginOverlay');
    const mainApp = document.getElementById('mainApp');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    // Check if already authenticated (session only)
    if (sessionStorage.getItem('lovequest_auth') === 'true') {
        loginOverlay.classList.add('hidden');
        mainApp.classList.add('visible');
    }

    function attemptLogin() {
        const entered = passwordInput.value.trim();
        if (entered === CORRECT_PASSWORD) {
            sessionStorage.setItem('lovequest_auth', 'true');
            loginOverlay.classList.add('hidden');
            mainApp.classList.add('visible');
            loginError.textContent = '';
            
            // Initialize game after successful login (only once!)
            setTimeout(() => {
                if (!window._gameInitialized) {
                    initGameApp();
                    window._gameInitialized = true;
                }
            }, 50);
        } else {
            loginError.textContent = '❌ Incorrect password';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            attemptLogin();
        }
    });

    // If already logged in, initialize game immediately (ONLY ONCE)
    if (sessionStorage.getItem('lovequest_auth') === 'true') {
        loginOverlay.classList.add('hidden');
        mainApp.classList.add('visible');
        // Wait for DOM to be fully ready before initializing
        setTimeout(() => {
            if (!window._gameInitialized) {
                initGameApp();
                window._gameInitialized = true;
            }
        }, 50);
    }

    /* ************************************************************ */
    /* 🔧 EDIT SECTION 1: CUSTOMIZE YOUR GIRLFRIEND'S INFO           */
    /* ************************************************************ */
    
    // 👤 CHANGE THIS to your girlfriend's name
    let girlfriendName = "Tasnim";
    
    // 💬 EDIT THESE POPUP MESSAGES (shown randomly during mini-game)
    const specialMessages = [
        "You're my favorite notification ❤️", 
        "Every day with you is a new level of love.",
        "I fall for you again and again.", 
        "You're the heart of my game.",
        "Tasnim, you make life magical ✨",
        "You're the reason I smile every day 💕",
        "My heart beats only for you 💓"
    ];
    
    // 💌 EDIT THESE LOVE MESSAGES (shown in Daily Love Message screen)
    const dailyLoveMessages = [
        "You're my today and all my tomorrows.",
        "Thinking of you is my favorite hobby.",
        "Tasnim, you make ordinary days magical.",
        "I love you more than yesterday.",
        "You are my sunshine ☀️",
        "Every moment with you is a treasure 💎",
        "You're the best thing that ever happened to me",
        "My love for you grows stronger each day 🌱",
        "You're not just my girlfriend, you're my everything",
        "Falling in love with you was the best decision ever 💕",
        "You make my heart skip a beat 💓",
        "I cherish every second we spend together",
        "You're the missing piece I never knew I needed 🧩",
        "With you, every day feels like a fairytale ✨",
        "You're my dream come true 🌙",
        "I love you to the moon and back 🌙⭐",
        "You're my favorite person in the whole world 🌍",
        "Thank you for being you 💝",
        "You're beautiful inside and out 💖",
        "I'm so lucky to have you in my life 🍀"
    ];

    /* ************************************************************ */
    /* 🔧 EDIT SECTION 2: MEMORY GALLERY (Images & Videos)           */
    /* ************************************************************ */
    const memories = [
        { 
            type: "video",
            title: "🌟 First video together", 
            full: "From nothing, this video reflects what we dreamed of becoming.",
            videoId: "oLGeMfnNP5g"
        },
        { 
            type: "image",
            title: "💫 Meaningful moment", 
            full: "The moment our love grew deeper and more meaningful.",
            image: "gallery-1.jpg"
        },
        { 
            type: "image",
            title: "🌙 28.dec.2017", 
            full: "28 Dec 2017 - the day forever began.",
            image: "gallery-2.jpg"
        },
        { 
            type: "video",
            title: "💫 Our Beautiful World", 
            full: "Even with many reasons to break up, we held on to each other.",
            videoId: "mKZUeGkqtEQ"
        },
        { 
            type: "image",
            title: "📸 First photo together", 
            full: "Our first image together—simple, but the start of something truly special.",
            image: "gallery-3.jpg"
        },
        { 
            type: "image",
            title: "🌸 Queen almahdi", 
            full: "My life, my story, my memories—summed up in one photo.",
            image: "gallery-4.jpg"
        },
        { 
            type: "image",
            title: "🕊️ Childhood", 
            full: "From kids to growing up together, and hoping to stay together forever.",
            image: "gallery-5.jpg"
        }
    ];

    /* ************************************************************ */
    /* 🔧 EDIT SECTION 3: STORY MODE LEVELS (Unlimited Chapters)     */
    /* ************************************************************ */
    const storyLevels = [
        { 
            title: '✨ First meeting', 
            dialogue: 'I still remember the first time I saw you... my heart skipped a beat.', 
            choices: ['You were glowing ✨', 'I was so nervous'], 
            romanticEnd: 'That moment, something changed in me forever.' 
        },
        { 
            title: '💕 Getting closer', 
            dialogue: 'Every conversation felt like coming home to where I belong.', 
            choices: ['I loved your voice', 'You made me laugh so much'], 
            romanticEnd: 'I started falling for you, slowly but surely.' 
        },
        { 
            title: '💖 Falling in love', 
            dialogue: 'I realized I couldn\'t stop thinking about you, every minute of every day.', 
            choices: ['It was scary but beautiful', 'I was completely all in'], 
            romanticEnd: 'And I fell completely, head over heels.' 
        },
        { 
            title: '🌙 Missing each other', 
            dialogue: 'Distance made my heart grow fonder with each passing day.', 
            choices: ['I counted the days until we\'d meet', 'Your messages saved me daily'], 
            romanticEnd: 'Missing you became a sweet, beautiful ache.' 
        },
        { 
            title: '💍 Forever promise', 
            dialogue: 'I want you in every single chapter of my life story.', 
            choices: ['Always and forever ❤️', 'You\'re my forever person'], 
            romanticEnd: 'No matter what happens, I will always choose you.' 
        },
        { 
            title: '🌟 Growing together', 
            dialogue: 'Every challenge we faced only made our love stronger.', 
            choices: ['We\'re an unstoppable team 💪', 'Nothing can break us'], 
            romanticEnd: 'Together, we can conquer anything life throws at us.' 
        },
        { 
            title: '🎵 Our song', 
            dialogue: 'Every love song suddenly makes perfect sense because of you.', 
            choices: ['You\'re the melody to my heart 🎶', 'Our love is the sweetest song'], 
            romanticEnd: 'Our love story is my favorite song that never ends.' 
        },
        { 
            title: '🌅 Beautiful future', 
            dialogue: 'When I think about tomorrow, all I see is you beside me.', 
            choices: ['Building dreams together 🏠', 'Growing old with you 👵👴'], 
            romanticEnd: 'The best is yet to come because I have you.' 
        }
    ];

    /* ************************************************************ */
    /* 🔧 EDIT SECTION 4: WHATSAPP NUMBER                           */
    /* ************************************************************ */
    const whatsappNumber = "96878440900";

    /* ************************************************************ */
    /* ⚠️ ADVANCED: Only edit below if you know what you're doing!  */
    /* ************************************************************ */
    
    // ----- Game State ------
    let currentScreen = 'home';
    let currentStoryChapter = 0;
    let musicEnabled = true;
    let typingSoundEnabled = true;
    
    // Mini game
    let gameInterval = null;
    let gameActive = false;
    let score = 0;
    
    // Typing
    let typingInterval = null;

    // DOM elements
    let screens = {};
    let welcomeMsg, dynamicNameSpan;
    
    function initGameApp() {
        // Initialize DOM references
        screens = {
    home: document.getElementById('homeScreen'),
    story: document.getElementById('storyScreen'),
    mini: document.getElementById('miniGameScreen'),
    daily: document.getElementById('dailyScreen'),
    quiz: document.getElementById('quizScreen'),  // ← ADD THIS LINE
    gallery: document.getElementById('galleryScreen'),
    future: document.getElementById('futureScreen'),
    settings: document.getElementById('settingsScreen')
};
        welcomeMsg = document.getElementById('welcomeMessage');
        dynamicNameSpan = document.getElementById('dynamicNameDisplay');
        
        // ---- INIT PERSONALIZATION ----
        updateNameEverywhere();
        
        // ----- SCREEN NAVIGATION -----
        function showScreen(screenId) {
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });
    if (screens[screenId]) {
        screens[screenId].classList.add('active');
    }
    currentScreen = screenId;
    if (screenId === 'daily') generateDailyMessage();
    if (screenId === 'gallery') renderMemoryGallery();
    if (screenId === 'story') loadStoryChapter(currentStoryChapter);
    if (screenId === 'future') renderFuturePlans();
    if (screenId === 'quiz') {
        // Reset quiz view to intro when navigating to quiz
        const quizIntro = document.getElementById('quizIntro');
        const quizActive = document.getElementById('quizActive');
        const quizResult = document.getElementById('quizResult');
        const quizHistoryView = document.getElementById('quizHistoryView');
        
        if (quizIntro) quizIntro.style.display = 'block';
        if (quizActive) quizActive.style.display = 'none';
        if (quizResult) quizResult.style.display = 'none';
        if (quizHistoryView) quizHistoryView.style.display = 'none';
        
        initQuizUI();
    }
}
        // ----- LOCALSTORAGE -----
        function saveProgress() {
            localStorage.setItem('loveQuest_progress', JSON.stringify({ 
                chapter: currentStoryChapter, 
                music: musicEnabled, 
                typing: typingSoundEnabled 
            }));
        }
        
        function loadProgress() {
            const saved = localStorage.getItem('loveQuest_progress');
            if(saved) {
                try {
                    const data = JSON.parse(saved);
                    currentStoryChapter = data.chapter || 0;
                    musicEnabled = data.music !== undefined ? data.music : true;
                    typingSoundEnabled = data.typing !== undefined ? data.typing : true;
                    updateAudioUI();
                }catch(e){
                    console.log('Error loading progress:', e);
                }
            }
        }
        
        function updateAudioUI() {
            const musicBtn = document.getElementById('toggleMusicBtn');
            const typingBtn = document.getElementById('toggleTypingSoundBtn');
            if (musicBtn) musicBtn.textContent = musicEnabled ? '🔊 ON' : '🔇 OFF';
            if (typingBtn) typingBtn.textContent = typingSoundEnabled ? '🔊 ON' : '🔇 OFF';
        }

        // ----- UNLIMITED STORY MODE -----
        function loadStoryChapter(chapterIndex) {
            const actualIndex = chapterIndex % storyLevels.length;
            const chapter = storyLevels[actualIndex];
            const displayNumber = chapterIndex + 1;
            
            const levelIndicator = document.getElementById('levelIndicator');
            if (levelIndicator) {
                levelIndicator.textContent = `Chapter ${displayNumber} · ${chapter.title}`;
            }
            
            const dialogueDiv = document.getElementById('storyDialogue');
            if (dialogueDiv) {
                dialogueDiv.textContent = '';
                typeText(chapter.dialogue, dialogueDiv);
            }
            
            const choicesDiv = document.getElementById('storyChoices');
            if (choicesDiv) {
                choicesDiv.innerHTML = '';
                
                chapter.choices.forEach((choiceText, idx) => {
                    const btn = document.createElement('button');
                    btn.textContent = choiceText;
                    btn.addEventListener('click', () => {
                        if(idx === 0) showPopup(`You chose "${choiceText}" — sweet memory ❤️`);
                        else showPopup(`"${choiceText}" — I feel the same way.`);
                        
                        if (dialogueDiv) dialogueDiv.textContent = chapter.romanticEnd + ' ❤️';
                        choicesDiv.innerHTML = '';
                        
                        const nextBtn = document.createElement('button');
                        nextBtn.textContent = '📖 Next Chapter ➡️';
                        nextBtn.addEventListener('click', ()=>{
                            currentStoryChapter++;
                            saveProgress();
                            loadStoryChapter(currentStoryChapter);
                            
                            if(currentStoryChapter % 5 === 0) {
                                showFinalMessage();
                            }
                        });
                        choicesDiv.appendChild(nextBtn);
                    });
                    choicesDiv.appendChild(btn);
                });
            }
        }

        function showFinalMessage() {
            const finalDiv = document.getElementById('finalMessageContainer');
            if (finalDiv) {
                finalDiv.innerHTML = `<div class="final-message">Chapter ${currentStoryChapter} complete!<br>My love for you keeps growing with every chapter ❤️</div>`;
                setTimeout(() => {
                    if (finalDiv) finalDiv.innerHTML = '';
                }, 5000);
            }
            showPopup("Every chapter with you is my favorite 📚❤️");
        }

        // ----- TYPING ANIMATION -----
        function typeText(text, element, speed=40) {
            if (!element) return;
            if(typingInterval) clearInterval(typingInterval);
            let i=0;
            element.textContent = '';
            typingInterval = setInterval(() => {
                if(i < text.length) {
                    element.textContent += text.charAt(i);
                    if(typingSoundEnabled) playTypingTick();
                    i++;
                } else { 
                    clearInterval(typingInterval); 
                }
            }, speed);
        }

        // ----- MINI GAME (Catch hearts) -----
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        let basketX = 200;
        const basketW = 80, basketH = 20;
        let hearts = [];
        let gameScoreSpan = document.getElementById('gameScore');

        function initMiniGame() {
            if (!canvas || !ctx) return;
            if(gameInterval) clearInterval(gameInterval);
            gameActive = true;
            score = 0;
            hearts = [];
            basketX = 200;
            updateScore();
            gameInterval = setInterval(updateGame, 40);
            canvas.addEventListener('mousemove', moveBasket);
            canvas.addEventListener('touchmove', touchMove, {passive: false});
        }
        
        function touchMove(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = canvas.width / rect.width;
            let x = (touch.clientX - rect.left) * scaleX;
            basketX = Math.min(canvas.width - basketW, Math.max(0, x - basketW/2));
        }
        
        function moveBasket(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            let x = (e.clientX - rect.left) * scaleX;
            basketX = Math.min(canvas.width - basketW, Math.max(0, x - basketW/2));
        }
        
        function stopMiniGame() {
            gameActive = false;
            if(gameInterval) clearInterval(gameInterval);
            if (canvas) {
                canvas.removeEventListener('mousemove', moveBasket);
                canvas.removeEventListener('touchmove', touchMove);
            }
        }
        
        function updateGame() {
            if(!gameActive || !ctx) return;
            if(Math.random()<0.08) {
                hearts.push({ 
                    x: Math.random()*(canvas.width-20), 
                    y: 0, 
                    size: 18+Math.floor(Math.random()*10), 
                    speed: 2+Math.floor(Math.random()*4) 
                });
            }
            hearts = hearts.filter(h => {
                h.y += h.speed;
                if(h.y + h.size >= canvas.height - basketH - 5 && h.y < canvas.height - 5) {
                    if(h.x + h.size > basketX && h.x < basketX + basketW) {
                        score++;
                        updateScore();
                        if(Math.random()<0.35) {
                            const randomMsg = specialMessages[Math.floor(Math.random()*specialMessages.length)];
                            showPopup(randomMsg);
                        }
                        playCollectSound();
                        return false;
                    }
                }
                return h.y < canvas.height + 20;
            });
            drawCanvas();
        }
        
        function drawCanvas() {
            if (!ctx) return;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = '#d44e7a';
            ctx.shadowColor = '#ffb6c1';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            roundRect(ctx, basketX, canvas.height-basketH-5, basketW, basketH, 12);
            ctx.fill();
            ctx.shadowBlur = 0;
            hearts.forEach(h => {
                ctx.font = `${h.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
                ctx.fillText('❤️', h.x, h.y);
            });
            ctx.font = 'bold 18px sans-serif';
            ctx.fillStyle = '#7a2e4a';
            ctx.fillText(`❤️ ${score}`, 10, 40);
        }
        
        function roundRect(ctx, x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            return ctx;
        }
        
        function updateScore(){ 
            if (gameScoreSpan) gameScoreSpan.textContent = score; 
        }

        // ----- UNLIMITED DAILY MESSAGE -----
        function generateDailyMessage() {
            const dailyDisplay = document.getElementById('dailyMessageDisplay');
            if (dailyDisplay) {
                const randomIndex = Math.floor(Math.random() * dailyLoveMessages.length);
                const message = dailyLoveMessages[randomIndex];
                dailyDisplay.innerText = `${message} ❤️`;
            }
        }

        // ----- MEMORY GALLERY -----
        function renderMemoryGallery() {
            const container = document.getElementById('videoReelContainer');
            if (!container) return;
            
            container.innerHTML = '';
            
            memories.forEach((mem) => {
                const card = document.createElement('div');
                card.className = 'video-card';
                
                if (mem.type === "video" && mem.videoId) {
                    const iframe = document.createElement('iframe');
                    iframe.width = "100%";
                    iframe.height = "100%";
                    iframe.src = `https://www.youtube.com/embed/${mem.videoId}?autoplay=0&mute=1&controls=1&loop=1&playlist=${mem.videoId}&modestbranding=1&rel=0&showinfo=0`;
                    iframe.title = mem.title;
                    iframe.frameBorder = "0";
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                    iframe.allowFullscreen = true;
                    iframe.style.aspectRatio = "9 / 16";
                    iframe.style.objectFit = "cover";
                    
                    card.appendChild(iframe);
                } else if (mem.type === "image" && mem.image) {
                    const img = document.createElement('img');
                    img.src = mem.image;
                    img.alt = mem.title;
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.aspectRatio = "9 / 16";
                    img.style.objectFit = "cover";
                    img.style.cursor = "pointer";
                    
                    img.addEventListener('click', () => {
                        if (img.requestFullscreen) {
                            img.requestFullscreen();
                        }
                    });
                    
                    card.appendChild(img);
                }
                
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                overlay.innerHTML = `
                    <div class="video-title">${mem.title}</div>
                    <div class="video-description">💬 ${mem.full}</div>
                `;
                card.appendChild(overlay);
                
                container.appendChild(card);
            });
            
            if (memories.length === 0) {
                container.innerHTML = '<p style="text-align: center; padding: 40px;">✨ Beautiful memories coming soon... ✨</p>';
            }
        }

        // ----- AUDIO -----
        function playTypingTick(){ 
            if(!typingSoundEnabled) return;
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const a = new AudioContext(); 
                if (a.state === 'suspended') {
                    a.resume();
                }
                const o = a.createOscillator(); 
                o.type='sine'; 
                o.frequency.value=800; 
                const g = a.createGain(); 
                g.gain.value=0.05; 
                o.connect(g); 
                g.connect(a.destination); 
                o.start(); 
                o.stop(a.currentTime+0.03); 
            } catch(e) {}
        }
        
        function playCollectSound(){ 
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const a = new AudioContext(); 
                if (a.state === 'suspended') {
                    a.resume();
                }
                const o = a.createOscillator(); 
                o.type='triangle'; 
                o.frequency.value=1200; 
                const g = a.createGain(); 
                g.gain.value=0.1; 
                o.connect(g); 
                g.connect(a.destination); 
                o.start(); 
                o.stop(a.currentTime+0.06); 
            } catch(e) {}
        }

        // ----- POPUP -----
        function showPopup(msg) {
            const pop = document.createElement('div'); 
            pop.className='popup-message'; 
            pop.textContent=msg;
            document.body.appendChild(pop); 
            setTimeout(()=> {
                if (pop && pop.parentNode) {
                    pop.remove();
                }
            }, 3000);
        }

        function updateNameEverywhere() {
            if (dynamicNameSpan) {
                dynamicNameSpan.textContent = `✨ ${girlfriendName} ✨`;
            }
            if (welcomeMsg) {
                welcomeMsg.textContent = `Welcome, ${girlfriendName} ❤️ This world was made just for you.`;
            }
        }

        // ----- EVENT LISTENERS -----
        const startBtn = document.getElementById('startStoryBtn');
        if (startBtn) startBtn.addEventListener('click', ()=>{ 
            currentStoryChapter = 0; 
            showScreen('story'); 
        });
        
        const miniGameBtn = document.getElementById('goMiniGameBtn');
        if (miniGameBtn) miniGameBtn.addEventListener('click', ()=>{ 
            showScreen('mini'); 
            initMiniGame(); 
        });
        
        const dailyBtn = document.getElementById('goDailyBtn');
        if (dailyBtn) dailyBtn.addEventListener('click', ()=>showScreen('daily'));
        
        const galleryBtn = document.getElementById('goGalleryBtn');
        if (galleryBtn) galleryBtn.addEventListener('click', ()=>showScreen('gallery'));
        
        const settingsBtn = document.getElementById('goSettingsBtn');
        if (settingsBtn) settingsBtn.addEventListener('click', ()=>showScreen('settings'));
        
        // Back buttons
        document.querySelectorAll('[id^="backFrom"]').forEach(b=>b.addEventListener('click', ()=>{ 
            stopMiniGame(); 
            showScreen('home'); 
        }));
        
        const refreshBtn = document.getElementById('refreshDailyBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', ()=>{
                generateDailyMessage();
                showPopup("Here's another message just for you! 💝");
            });
        }
        
        const missMeBtn = document.getElementById('missMeBtn');
        if (missMeBtn) {
            missMeBtn.addEventListener('click', ()=>{
                const messages = [
                    `I miss you every second, ${girlfriendName} ❤️`,
                    "Can't wait to see you again! 💕",
                    "You're always on my mind 🌙",
                    "Missing you like crazy right now 💔"
                ];
                showPopup(messages[Math.floor(Math.random() * messages.length)]);
            });
        }
        
        const whatsappBtn = document.getElementById('whatsappBtn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', ()=>{ 
                const message = `Hey! I just played your Love Quest game and I love it! ❤️ - ${girlfriendName}`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
            });
        }
        
        const musicBtn = document.getElementById('toggleMusicBtn');
        if (musicBtn) {
            musicBtn.addEventListener('click', ()=>{ 
                musicEnabled=!musicEnabled; 
                updateAudioUI(); 
                saveProgress(); 
            });
        }
        
        const typingBtn = document.getElementById('toggleTypingSoundBtn');
        if (typingBtn) {
            typingBtn.addEventListener('click', ()=>{ 
                typingSoundEnabled=!typingSoundEnabled; 
                updateAudioUI(); 
                saveProgress(); 
            });
        }
        
        const resetBtn = document.getElementById('resetProgressBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', ()=>{ 
                currentStoryChapter = 0; 
                saveProgress(); 
                showPopup('Story reset! Ready for another journey through our love ❤️'); 
            });
        }
        
        const restartBtn = document.getElementById('restartMiniGame');
        if (restartBtn) {
            restartBtn.addEventListener('click', ()=>{ 
                stopMiniGame(); 
                initMiniGame(); 
            });
        }
        
        loadProgress();
        updateAudioUI();

        // ----- OUR FUTURE PLANNER SYSTEM -----
        let futurePlans = [];
        let countdownIntervals = new Map();
        const STORAGE_KEY = 'loveQuest_futurePlans';

   async function loadFuturePlans() {
  const { data, error } = await supabase
    .from('future_plans')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  futurePlans = data || [];
  renderFuturePlans();
}

        // Format countdown time
        function formatCountdown(targetDate) {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;
            
            if (diff <= 0) {
                return { reached: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            return { reached: false, days, hours, minutes, seconds };
        }

        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Create a plan card element
        function createPlanCard(plan, index) {
            const card = document.createElement('div');
            card.className = 'plan-card';
            card.dataset.planId = plan.id;
            
            const header = document.createElement('div');
            header.className = 'plan-header';
            header.innerHTML = `
                <h3 class="plan-title">${escapeHtml(plan.title)}</h3>
                <span class="plan-author">${escapeHtml(plan.author)}</span>
            `;
            
            const desc = document.createElement('div');
            desc.className = 'plan-description';
            desc.textContent = plan.description || 'No description';
            
            const countdownDiv = document.createElement('div');
            countdownDiv.className = 'plan-countdown';
            countdownDiv.id = `countdown-${plan.id}`;
            
            const footer = document.createElement('div');
            footer.className = 'plan-footer';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'plan-delete-btn';
            deleteBtn.textContent = '🗑️ Remove';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePlan(plan.id);
            });
            footer.appendChild(deleteBtn);
            
            card.appendChild(header);
            card.appendChild(desc);
            card.appendChild(countdownDiv);
            card.appendChild(footer);
            
            startCountdown(plan.id, plan.date, countdownDiv);
            
            return card;
        }

        // Start countdown timer for a plan
        function startCountdown(planId, targetDate, element) {
            if (countdownIntervals.has(planId)) {
                clearInterval(countdownIntervals.get(planId));
            }
            
            const updateCountdown = () => {
                const timeData = formatCountdown(targetDate);
                
                if (timeData.reached) {
                    element.innerHTML = `
                        <div class="countdown-reached">
                            ✨ Today is the moment ❤️ ✨
                        </div>
                    `;
                    if (countdownIntervals.has(planId)) {
                        clearInterval(countdownIntervals.get(planId));
                        countdownIntervals.delete(planId);
                    }
                } else {

                    element.innerHTML = `
                        <div class="countdown-display">
                            <div class="countdown-unit">
                                <span class="countdown-number">${timeData.days}</span>
                                <span class="countdown-label">Days</span>
                            </div>
                            <div class="countdown-unit">
                                <span class="countdown-number">${String(timeData.hours).padStart(2, '0')}</span>
                                <span class="countdown-label">Hours</span>
                            </div>
                            <div class="countdown-unit">
                                <span class="countdown-number">${String(timeData.minutes).padStart(2, '0')}</span>
                                <span class="countdown-label">Mins</span>
                            </div>
                            <div class="countdown-unit">
                                <span class="countdown-number">${String(timeData.seconds).padStart(2, '0')}</span>
                                <span class="countdown-label">Secs</span>
                            </div>
                        </div>
                    `;
                }
            };
            
            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            countdownIntervals.set(planId, interval);
        }

        // Render all plans
        function renderFuturePlans() {
            const container = document.getElementById('futurePlansContainer');
            const emptyState = document.getElementById('emptyFutureState');
            
            if (!container) return;
            
            countdownIntervals.forEach((interval) => clearInterval(interval));
            countdownIntervals.clear();
            
            const children = Array.from(container.children);
            children.forEach(child => {
                if (child.id !== 'emptyFutureState') {
                    child.remove();
                }
            });
            
            if (futurePlans.length === 0) {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                futurePlans.sort((a, b) => new Date(a.date) - new Date(b.date));
                futurePlans.forEach((plan, index) => {
                    const card = createPlanCard(plan, index);
                    container.insertBefore(card, emptyState);
                });
            }
        }

        // Add a new plan
     async function addFuturePlan(title, description, date, author) {
  const { error } = await supabase
    .from('future_plans')
    .insert([{ title, description, date, author }]);

  if (error) {
    console.log(error);
    alert('Save failed');
  } else {
    alert('Saved online ❤️');
    loadFuturePlans();
  }
}

        // Delete a plan
        function deletePlan(planId) {
            const plan = futurePlans.find(p => p.id === planId);
            if (!plan) return;
            
            if (countdownIntervals.has(planId)) {
                clearInterval(countdownIntervals.get(planId));
                countdownIntervals.delete(planId);
            }
            
            futurePlans = futurePlans.filter(p => p.id !== planId);
            saveFuturePlans();
            renderFuturePlans();
            showPopup(`Plan removed`);
        }

        // Initialize Future Planner
        function initFuturePlanner() {
            loadFuturePlans();
            
            const dateInput = document.getElementById('planDate');
            if (dateInput) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                dateInput.min = minDateTime;
                dateInput.value = minDateTime;
            }
            
            const authorBtns = document.querySelectorAll('.author-btn');
            let selectedAuthor = 'Me ❤️';
            
            authorBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    authorBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    selectedAuthor = this.dataset.author;
                });
            });
            
            const addBtn = document.getElementById('addPlanBtn');
            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    const titleInput = document.getElementById('planTitle');
                    const descInput = document.getElementById('planDescription');
                    const dateInput = document.getElementById('planDate');
                    
                    const title = titleInput.value.trim();
                    const description = descInput.value.trim();
                    const date = dateInput.value;
                    
                    if (!title) {
                        showPopup('Please add a title for your plan 💭');
                        titleInput.focus();
                        return;
                    }
                    
                    if (!date) {
                        showPopup('When are we planning this? 📅');
                        dateInput.focus();
                        return;
                    }
                    
                    addFuturePlan(title, description, date, selectedAuthor);
                    
                    titleInput.value = '';
                    descInput.value = '';
                    
                    const now = new Date();
                    now.setHours(now.getHours() + 1);
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                    
                    titleInput.focus();
                });
            }
            
            renderFuturePlans();
        }

        // Navigation for Future Screen
        const goFutureBtn = document.getElementById('goFutureBtn');
        if (goFutureBtn) {
            goFutureBtn.addEventListener('click', () => showScreen('future'));
        }
        
        // Navigation for Quiz Screen
        const goQuizBtn = document.getElementById('goQuizBtn');
        if (goQuizBtn) {
            goQuizBtn.addEventListener('click', () => showScreen('quiz'));
        }

        const backFromFuture = document.getElementById('backFromFuture');
        if (backFromFuture) {
            backFromFuture.addEventListener('click', () => showScreen('home'));
        }

        initFuturePlanner();

        setTimeout(()=>{ 
            if(currentScreen === 'home') {
                showPopup(`Hey ${girlfriendName}… I just wanted to remind you I love you ❤️`); 
            }
        }, 1500);
}
// ========== LOVE QUIZ SYSTEM (SINGLE PLAYER) ==========
let quizQuestions = [];
let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let categoryScores = { love: 0, trust: 0, loyalty: 0, future: 0, fun: 0 };
let quizHistory = [];

// ========== QUESTION POOL ==========
// ========== QUESTION POOL ==========
function initializeQuestionPool() {
    quizQuestions = [
        // Deep Love Questions
        { text: "Would you sacrifice your lifelong dream career if it meant saving the relationship?", category: "love" },
        { text: "If they lost all their memories of you tomorrow, would you stay and make them fall in love with you again from scratch?", category: "love" },
        { text: "Would you donate a kidney to save their life, knowing it might affect your own health permanently?", category: "love" },
        { text: "If they had to move to another country permanently for their family, would you leave everything behind to follow them?", category: "love" },
        { text: "Would you take a bullet for them without hesitation?", category: "love" },
        { text: "If they became severely disabled and required 24/7 care, would you commit to being their caregiver for life?", category: "love" },
        { text: "Would you give up your chance to have biological children if they couldn't have any?", category: "love" },
        { text: "If your family disowned you for being with them, would you still choose this relationship?", category: "love" },
        { text: "Would you sell everything you own to help them through a financial crisis?", category: "love" },
        { text: "If they confessed they'd committed a serious crime years ago, would you still stand by them?", category: "love" },
        { text: "Would you rather live a short life filled with their love, or a long life without ever meeting them?", category: "love" },
        { text: "If they developed a condition that changed their personality completely, would you still love who they become?", category: "love" },
        { text: "Would you forgive them if they emotionally hurt you deeply but showed genuine remorse?", category: "love" },
        { text: "Could you love them the same way if they gained 100kg and looked completely different?", category: "love" },
        { text: "If they needed you to quit social media and all outside friendships for the relationship to work, would you?", category: "love" },
        
        // Deep Trust Questions
        { text: "Would you give them complete access to all your bank accounts and financial information?", category: "trust" },
        { text: "If they asked to read every message on your phone right now, would you hand it over unlocked without deleting anything?", category: "trust" },
        { text: "Would you trust them alone on a week-long trip with an attractive friend of the opposite gender?", category: "trust" },
        { text: "If they told you a secret that could destroy their reputation, would you take it to your grave?", category: "trust" },
        { text: "Would you co-sign a large loan for them knowing you'd be legally responsible if they defaulted?", category: "trust" },
        { text: "If they were accused of something terrible but claimed innocence, would you believe them over all evidence?", category: "trust" },
        { text: "Would you let them make all major life decisions for both of you for one year?", category: "trust" },
        { text: "If they asked you to cut off a close friend they felt threatened by, would you do it?", category: "trust" },
        { text: "Would you share your deepest shame and trauma that you've never told anyone else?", category: "trust" },
        { text: "If they had to work late nights regularly with an attractive colleague, would you feel completely secure?", category: "trust" },
        { text: "Would you trust them to raise your children with values you might not fully agree with?", category: "trust" },
        { text: "If they made a decision that lost all your savings, would you still trust them with finances in the future?", category: "trust" },
        
        // Deep Loyalty Questions
        { text: "If everyone you know advised you to leave them, would you stay anyway?", category: "loyalty" },
        { text: "Would you defend them publicly even if they did something morally questionable?", category: "loyalty" },
        { text: "If they got canceled on social media for past mistakes, would you risk your own reputation defending them?", category: "loyalty" },
        { text: "Would you stay with them through a 5-year prison sentence?", category: "loyalty" },
        { text: "If they relapsed into addiction after years of sobriety, would you stay and help them recover again?", category: "loyalty" },
        { text: "Would you cut ties with your best friend if they constantly disrespected your partner?", category: "loyalty" },
        { text: "If your partner got into a physical fight defending you, would you lie to police to protect them?", category: "loyalty" },
        { text: "Would you stay faithful even if your marriage had been sexless for over 5 years?", category: "loyalty" },
        { text: "If they developed severe mental health issues that made them difficult to be around, would you stay committed?", category: "loyalty" },
        { text: "Would you give up your favorite hobby forever if it made them uncomfortable?", category: "loyalty" },
        { text: "If they asked you to move to a remote area with no friends or family nearby, would you go?", category: "loyalty" },
        { text: "Would you choose them over seeing your parents for major holidays every year?", category: "loyalty" },
        
        // Deep Marriage/Future Questions
        { text: "Would you sign a prenup that heavily favors them because they asked you to?", category: "future" },
        { text: "If you discovered after marriage that you wanted completely different lifestyles, would you compromise yours entirely?", category: "future" },
        { text: "Would you be willing to live with and care for their aging parents in your home for 20+ years?", category: "future" },
        { text: "If they wanted 5 children and you wanted 1, would you agree to have 5?", category: "future" },
        { text: "Would you give up your religion or convert to theirs if it was necessary for marriage?", category: "future" },
        { text: "If they wanted to raise children with strict traditional gender roles you disagree with, would you accept it?", category: "future" },
        { text: "Would you stay in an unhappy marriage for decades 'for the children'?", category: "future" },
        { text: "If they wanted an open marriage, would you consider it to keep them happy?", category: "future" },
        { text: "Would you give up your dream of home ownership to live a nomadic life they prefer?", category: "future" },
        { text: "If they wanted to adopt a child with special needs, would you commit to that lifetime responsibility?", category: "future" },
        { text: "Would you move to a country where you don't speak the language for their career opportunity?", category: "future" },
        { text: "If they became famous and wanted you to stay out of the spotlight entirely, would you accept being invisible?", category: "future" },
        { text: "Would you agree to never retire because they want to keep working forever?", category: "future" },
        { text: "If they wanted a marriage where you're the sole breadwinner and they don't work, would you accept that?", category: "future" },
        { text: "Would you be okay if they wanted separate bedrooms permanently after marriage?", category: "future" }
    ];
}

// Load quiz history from localStorage
function loadQuizHistory() {
    const saved = localStorage.getItem('loveQuest_quizHistory');
    if (saved) {
        try {
            quizHistory = JSON.parse(saved);
        } catch(e) {
            quizHistory = [];
        }
    }
}

// Save quiz history to localStorage
function saveQuizHistory() {
    localStorage.setItem('loveQuest_quizHistory', JSON.stringify(quizHistory));
}

// Select 15 random questions
function selectRandomQuestions(count = 15) {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Reset quiz state
function resetQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    categoryScores = { love: 0, trust: 0, loyalty: 0, future: 0, fun: 0 };
    currentQuizQuestions = selectRandomQuestions(15);
}

// Update category scores
function updateCategoryScore(category, points) {
    if (categoryScores.hasOwnProperty(category)) {
        categoryScores[category] += points;
    }
}

// Display current question
function displayQuestion() {
    const questionText = document.getElementById('quizQuestion');
    const questionCounter = document.getElementById('questionCounter');
    const quizScoreDisplay = document.getElementById('quizScoreDisplay');
    const categoryBadge = document.getElementById('questionCategory');
    
    if (currentQuestionIndex < currentQuizQuestions.length) {
        const q = currentQuizQuestions[currentQuestionIndex];
        questionText.textContent = q.text;
        questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;
        quizScoreDisplay.textContent = `Score: ${quizScore}`;
        categoryBadge.textContent = q.category.toUpperCase() + ' 💭';
    }
}

// Handle answer selection
function handleAnswer(answer) {
    const points = answer === 'yes' ? 2 : (answer === 'maybe' ? 1 : 0);
    const currentQ = currentQuizQuestions[currentQuestionIndex];
    
    // Update scores
    quizScore += points;
    updateCategoryScore(currentQ.category, points);
    
    // Move to next question or show result
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuizQuestions.length) {
        displayQuestion();
    } else {
        showQuizResult();
    }
}

// Get result based on score
function getResultFromScore(score, maxScore = 30) {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 80) {
        return {
            title: "💍 True Love · Marriage Ready",
            message: `Your love is deep, pure, and built to last. The connection you share is rare and beautiful. You're ready for forever together.`,
            emoji: "💑💍✨"
        };
    } else if (percentage >= 60) {
        return {
            title: "🌹 Strong & Growing Connection",
            message: `You have a beautiful foundation of love and trust. Keep nurturing what you have—it's something special.`,
            emoji: "🌱💕🌟"
        };
    } else if (percentage >= 40) {
        return {
            title: "🌸 Promising Potential",
            message: `There's genuine affection here. With more communication and time, this could bloom into something amazing.`,
            emoji: "🌷🤝💫"
        };
    } else {
        return {
            title: "🌱 Room to Grow Together",
            message: `Every great love story takes time to write. Be patient, communicate openly, and let your connection deepen naturally.`,
            emoji: "🌿💭❤️"
        };
    }
}

// Show quiz result
function showQuizResult() {
    document.getElementById('quizActive').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    
    const maxScore = currentQuizQuestions.length * 2;
    const result = getResultFromScore(quizScore, maxScore);
    
    document.getElementById('resultEmoji').textContent = result.emoji;
    document.getElementById('resultTitle').textContent = result.title;
    document.getElementById('resultMessage').textContent = result.message;
    document.getElementById('resultScore').innerHTML = 
        `Score: ${quizScore}/${maxScore} (${Math.round((quizScore/maxScore)*100)}%)`;
    
    // Show category analysis
    displayCategoryAnalysis();
    
    // Save to history
    saveQuizResultToHistory(quizScore, maxScore, result);
}

// Display category analysis
function displayCategoryAnalysis() {
    const analysisDiv = document.getElementById('categoryAnalysis');
    const categories = [
        { key: 'love', name: 'Deep Love ❤️', max: 30 },
        { key: 'trust', name: 'Ultimate Trust 🤝', max: 24 },
        { key: 'loyalty', name: 'Unwavering Loyalty 🛡️', max: 24 },
        { key: 'future', name: 'Lifetime Commitment 💍', max: 30 }
    ];
    
    let html = '';
    categories.forEach(cat => {
        const score = categoryScores[cat.key] || 0;
        const percentage = (score / cat.max) * 100;
        const level = percentage >= 70 ? 'Strong' : (percentage >= 40 ? 'Good' : 'Growing');
        
        html += `
            <div class="category-item">
                <div class="category-name">${cat.name}</div>
                <div class="category-score-bar">
                    <div class="category-score-fill" style="width: ${percentage}%"></div>
                </div>
                <div style="font-size: 0.85rem;">${level} (${score}/${cat.max})</div>
            </div>
        `;
    });
    
    analysisDiv.innerHTML = html;
}

// Save result to history
function saveQuizResultToHistory(score, maxScore, result) {
    const entry = {
        date: new Date().toISOString(),
        score: score,
        maxScore: maxScore,
        percentage: Math.round((score/maxScore)*100),
        result: result.title,
        categoryScores: {...categoryScores}
    };
    
    quizHistory.unshift(entry);
    if (quizHistory.length > 20) quizHistory.pop();
    saveQuizHistory();
}

// Share on WhatsApp - FIXED VERSION
function shareOnWhatsApp() {
    const score = quizScore;
    const maxScore = currentQuizQuestions.length * 2;
    const result = getResultFromScore(score, maxScore);
    const percentage = Math.round((score/maxScore)*100);
    
    // Create the message
    const message = `💕 Love Quiz Result 💕%0A%0A` +
                   `Result: ${result.title}%0A` +
                   `Score: ${score}/${maxScore} (${percentage}%)%0A%0A` +
                   `${result.message}%0A%0A` +
                   `Take the quiz yourself at:%0A` +
                   `https://djidro.github.io/Tasnim/%0A%0A` +
                   `Made with love ❤️`;
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/96878440900?text=${message}`, '_blank');
}

// Display history timeline
function displayHistoryTimeline() {
    const timelineDiv = document.getElementById('historyTimeline');
    
    if (quizHistory.length === 0) {
        timelineDiv.innerHTML = '<p style="text-align: center; padding: 20px;">No quiz history yet. Take your first quiz! 💕</p>';
        return;
    }
    
    let html = '';
    quizHistory.forEach((entry) => {
        const date = new Date(entry.date);
        const dateStr = `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
        
        html += `
            <div class="history-entry">
                <div class="history-date">📅 ${dateStr}</div>
                <div class="history-result">${entry.result}</div>
                <div class="history-score">Score: ${entry.score}/${entry.maxScore} (${entry.percentage}%)</div>
            </div>
        `;
    });
    
    timelineDiv.innerHTML = html;
}

// Update history preview on intro screen
function updateHistoryPreview() {
    const previewDiv = document.getElementById('quizHistoryPreview');
    if (!previewDiv) return;
    
    if (quizHistory.length === 0) {
        previewDiv.innerHTML = '<p style="text-align: center; opacity: 0.7; margin-top: 20px;">✨ Take your first quiz to see your love story unfold ✨</p>';
    } else {
        const latest = quizHistory[0];
        previewDiv.innerHTML = `
            <h4 style="margin: 20px 0 10px;">📜 Latest Result</h4>
            <div class="history-entry">
                <div class="history-result">${latest.result}</div>
                <div class="history-score">Score: ${latest.score}/${latest.maxScore} (${latest.percentage}%)</div>
            </div>
        `;
    }
}

// Initialize Quiz UI
function initQuizUI() {
    initializeQuestionPool();
    loadQuizHistory();
    
    // Get DOM elements
    const quizIntro = document.getElementById('quizIntro');
    const quizActive = document.getElementById('quizActive');
    const quizResult = document.getElementById('quizResult');
    const quizHistoryView = document.getElementById('quizHistoryView');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const cancelQuizBtn = document.getElementById('cancelQuizBtn');
    const shareBtn = document.getElementById('shareWhatsAppBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    const backFromHistory = document.getElementById('backFromHistory');
    
    // Start quiz
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', () => {
            resetQuiz();
            quizIntro.style.display = 'none';
            quizActive.style.display = 'block';
            quizResult.style.display = 'none';
            displayQuestion();
        });
    }
    
    // Answer buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const answer = e.target.dataset.answer;
            handleAnswer(answer);
        });
    });
    
    // Cancel quiz
    if (cancelQuizBtn) {
        cancelQuizBtn.addEventListener('click', () => {
            quizActive.style.display = 'none';
            quizIntro.style.display = 'block';
        });
    }
    
    // Share button - NOW IT WILL WORK!
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            shareOnWhatsApp();
        });
    }
    
    // Play again
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            resetQuiz();
            quizResult.style.display = 'none';
            quizActive.style.display = 'block';
            displayQuestion();
        });
    }
    
    // View history
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            quizResult.style.display = 'none';
            quizHistoryView.style.display = 'block';
            displayHistoryTimeline();
        });
    }
    
    // Back from history
    if (backFromHistory) {
        backFromHistory.addEventListener('click', () => {
            quizHistoryView.style.display = 'none';
            quizIntro.style.display = 'block';
            updateHistoryPreview();
        });
    }
    
    // Show history preview
    updateHistoryPreview();
}
    // Particle canvas (always runs)
    const pCanvas = document.getElementById('heart-particle-canvas');
    if (pCanvas) {
        const pCtx = pCanvas.getContext('2d');
        function resizeCanvas(){ 
            pCanvas.width = window.innerWidth; 
            pCanvas.height = window.innerHeight; 
        }
        window.addEventListener('resize', resizeCanvas); 
        resizeCanvas();
        
        let particles = [];
        for(let i=0;i<25;i++) {
            particles.push({ 
                x: Math.random()*pCanvas.width, 
                y: Math.random()*pCanvas.height, 
                size: 12+Math.random()*20, 
                speed: 0.2+Math.random()*0.6 
            });
        }
        
        function drawParticles(){
            pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
            pCtx.font='20px "Segoe UI Emoji"'; 
            pCtx.fillStyle='rgba(255,200,220,0.5)';
            particles.forEach(p=>{ 
                p.y -= p.speed; 
                if(p.y < -30){ 
                    p.y = pCanvas.height + 20; 
                    p.x = Math.random()*pCanvas.width; 
                } 
                pCtx.fillText('❤️', p.x, p.y); 
            });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    // ----- FLOATING RINGS (Performance Optimized) -----
    (function createFloatingRings() {
        const loginOverlay = document.getElementById('loginOverlay');
        if (!loginOverlay) return;
        
        if (document.querySelector('.rings-container')) return;
        
        const ringsContainer = document.createElement('div');
        ringsContainer.className = 'rings-container';
        loginOverlay.appendChild(ringsContainer);
        
        const fragment = document.createDocumentFragment();
        
        for (let i = 1; i <= 8; i++) {
            const ring = document.createElement('div');
            ring.className = `ring ring-${i}`;
            fragment.appendChild(ring);
        }
        
        ringsContainer.appendChild(fragment);
        
        const handleVisibilityChange = () => {
            const rings = document.querySelectorAll('.ring');
            if (document.hidden) {
                rings.forEach(ring => {
                    ring.style.animationPlayState = 'paused';
                });
            } else {
                rings.forEach(ring => {
                    ring.style.animationPlayState = 'running';
                });
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (loginOverlay.classList.contains('hidden')) {
                        const rings = document.querySelectorAll('.ring');
                        rings.forEach(ring => {
                            ring.style.transition = 'opacity 0.5s ease';
                            ring.style.opacity = '0';
                        });
                        
                        setTimeout(() => {
                            const container = document.querySelector('.rings-container');
                            if (container) {
                                container.remove();
                                document.removeEventListener('visibilitychange', handleVisibilityChange);
                                observer.disconnect();
                            }
                        }, 500);
                    }
                }
            });
        });
        
        observer.observe(loginOverlay, { attributes: true });
        
        setTimeout(() => {
            const rings = document.querySelectorAll('.ring');
            rings.forEach((ring, index) => {
                ring.style.transition = 'opacity 0.8s ease';
                ring.style.opacity = '1';
            });
        }, 100);
    })();

})();
