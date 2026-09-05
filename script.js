/**
 * Sacred Temple Ganpati Invitation - Interactive Application Logic
 * Exact Clone of https://sacredtemple.vercel.app/
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Audio Management (Volume Fade In/Out)
  // ==========================================
  const bgAudio = document.getElementById('bgAudio');
  const musicToggle = document.getElementById('musicToggle');
  const musicToggleIcon = document.getElementById('musicToggleIcon');
  
  const TARGET_VOLUME = 0.45;
  const FADE_DURATION = 800; // ms
  const FADE_STEPS = 20;
  const STEP_INTERVAL = FADE_DURATION / FADE_STEPS;
  let fadeInterval = null;
  let isPlaying = false;

  // SVG Icons for Playing and Muted
  const ICON_PLAYING = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z"></path>
    </svg>
  `;
  const ICON_MUTED = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M4.27 3 3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73zM14 7h4V3h-6v5.18l2 2z"></path>
    </svg>
  `;

  function clearFade() {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }

  function fadeInAudio() {
    clearFade();
    let currentVol = bgAudio.volume;
    const volStep = (TARGET_VOLUME - currentVol) / FADE_STEPS;
    
    fadeInterval = setInterval(() => {
      currentVol = Math.min(currentVol + volStep, TARGET_VOLUME);
      bgAudio.volume = Math.max(0, currentVol);
      if (currentVol >= TARGET_VOLUME) {
        clearFade();
      }
    }, STEP_INTERVAL);
  }

  function fadeOutAudio() {
    clearFade();
    let currentVol = bgAudio.volume;
    const volStep = currentVol / FADE_STEPS;

    fadeInterval = setInterval(() => {
      currentVol = Math.max(currentVol - volStep, 0);
      bgAudio.volume = currentVol;
      if (currentVol <= 0) {
        clearFade();
        bgAudio.pause();
      }
    }, STEP_INTERVAL);
  }

  function startMusic() {
    bgAudio.volume = 0;
    bgAudio.play().then(() => {
      isPlaying = true;
      musicToggle.classList.add('music-toggle--on');
      musicToggle.setAttribute('aria-pressed', 'true');
      musicToggleIcon.innerHTML = ICON_PLAYING;
      fadeInAudio();
    }).catch(err => {
      console.log('Autoplay prevented, awaiting user gesture:', err);
    });
  }

  function toggleMusic() {
    if (isPlaying) {
      isPlaying = false;
      musicToggle.classList.remove('music-toggle--on');
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggleIcon.innerHTML = ICON_MUTED;
      fadeOutAudio();
    } else {
      bgAudio.volume = 0;
      bgAudio.play().then(() => {
        isPlaying = true;
        musicToggle.classList.add('music-toggle--on');
        musicToggle.setAttribute('aria-pressed', 'true');
        musicToggleIcon.innerHTML = ICON_PLAYING;
        fadeInAudio();
      }).catch(err => console.log('Audio error:', err));
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  // ==========================================
  // 2. Web Audio Bell Chime Synthesis
  // ==========================================
  let audioCtx = null;
  function playTempleBell() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const now = audioCtx.currentTime;
      // Synthesize rich temple bell harmonic strike
      const freqs = [587.33, 1174.66, 1760.0, 2349.32]; // D5 harmonic spectrum
      const gains = [0.3, 0.15, 0.08, 0.04];
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.4, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      masterGain.connect(audioCtx.destination);

      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 4 - 2), now);
        g.gain.setValueAtTime(gains[idx], now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + (2.5 - idx * 0.4));
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 3.0);
      });
    } catch(e) {}
  }

  const bellLeft = document.getElementById('heroBellLeft');
  const bellRight = document.getElementById('heroBellRight');
  [bellLeft, bellRight].forEach(bell => {
    if (bell) {
      bell.style.cursor = 'pointer';
      bell.addEventListener('click', () => {
        bell.style.animation = 'none';
        void bell.offsetWidth; // trigger reflow
        bell.style.animation = 'bellSwing 1.8s ease-in-out infinite';
        playTempleBell();
      });
    }
  });

  // ==========================================
  // 3. Curtain Opening Animation
  // ==========================================
  const curtainContainer = document.getElementById('curtainContainer');
  const curtainSealBtn = document.getElementById('curtainSealBtn');
  const curtainCenter = document.getElementById('curtainCenter');
  const curtainPanelLeft = document.getElementById('curtainPanelLeft');
  const curtainPanelRight = document.getElementById('curtainPanelRight');
  const heroSection = document.getElementById('heroSection');

  // Prevent scroll while curtain is present
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  let isCurtainOpened = false;

  function openCurtain() {
    if (isCurtainOpened) return;
    isCurtainOpened = true;

    // Start background music
    startMusic();

    // Fade out seal button
    curtainCenter.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-in';
    curtainCenter.style.opacity = '0';
    curtainCenter.style.transform = 'translate(-50%, -50%) scale(0.85)';

    // Slide panels open
    setTimeout(() => {
      curtainPanelLeft.style.transition = 'transform 1.5s cubic-bezier(0.76, 0, 0.24, 1)';
      curtainPanelRight.style.transition = 'transform 1.5s cubic-bezier(0.76, 0, 0.24, 1)';
      curtainPanelLeft.style.transform = 'translateX(-100%)';
      curtainPanelRight.style.transform = 'translateX(100%)';
    }, 200);

    // Trigger hero entrance animations
    setTimeout(() => {
      const animElements = heroSection.querySelectorAll(
        '.hero-anim-toplayer, .hero-anim-pillar-left, .hero-anim-pillar-right, .hero-anim-bell, .hero-anim-text-1, .hero-anim-text-2, .hero-anim-text-3, .hero-anim-text-4, .hero-anim-murti, .hero-anim-text-5'
      );
      animElements.forEach(el => el.classList.add('hero-animate'));
    }, 1100);

    // Unlock scroll and remove curtain overlay
    setTimeout(() => {
      curtainContainer.style.display = 'none';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }, 2500);
  }

  if (curtainSealBtn) {
    curtainSealBtn.addEventListener('click', openCurtain);
    curtainSealBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      openCurtain();
    });
  }

  if (curtainCenter) {
    curtainCenter.addEventListener('click', openCurtain);
  }

  // ==========================================
  // 4. Scroll Down Indicator Interaction
  // ==========================================
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const familySection = document.getElementById('familySection');
      if (familySection) {
        familySection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
      }
    });

    scrollIndicator.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollIndicator.click();
      }
    });

    // Auto-fade indicator when user starts scrolling down
    window.addEventListener('scroll', () => {
      if (window.scrollY > 120) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    }, { passive: true });
  }




  // ==========================================
  // 6. Sacred Dust Particles & Flower Shower Engine
  // ==========================================
  const sacredDustContainer = document.getElementById('sacredDust');
  const ashirwadStage = document.getElementById('ashirwadStage');
  const ashirwadSection = document.getElementById('ashirwadSection');
  const murtiMain = document.getElementById('murtiMain');
  const flowerBtn = document.getElementById('flowerBtn');

  // Pseudo-random helper matching react implementation
  function pseudoRandom(a, b) {
    const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  // Generate 14 floating dust particles
  if (sacredDustContainer) {
    const dustCount = 14;
    const minDuration = 6;
    const durationRange = 5;
    const delayRange = 6;

    for (let i = 0; i < dustCount; i++) {
      const span = document.createElement('span');
      const delay = `${pseudoRandom(i, 1) * delayRange}s`;
      const duration = `${minDuration + pseudoRandom(i, 2) * durationRange}s`;
      const left = `${pseudoRandom(i, 3) * 100}%`;
      const top = `${pseudoRandom(i, 4) * 100}%`;

      span.style.animationDelay = delay;
      span.style.animationDuration = duration;
      span.style.left = left;
      span.style.top = top;
      sacredDustContainer.appendChild(span);
    }
  }

  // Flower Shower Physics Engine
  const petalImages = [
    'assets/f1-ADhmizYT.webp',
    'assets/flower1-BlVhglJb.webp',
    'assets/flower2-579OHsCI.webp',
    'assets/flower3-DVMPDr3s.webp'
  ];

  function createPetal() {
    if (!ashirwadSection) return;
    const petal = document.createElement('div');
    petal.classList.add('petal');
    
    // Pick random petal graphic
    const randomImg = petalImages[Math.floor(Math.random() * petalImages.length)];
    petal.style.backgroundImage = `url("${randomImg}")`;

    const side = Math.random() > 0.5 ? 'left' : 'right';
    const dir = side === 'left' ? 1 : -1;
    const stageHeight = ashirwadSection.offsetHeight;
    const startX = side === 'left' ? -50 : window.innerWidth + 50;
    const startY = stageHeight * 0.4 + Math.random() * (stageHeight * 0.2);

    petal.style.left = `${startX}px`;
    petal.style.top = `${startY}px`;

    const size = 18 + Math.random() * 22;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;

    ashirwadSection.appendChild(petal);

    const targetPercent = 30 + Math.random() * 40;
    const targetX = (window.innerWidth * targetPercent) / 100 - startX;
    const targetY = stageHeight - startY + 50;
    const totalRotation = 360 + Math.random() * 720;
    const duration = 2500 + Math.random() * 1500;
    const apexRatio = 0.2 + Math.random() * 0.15;
    const a = targetY / (1 - 2 * apexRatio);
    const bCoeff = -2 * a * apexRatio;
    const steps = 30;
    const scaleFactor = 0.2 + Math.random() * 0.4;
    const keyframes = [];

    for (let p = 0; p <= steps; p++) {
      const t = p / steps;
      const x = targetX * t;
      const y = a * t * t + bCoeff * t;
      const rot = totalRotation * t;
      const scale = 0.5 + Math.sin(t * Math.PI) * scaleFactor;
      let opacity = 1;
      if (t < 0.08) opacity = t * 12.5;
      if (t > 0.4) opacity = 1 - (t - 0.4) / 0.6;

      keyframes.push({
        offset: t,
        opacity: Math.max(0, opacity),
        transform: `translate(${x}px, ${y}px) rotate(${dir * rot}deg) scale(${scale})`
      });
    }

    const animation = petal.animate(keyframes, {
      duration: duration,
      easing: 'linear',
      fill: 'forwards'
    });

    animation.onfinish = () => {
      petal.remove();
    };
  }

  function showerFlowers() {
    if (murtiMain) {
      murtiMain.classList.add('active');
      setTimeout(() => {
        murtiMain.classList.remove('active');
      }, 700);
    }

    const count = 18;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        createPetal();
      }, i * 40);
    }
  }

  if (flowerBtn) {
    flowerBtn.addEventListener('click', showerFlowers);
  }

  if (murtiMain) {
    murtiMain.style.cursor = 'pointer';
    murtiMain.addEventListener('click', showerFlowers);
  }

  // ==========================================
  // 7. Scroll Reveal Animation Engine
  // ==========================================
  const scrollRevealSections = document.querySelectorAll('.scroll-reveal');
  
  scrollRevealSections.forEach(section => {
    const children = section.querySelectorAll(':scope > .scroll-reveal-child');
    children.forEach((child, index) => {
      child.style.setProperty('--reveal-index', index);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.setAttribute('data-revealed', 'true');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  scrollRevealSections.forEach(section => {
    observer.observe(section);
  });

  // ==========================================
  // 8. Dynamic Personalized Guest Greeting
  // ==========================================
  const personalizedBanner = document.getElementById('personalizedGuestBanner');
  const guestNameDisplay = document.getElementById('guestNameDisplay');
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('guest') || urlParams.get('name') || urlParams.get('to');

  if (guestParam && guestParam.trim()) {
    const cleanGuest = decodeURIComponent(guestParam.trim());
    if (guestNameDisplay && personalizedBanner) {
      guestNameDisplay.textContent = cleanGuest;
      personalizedBanner.style.display = 'block';
    }
  }

  // ==========================================
  // 9. Live Countdown Timer Engine (२७ ऑगस्ट २०२६, १०:०० AM)
  // ==========================================
  const targetEventDate = new Date('2026-08-27T10:00:00+05:30').getTime();
  const elDays = document.getElementById('countdownDays');
  const elHours = document.getElementById('countdownHours');
  const elMinutes = document.getElementById('countdownMinutes');
  const elSeconds = document.getElementById('countdownSeconds');

  // Convert numbers to Marathi Devanagari numerals
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  function toMarathiNumber(num) {
    const str = String(num).padStart(2, '0');
    return str.split('').map(d => marathiDigits[parseInt(d, 10)] || d).join('');
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetEventDate - now;

    if (diff <= 0) {
      if (elDays) elDays.textContent = '००';
      if (elHours) elHours.textContent = '००';
      if (elMinutes) elMinutes.textContent = '००';
      if (elSeconds) elSeconds.textContent = '००';
      const titleEl = document.querySelector('.countdown-title');
      if (titleEl) titleEl.textContent = '॥ बाप्पाचे आगमन झाले आहे ! ॥';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (elDays) elDays.textContent = toMarathiNumber(days);
    if (elHours) elHours.textContent = toMarathiNumber(hours);
    if (elMinutes) elMinutes.textContent = toMarathiNumber(minutes);
    if (elSeconds) elSeconds.textContent = toMarathiNumber(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================
  // 10. Add to Google Calendar Integration
  // ==========================================
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', () => {
      const eventTitle = encodeURIComponent('बाप्पाचे आगमन - श्री साई गणेश मंडळ, नायगाव बाजार');
      const eventDesc = encodeURIComponent('श्री साई गणेश मंडळ, स्वामी रामानंद तीर्थ चौक, जुना मोंढा, नायगाव बाजार यांच्या गणेशोत्सवास आपण सपरिवार उपस्थित राहावे ही नम्र विनंती.\n\nस्थान: स्वामी रामानंद तीर्थ चौक, जुना मोंढा, नायगाव बाजार - ४३१७०९\nवेबसाइट: ' + window.location.href);
      const eventLocation = encodeURIComponent('Swami Ramanand Teerth Chowk, Juna Mondha, Naigaon Bazar - 431709');
      const eventDates = '20260827T043000Z/20260902T163000Z'; // UTC timings

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${eventDates}&details=${eventDesc}&location=${eventLocation}`;
      window.open(gcalUrl, '_blank');
    });
  }

  // ==========================================
  // 11. WhatsApp Personalized Invite Modal & Generator
  // ==========================================
  const inviteGeneratorModal = document.getElementById('inviteGeneratorModal');
  const openInviteGeneratorBtn = document.getElementById('openInviteGeneratorBtn');
  const closeInviteModalBtn = document.getElementById('closeInviteModalBtn');
  const guestNameInput = document.getElementById('guestNameInput');
  const invitePreviewText = document.getElementById('invitePreviewText');
  const sendWhatsappInviteBtn = document.getElementById('sendWhatsappInviteBtn');

  function updateInvitePreview() {
    const rawName = (guestNameInput && guestNameInput.value.trim()) || 'पाहुणे';
    if (invitePreviewText) {
      invitePreviewText.innerHTML = `
        ॥ श्री गणेशाय नमः ॥<br/>
        <strong>सस्नेह निमंत्रण !</strong><br/>
        आदरणीय <strong>${rawName}</strong>,<br/>
        श्री साई गणेश मंडळ, स्वामी रामानंद तीर्थ चौक, जुना मोंढा, नायगाव बाजार यांच्या गणेशोत्सवास आपण सपरिवार उपस्थित राहावे ही नम्र विनंती...
      `;
    }
  }

  if (openInviteGeneratorBtn && inviteGeneratorModal) {
    openInviteGeneratorBtn.addEventListener('click', () => {
      inviteGeneratorModal.classList.add('show');
      inviteGeneratorModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (guestNameInput) {
        guestNameInput.focus();
      }
      updateInvitePreview();
    });
  }

  if (closeInviteModalBtn && inviteGeneratorModal) {
    closeInviteModalBtn.addEventListener('click', () => {
      inviteGeneratorModal.classList.remove('show');
      inviteGeneratorModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  if (inviteGeneratorModal) {
    inviteGeneratorModal.addEventListener('click', (e) => {
      if (e.target === inviteGeneratorModal) {
        inviteGeneratorModal.classList.remove('show');
        inviteGeneratorModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  if (guestNameInput) {
    guestNameInput.addEventListener('input', updateInvitePreview);
  }

  if (sendWhatsappInviteBtn) {
    sendWhatsappInviteBtn.addEventListener('click', () => {
      const guestName = (guestNameInput && guestNameInput.value.trim()) || '';
      const baseUrl = window.location.origin + window.location.pathname;
      const personalizedUrl = guestName ? `${baseUrl}?guest=${encodeURIComponent(guestName)}` : baseUrl;

      const message = `॥ श्री गणेशाय नमः ॥ 🌺

*सस्नेह निमंत्रण !*
${guestName ? `आदरणीय *${guestName}*,\n` : ''}
आपणास व आपल्या संपूर्ण परिवारास *'श्री साई गणेश मंडळ'*, स्वामी रामानंद तीर्थ चौक, जुना मोंढा, नायगाव बाजार यांच्या भव्य गणेशोत्सवास उपस्थित राहण्याचे आग्रहाचे व सस्नेह निमंत्रण !

🌸 *उत्सवाची रूपरेषा व माहिती पाहण्यासाठी खालील डिजिटल निमंत्रण लिंक उघडा:*
👉 ${personalizedUrl}

*स्थळ:* स्वामी रामानंद तीर्थ चौक, जुना मोंढा, नायगाव बाजार - ४३१७०९
आपली उपस्थिती हाच बाप्पांचा खरा आशीर्वाद!
॥ गणपती बाप्पा मोरया ॥ 🙏`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // ==========================================
  // 12. Devotional Aarti & Stotra Modal Engine
  // ==========================================
  const aartiModal = document.getElementById('aartiModal');
  const openAartiModalBtn = document.getElementById('openAartiModalBtn');
  const closeAartiModalBtn = document.getElementById('closeAartiModalBtn');
  const aartiTabBtns = document.querySelectorAll('.aarti-tab-btn');
  const aartiPanes = document.querySelectorAll('.aarti-lyrics-pane');
  const copyLyricsBtn = document.getElementById('copyLyricsBtn');
  const copyLyricsText = document.getElementById('copyLyricsText');

  if (openAartiModalBtn && aartiModal) {
    openAartiModalBtn.addEventListener('click', () => {
      aartiModal.classList.add('show');
      aartiModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeAartiModalBtn && aartiModal) {
    closeAartiModalBtn.addEventListener('click', () => {
      aartiModal.classList.remove('show');
      aartiModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  if (aartiModal) {
    aartiModal.addEventListener('click', (e) => {
      if (e.target === aartiModal) {
        aartiModal.classList.remove('show');
        aartiModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  aartiTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      aartiTabBtns.forEach(b => b.classList.remove('active'));
      aartiPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`pane-${tabId}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  if (copyLyricsBtn) {
    copyLyricsBtn.addEventListener('click', () => {
      const activePane = document.querySelector('.aarti-lyrics-pane.active');
      if (!activePane) return;
      const lyricsPre = activePane.querySelector('.lyrics-pre');
      const header = activePane.querySelector('.lyrics-header');
      const textToCopy = `${header ? header.textContent + '\n\n' : ''}${lyricsPre ? lyricsPre.textContent : ''}`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        if (copyLyricsText) {
          const originalText = copyLyricsText.textContent;
          copyLyricsText.textContent = 'बोल कॉपी झाले! ✓';
          setTimeout(() => {
            copyLyricsText.textContent = originalText;
          }, 2000);
        }
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    });
  }

  // ==========================================
  // 13. Digital Wishes & RSVP Wall (LocalStorage)
  // ==========================================
  const wishesForm = document.getElementById('wishesForm');
  const wishesFeed = document.getElementById('wishesFeed');
  const STORAGE_KEY = 'sai_ganesh_wishes_v1';

  const defaultWishes = [
    {
      name: 'अमोल कुलकर्णी',
      city: 'नायगाव बाजार',
      message: 'गणपती बाप्पा मोरया! श्री साई गणेश मंडळाच्या सर्व कार्यकर्त्यांचे अभिनंदन व उत्सवास हार्दिक शुभेच्छा!'
    },
    {
      name: 'संजय पाटील परिवार',
      city: 'नांदेड',
      message: 'आगमन सोहळ्यास आम्ही नक्की उपस्थित राहू. बाप्पांचे आशीर्वाद तुम्हा सर्वांवर राहोत!'
    },
    {
      name: 'विजय देशमुख',
      city: 'पुणे',
      message: 'मंगलमूर्ती मोरया! अतिशय सुंदर निमंत्रण पत्रिका तयार केली आहे.'
    }
  ];

  function getStoredWishes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : defaultWishes;
    } catch (e) {
      return defaultWishes;
    }
  }

  function saveWishes(wishes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch (e) {}
  }

  function renderWishes() {
    if (!wishesFeed) return;
    const wishes = getStoredWishes();
    wishesFeed.innerHTML = '';

    wishes.forEach(wish => {
      const div = document.createElement('div');
      div.className = 'wish-item';
      div.innerHTML = `
        <div class="wish-header-row">
          <span class="wisher-name">🌺 ${escapeHtml(wish.name)}</span>
          ${wish.city ? `<span class="wisher-city-badge">${escapeHtml(wish.city)}</span>` : ''}
        </div>
        <p class="wish-body">${escapeHtml(wish.message)}</p>
      `;
      wishesFeed.appendChild(div);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  renderWishes();

  if (wishesForm) {
    wishesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wisherName');
      const cityInput = document.getElementById('wisherCity');
      const msgInput = document.getElementById('wisherMessage');

      const name = nameInput ? nameInput.value.trim() : '';
      const city = cityInput ? cityInput.value.trim() : '';
      const message = msgInput ? msgInput.value.trim() : '';

      if (!name || !message) return;

      const newWish = { name, city, message };
      const currentWishes = getStoredWishes();
      currentWishes.unshift(newWish);
      saveWishes(currentWishes);
      renderWishes();

      wishesForm.reset();

      const submitBtn = document.getElementById('submitWishBtn');
      if (submitBtn) {
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>सदिच्छा पाठवली! धन्यवाद 🙏</span>';
        setTimeout(() => {
          submitBtn.innerHTML = originalBtnHtml;
        }, 3000);
      }
    });
  }

  // ==========================================
  // 14. Fullscreen Gallery Lightbox Engine
  // ==========================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryLightboxModal = document.getElementById('galleryLightboxModal');
  const lightboxMainImg = document.getElementById('lightboxMainImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxOverlay = document.getElementById('lightboxOverlay');

  const galleryData = [];
  galleryItems.forEach((item, index) => {
    const src = item.getAttribute('data-src') || (item.querySelector('img') && item.querySelector('img').src);
    const caption = item.getAttribute('data-caption') || (item.querySelector('.gallery-overlay') && item.querySelector('.gallery-overlay').textContent);
    galleryData.push({ src, caption });

    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  let currentGalleryIndex = 0;

  function openLightbox(index) {
    if (!galleryLightboxModal || !galleryData[index]) return;
    currentGalleryIndex = index;
    updateLightboxContent();
    galleryLightboxModal.classList.add('show');
    galleryLightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!galleryLightboxModal) return;
    galleryLightboxModal.classList.remove('show');
    galleryLightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const item = galleryData[currentGalleryIndex];
    if (!item) return;
    if (lightboxMainImg) lightboxMainImg.src = item.src;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
  }

  function nextLightbox() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
    updateLightboxContent();
  }

  function prevLightbox() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
    updateLightboxContent();
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevLightbox);

  document.addEventListener('keydown', (e) => {
    if (!galleryLightboxModal || !galleryLightboxModal.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });
});
