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

  curtainSealBtn.addEventListener('click', openCurtain);

  // ==========================================
  // 4. Family 3D Slider Carousel
  // ==========================================
  const familySlider = document.getElementById('familySlider');
  const familyCards = familySlider ? Array.from(familySlider.querySelectorAll('.family-card')) : [];
  const familyDots = document.getElementById('familyDots') ? Array.from(document.getElementById('familyDots').querySelectorAll('span')) : [];
  const familyPrevBtn = document.getElementById('familyPrevBtn');
  const familyNextBtn = document.getElementById('familyNextBtn');
  
  let currentFamilyIndex = 0;
  const familyTotal = familyCards.length;

  function updateFamilySlider(index) {
    if (!familyTotal) return;
    currentFamilyIndex = (index + familyTotal) % familyTotal;
    const prevIdx = (currentFamilyIndex - 1 + familyTotal) % familyTotal;
    const nextIdx = (currentFamilyIndex + 1) % familyTotal;

    familyCards.forEach((card, idx) => {
      card.classList.remove('active', 'prev', 'next');
      if (idx === currentFamilyIndex) {
        card.classList.add('active');
      } else if (idx === prevIdx) {
        card.classList.add('prev');
      } else if (idx === nextIdx) {
        card.classList.add('next');
      }
    });

    familyDots.forEach((dot, idx) => {
      if (idx === currentFamilyIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    familyCards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('prev')) {
          updateFamilySlider(currentFamilyIndex - 1);
        } else if (card.classList.contains('next')) {
          updateFamilySlider(currentFamilyIndex + 1);
        }
      });
    });
  }

  // Auto Slider from Left to Right
  let familyAutoSlideTimer = null;
  function startFamilyAutoSlide() {
    stopFamilyAutoSlide();
    familyAutoSlideTimer = setInterval(() => {
      updateFamilySlider(currentFamilyIndex + 1);
    }, 3500);
  }

  function stopFamilyAutoSlide() {
    if (familyAutoSlideTimer) {
      clearInterval(familyAutoSlideTimer);
      familyAutoSlideTimer = null;
    }
  }

  startFamilyAutoSlide();

  if (familySlider) {
    familySlider.addEventListener('mouseenter', stopFamilyAutoSlide);
    familySlider.addEventListener('mouseleave', startFamilyAutoSlide);
  }

  if (familyPrevBtn) {
    familyPrevBtn.addEventListener('click', () => {
      updateFamilySlider(currentFamilyIndex - 1);
      startFamilyAutoSlide();
    });
  }

  if (familyNextBtn) {
    familyNextBtn.addEventListener('click', () => {
      updateFamilySlider(currentFamilyIndex + 1);
      startFamilyAutoSlide();
    });
  }

  familyDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateFamilySlider(idx);
      startFamilyAutoSlide();
    });
  });

  // Touch Swipe for Family Slider
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;

  if (familySlider) {
    familySlider.addEventListener('touchstart', (e) => {
      stopFamilyAutoSlide();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isSwiping = true;
    }, { passive: true });

    familySlider.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;
      if (Math.abs(diffY) > Math.abs(diffX)) {
        isSwiping = false; // vertical scroll, ignore
      }
    }, { passive: true });

    familySlider.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartX;
      if (Math.abs(diffX) >= 50) {
        if (diffX < 0) {
          updateFamilySlider(currentFamilyIndex + 1);
        } else {
          updateFamilySlider(currentFamilyIndex - 1);
        }
      }
      isSwiping = false;
      startFamilyAutoSlide();
    }, { passive: true });
  }

  // ==========================================
  // 5. Timeline Interactive Modal
  // ==========================================
  const timelineModal = document.getElementById('timelineModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalMurtiImg = document.getElementById('modalMurtiImg');
  const modalDate = document.getElementById('modalDate');
  const modalTime = document.getElementById('modalTime');
  const modalPlace = document.getElementById('modalPlace');
  const modalDesc = document.getElementById('modalDesc');

  function openTimelineModal(tile) {
    const title = tile.getAttribute('data-title') || '';
    const date = tile.getAttribute('data-date') || '';
    const time = tile.getAttribute('data-time') || '';
    const place = tile.getAttribute('data-place') || '';
    const desc = tile.getAttribute('data-desc') || '';
    const image = tile.getAttribute('data-image') || '';

    modalTitle.textContent = title;
    modalDate.textContent = date;
    modalTime.textContent = time;
    modalPlace.textContent = place;
    modalDesc.textContent = desc;
    if (image) {
      modalMurtiImg.src = image;
    }

    timelineModal.classList.add('show');
    timelineModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeTimelineModal() {
    timelineModal.classList.remove('show');
    timelineModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.utsav-tile').forEach(tile => {
    tile.addEventListener('click', () => openTimelineModal(tile));
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeTimelineModal);
  }

  if (timelineModal) {
    timelineModal.addEventListener('click', (e) => {
      if (e.target === timelineModal) {
        closeTimelineModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && timelineModal.classList.contains('show')) {
      closeTimelineModal();
    }
  });

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
});
