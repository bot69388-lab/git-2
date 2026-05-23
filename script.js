/* ==========================================================================
   State & Global Configuration
   ========================================================================== */
const state = {
  herName: '',
  hisName: '',
  isMuted: true,
  noBtnClicks: 0
};

/* ==========================================================================
   Floating Hearts Background Generator
   ========================================================================== */
const heartsContainer = document.getElementById('hearts-container');

function createFloatingHeart() {
  if (!heartsContainer) return;

  const heart = document.createElement('div');
  heart.classList.add('floating-heart');

  // Randomize sizing, horizontal placement, and duration
  const size = Math.random() * 20 + 15; // 15px to 35px
  const startLeft = Math.random() * 100; // 0% to 100%
  const duration = Math.random() * 5 + 5; // 5s to 10s
  const delay = Math.random() * 2; // 0s to 2s
  
  // Custom colors for romantic variation
  const colors = ['#ff4d6d', '#ff758f', '#ff8da1', '#ffb3c1', '#c9184a'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Apply styles
  heart.style.width = `${size}px`;
  heart.style.height = `${size}px`;
  heart.style.left = `${startLeft}%`;
  heart.style.backgroundColor = color;
  heart.style.animationDuration = `${duration}s`;
  heart.style.animationDelay = `${delay}s`;
  
  // Add gentle sway effect using random keyframe offsets
  const swayRange = (Math.random() - 0.5) * 40; // -20px to 20px
  heart.style.setProperty('--sway-offset', `${swayRange}px`);

  heartsContainer.appendChild(heart);

  // Clean up element from DOM when animation completes
  heart.addEventListener('animationend', () => {
    heart.remove();
  });
}

// Keep generating hearts continuously
setInterval(createFloatingHeart, 350);

// Spawn a few initial hearts so screen isn't empty on load
for (let i = 0; i < 10; i++) {
  setTimeout(createFloatingHeart, i * 150);
}

/* ==========================================================================
   Web Audio API Music Box Synthesizer
   ========================================================================== */
let audioCtx = null;
let delayNode = null;
let feedbackNode = null;
let synthIntervalId = null;

// Cute lullaby melody composition (Frequency and Duration in steps)
// Plays a cozy music-box theme in C-major/A-minor
const melody = [
  { note: 659.25, steps: 2 }, // E5
  { note: 783.99, steps: 2 }, // G5
  { note: 1046.50, steps: 4 }, // C6
  { note: 987.77, steps: 2 }, // B5
  { note: 880.00, steps: 2 }, // A5
  { note: 783.99, steps: 4 }, // G5
  
  { note: 880.00, steps: 2 }, // A5
  { note: 783.99, steps: 2 }, // G5
  { note: 659.25, steps: 4 }, // E5
  { note: 587.33, steps: 2 }, // D5
  { note: 523.25, steps: 2 }, // C5
  { note: 587.33, steps: 4 }, // D5
  
  { note: 659.25, steps: 2 }, // E5
  { note: 783.99, steps: 2 }, // G5
  { note: 587.33, steps: 4 }, // D5
  { note: 523.25, steps: 8 }  // C5 (long hold)
];

const backingArpeggio = [
  261.63, 392.00, 523.25, 392.00, // C4 - G4 - C5 - G4
  220.00, 329.63, 440.00, 329.63, // A3 - E4 - A4 - E4
  349.23, 523.25, 698.46, 523.25, // F4 - C5 - F5 - C5
  293.66, 440.00, 587.33, 440.00  // D4 - A4 - D5 - A4
];

let melodyIndex = 0;
let arpeggioIndex = 0;
let stepCounter = 0;

function initAudio() {
  if (audioCtx) return;

  // Set up AudioContext with backward compatibility
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create beautiful concert echo effect using delay and feedback nodes
  delayNode = audioCtx.createDelay(1.0);
  feedbackNode = audioCtx.createGain();
  
  delayNode.delayTime.value = 0.35; // 350ms echo
  feedbackNode.gain.value = 0.45; // Soft feedback trail
  
  // Feedback loop wiring: delay -> feedback -> delay
  delayNode.connect(feedbackNode);
  feedbackNode.connect(delayNode);
  
  // Wire to speakers
  delayNode.connect(audioCtx.destination);
}

function playMusicBoxTine(frequency, volume = 0.15, duration = 0.8) {
  if (!audioCtx || state.isMuted) return;

  const now = audioCtx.currentTime;
  
  // Create synth oscillator (sine wave creates that pure, sweet bell tone)
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = frequency;
  
  // Bell-like Pluck Envelope (Fast attack, beautiful long linear decay)
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.connect(delayNode); // Send to echo room
  
  osc.start(now);
  osc.stop(now + duration + 0.1);
}

// Plays a rapid ascending celebration chime
function playSuccessChime() {
  if (state.isMuted) return;
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
  chords.forEach((freq, idx) => {
    setTimeout(() => {
      playMusicBoxTine(freq, 0.25, 1.2);
    }, idx * 120);
  });
}

function startSequencer() {
  if (synthIntervalId) clearInterval(synthIntervalId);
  
  const stepTimeMs = 280; // Velocity tempo
  
  synthIntervalId = setInterval(() => {
    if (state.isMuted) return;
    
    // 1. Play backing arpeggio on eighth notes
    if (stepCounter % 2 === 0) {
      const bassFreq = backingArpeggio[arpeggioIndex];
      playMusicBoxTine(bassFreq, 0.05, 1.2); // Soft bass backing
      arpeggioIndex = (arpeggioIndex + 1) % backingArpeggio.length;
    }
    
    // 2. Play lead melody
    const currentNote = melody[melodyIndex];
    if (stepCounter === 0) {
      playMusicBoxTine(currentNote.note, 0.18, currentNote.steps * 0.4);
    }
    
    // Manage step counters
    stepCounter++;
    if (stepCounter >= currentNote.steps) {
      stepCounter = 0;
      melodyIndex = (melodyIndex + 1) % melody.length;
    }
  }, stepTimeMs);
}

// Handle Music Button Toggling
const musicBtn = document.getElementById('music-btn');
const musicIconMuted = document.getElementById('music-icon-muted');
const musicIconPlaying = document.getElementById('music-icon-playing');

musicBtn.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  
  if (!state.isMuted) {
    // Enable audio
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    startSequencer();
    
    // Update icons
    musicBtn.classList.remove('muted');
    musicBtn.classList.add('playing');
    musicIconMuted.style.display = 'none';
    musicIconPlaying.style.display = 'block';
  } else {
    // Mute audio
    if (audioCtx) {
      audioCtx.suspend();
    }
    musicBtn.classList.add('muted');
    musicBtn.classList.remove('playing');
    musicIconMuted.style.display = 'block';
    musicIconPlaying.style.display = 'none';
  }
});

/* ==========================================================================
   Page Navigation
   ========================================================================== */
function navigateToPage(fromPageId, toPageId) {
  const fromPage = document.getElementById(fromPageId);
  const toPage = document.getElementById(toPageId);
  
  if (fromPage && toPage) {
    fromPage.classList.remove('active');
    // Give 400ms for exit animation
    setTimeout(() => {
      toPage.classList.add('active');
    }, 400);
  }
}

/* ==========================================================================
   PAGE 1: LOGIN LOGIC
   ========================================================================== */
const loginForm = document.getElementById('login-form');
const herNameInput = document.getElementById('her-name');
const hisNameInput = document.getElementById('his-name');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const pageLoginCard = document.getElementById('page-login');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const enteredPass = passwordInput.value.trim();
  
  if (enteredPass === '1208') {
    // Success Login
    state.herName = herNameInput.value.trim();
    state.hisName = hisNameInput.value.trim();
    
    loginError.classList.remove('show');
    
    // Play short cute sound chime
    if (!state.isMuted) {
      playMusicBoxTine(523.25, 0.2, 0.6); // C5
      setTimeout(() => playMusicBoxTine(659.25, 0.2, 0.6), 100); // E5
      setTimeout(() => playMusicBoxTine(783.99, 0.25, 0.8), 200); // G5
    }
    
    // Smooth transition to Proposal Page
    navigateToPage('page-login', 'page-proposal');
  } else {
    // Incorrect Password
    loginError.classList.add('show');
    
    // Shake Login Card
    pageLoginCard.classList.add('shake');
    
    // Play cute sad buzzer chime
    if (!state.isMuted) {
      playMusicBoxTine(293.66, 0.2, 0.4); // D4
      setTimeout(() => playMusicBoxTine(220.00, 0.2, 0.6), 120); // A3
    }
    
    // Remove shake class after animation completes
    setTimeout(() => {
      pageLoginCard.classList.remove('shake');
    }, 500);
  }
});

/* ==========================================================================
   PAGE 2: PROPOSAL INTERACTION & PLAYFUL NO BUTTON
   ========================================================================== */
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const successBanner = document.getElementById('success-banner');

const noButtonTexts = [
  "NO 💔",
  "Are you sure? 🥺",
  "Think again! 💖",
  "No way! 👉👈",
  "Please? 🌹",
  "But I love you! 😭",
  "Click YES! 💕"
];

function handleNoInteraction() {
  state.noBtnClicks++;
  
  // Calculate dynamic scaling down
  const scale = Math.max(0.15, 1 - state.noBtnClicks * 0.15);
  
  // Playful displacement calculation inside the bounds of the card
  // Moves button horizontally and vertically randomly
  const xMovement = (Math.random() - 0.5) * 220; // -110px to +110px
  const yMovement = (Math.random() - 0.5) * 110; // -55px to +55px
  
  // Update texts
  const textIdx = Math.min(state.noBtnClicks, noButtonTexts.length - 1);
  btnNo.textContent = noButtonTexts[textIdx];
  
  // Synthesize soft squeaky escape sound
  if (!state.isMuted) {
    playMusicBoxTine(880 + Math.random() * 200, 0.1, 0.15);
  }

  // Update styles
  btnNo.style.transform = `translate(${xMovement}px, ${yMovement}px) scale(${scale})`;
  
  // Completely disappear after click count hits threshold
  if (state.noBtnClicks >= 6) {
    btnNo.style.opacity = '0';
    btnNo.style.pointerEvents = 'none';
    
    // Smoothly grow Yes button slightly to fill the focus
    btnYes.style.transform = 'scale(1.2)';
    btnYes.style.boxShadow = '0 0 25px rgba(255, 77, 109, 0.7)';
  }
}

// Add triggers for mouse-hover and screen touches for maximum slippiness
btnNo.addEventListener('mouseenter', handleNoInteraction);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevents double firing
  handleNoInteraction();
});
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  handleNoInteraction();
});

/* ==========================================================================
   YES Button Celebration & Canvas Particle Heart Explosion
   ========================================================================== */
const canvas = document.getElementById('explosion-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationFrameId = null;

// Handle canvas resizing
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class HeartParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // Randomized sizing and speeds
    this.size = Math.random() * 15 + 10;
    this.speedX = (Math.random() - 0.5) * 12;
    this.speedY = (Math.random() - 0.5) * 12 - 5; // Launch upward
    
    // Physics and fades
    this.gravity = 0.15;
    this.opacity = 1;
    this.fadeSpeed = Math.random() * 0.015 + 0.01;
    
    // Rotations
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.1;
    
    // Color variants
    const colors = [
      'rgba(255, 77, 109, ', 
      'rgba(255, 117, 143, ', 
      'rgba(255, 141, 161, ', 
      'rgba(255, 182, 193, ', 
      'rgba(201, 24, 74, ', 
      'rgba(255, 183, 3, ' // Golden heart sparks
    ];
    this.colorBase = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.speedY += this.gravity;
    this.y += this.speedY;
    
    this.angle += this.spin;
    this.opacity -= this.fadeSpeed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;
    
    // Render detailed SVG-like Heart Path inside Canvas
    ctx.beginPath();
    const d = this.size;
    ctx.moveTo(0, d / 4);
    ctx.bezierCurveTo(-d/2, -d/2, -d, -d/4, -d, d/4);
    ctx.bezierCurveTo(-d, d*0.7, -d/4, d*0.9, 0, d);
    ctx.bezierCurveTo(d/4, d*0.7, d, d*0.9, d, d/4);
    ctx.bezierCurveTo(d, -d/4, d/2, -d/2, 0, d/4);
    ctx.closePath();
    
    ctx.fillStyle = this.colorBase + this.opacity + ')';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 77, 109, 0.4)';
    ctx.fill();
    ctx.restore();
  }
}

function spawnExplosion(originX, originY) {
  // Spawn 100+ heart particles
  for (let i = 0; i < 110; i++) {
    particles.push(new HeartParticle(originX, originY));
  }
  
  animateParticles();
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles = particles.filter(p => p.opacity > 0);
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  
  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

btnYes.addEventListener('click', (e) => {
  // Locate click coordinates for particle origin
  const rect = btnYes.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  
  // 1. Play grand music box chimes
  playSuccessChime();
  
  // 2. Launch particle explosion
  spawnExplosion(originX, originY);
  
  // 3. Show success text box banner
  successBanner.classList.add('active');
  
  // Disable YES button clicks
  btnYes.disabled = true;
  
  // 4. Smooth automatic page transition to Love Letter
  setTimeout(() => {
    successBanner.classList.remove('active');
    navigateToPage('page-proposal', 'page-letter');
  }, 2600);
});

/* ==========================================================================
   PAGE 3 to PAGE 4: JOURNEY TRANSITION
   ========================================================================== */
const btnToJourney = document.getElementById('btn-to-journey');

btnToJourney.addEventListener('click', () => {
  // Synthesize a gorgeous transitioning chord arpeggio
  if (!state.isMuted) {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const transitionNotes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6
    transitionNotes.forEach((freq, idx) => {
      setTimeout(() => {
        playMusicBoxTine(freq, 0.2, 0.8);
      }, idx * 100);
    });
  }
  
  navigateToPage('page-letter', 'page-journey');
});
