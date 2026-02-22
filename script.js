// === Wild Encounter Flash ===
const flashOverlay = document.getElementById('flashOverlay');
if (flashOverlay) {
  flashOverlay.classList.add('flash');
  setTimeout(() => flashOverlay.classList.remove('flash'), 600);
}

// === Background Music Control ===
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.querySelector('.music-icon');
let isPlaying = false;

if (musicToggle && bgMusic) {
  musicToggle.addEventListener('click', function () {
    if (isPlaying) {
      bgMusic.pause();
      musicIcon.textContent = '🔇';
      this.classList.remove('playing');
      showPopup('Music Paused');
    } else {
      bgMusic.play().catch(err => {
        console.log('Audio play failed:', err);
        showPopup('Click again to play music');
      });
      musicIcon.textContent = '🔊';
      this.classList.add('playing');
      showPopup('♪ Littleroot Town ♪');
    }
    isPlaying = !isPlaying;
  });

  // Set initial volume
  bgMusic.volume = 0.3;
}

// === Evolution Chains ===
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';

const evolutionChains = {
  25: [25, 26],           // Pikachu → Raichu
  4: [4, 5, 6],          // Charmander → Charmeleon → Charizard
  133: [133, 134, 135, 136], // Eevee → Vaporeon → Jolteon → Flareon
  7: [7, 8, 9],          // Squirtle → Wartortle → Blastoise
  1: [1, 2, 3],          // Bulbasaur → Ivysaur → Venusaur
  39: [39, 40],           // Jigglypuff → Wigglytuff
  16: [16, 17, 18],       // Pidgey → Pidgeotto → Pidgeot
  35: [35, 36],           // Clefairy → Clefable
};

let evoStage = 0;

function triggerEvolveFlash() {
  if (!flashOverlay) return;
  flashOverlay.classList.remove('flash', 'evolve-flash');
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add('evolve-flash');
}

function evolvePokemon() {
  evoStage++;
  triggerEvolveFlash();

  document.querySelectorAll('.bg-pokemon[data-id]').forEach(img => {
    const baseId = img.getAttribute('data-id');
    const chain = evolutionChains[baseId];
    if (!chain) return;

    const newId = chain[evoStage % chain.length];
    img.classList.add('evolving');
    img.addEventListener('animationend', () => {
      img.classList.remove('evolving');
    }, { once: true });

    setTimeout(() => {
      img.src = `${SPRITE_BASE}/${newId}.gif`;
    }, 300);
  });

  showPopup(evoStage % 2 === 0 ? 'Reverted!' : 'Evolving!');
}

// === Pokéball Evolve Button ===
const evolveBtn = document.getElementById('evolveBtn');
evolveBtn?.addEventListener('click', evolvePokemon);

// === Pokémon Catch Mechanic ===
const pokemonNames = {
  1: 'Bulbasaur', 2: 'Ivysaur', 3: 'Venusaur', 4: 'Charmander', 5: 'Charmeleon', 6: 'Charizard',
  7: 'Squirtle', 8: 'Wartortle', 9: 'Blastoise', 16: 'Pidgey', 17: 'Pidgeotto', 18: 'Pidgeot',
  25: 'Pikachu', 26: 'Raichu', 35: 'Clefairy', 36: 'Clefable', 39: 'Jigglypuff', 40: 'Wigglytuff',
  133: 'Eevee', 134: 'Vaporeon', 135: 'Jolteon', 136: 'Flareon'
};

function createThrownPball() {
  const ball = document.createElement('div');
  ball.className = 'thrown-pball';
  ball.innerHTML = '<div class="tp-top"></div><div class="tp-bottom"></div><div class="tp-center"></div>';
  document.body.appendChild(ball);
  return ball;
}

function spawnSparkles(x, y) {
  const symbols = ['✦', '★', '✧', '⚡'];
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('div');
    s.className = 'catch-sparkle';
    s.textContent = symbols[i % symbols.length];
    const angle = (i / 6) * Math.PI * 2;
    const dist = 30 + Math.random() * 30;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
    s.style.color = i % 2 === 0 ? 'var(--pball-yellow)' : 'var(--pball-red)';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
}

function catchPokemon(img) {
  if (img.dataset.catching) return;
  img.dataset.catching = 'true';

  const rect = img.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2 - 14;
  const targetY = rect.top + rect.height / 2 - 14;

  const ball = createThrownPball();
  const startX = window.innerWidth / 2 - 14;
  const startY = window.innerHeight - 40;
  ball.style.left = startX + 'px';
  ball.style.top = startY + 'px';
  ball.classList.add('throwing');

  ball.style.transition = 'left 0.5s ease-out, top 0.5s ease-out';
  requestAnimationFrame(() => {
    ball.style.left = targetX + 'px';
    ball.style.top = targetY + 'px';
  });

  setTimeout(() => {
    img.classList.add('catching', 'caught');
    ball.classList.remove('throwing');

    let wobbles = 0;
    const maxWobbles = 3;

    function doWobble() {
      if (wobbles >= maxWobbles) {
        ball.classList.add('catch-success');
        spawnSparkles(targetX + 14, targetY + 14);

        const src = img.src;
        const idMatch = src.match(/\/(\d+)\./);
        const name = idMatch ? (pokemonNames[idMatch[1]] || 'Pokémon') : 'Pokémon';
        showPopup(`Gotcha! ${name}!`);

        setTimeout(() => {
          ball.remove();
          setTimeout(() => {
            img.classList.remove('catching', 'caught');
            img.classList.add('caught-return');

            // Fallback: clear catching flag after animation time even if event doesn't fire
            const clearCatching = () => {
              img.classList.remove('caught-return', 'poke-hover');
              delete img.dataset.catching;
            };

            img.addEventListener('animationend', clearCatching, { once: true });

            // Fallback timeout in case animationend doesn't fire
            setTimeout(clearCatching, 700);
          }, 1500);
        }, 400);
        return;
      }

      wobbles++;
      ball.classList.remove('wobble');
      void ball.offsetWidth;
      ball.classList.add('wobble');
      setTimeout(doWobble, 500);
    }

    setTimeout(doWobble, 200);
  }, 550);
}

// === JS-Driven Pokémon Hit Detection (bypasses CSS stacking) ===
const allPokemon = document.querySelectorAll('.bg-pokemon[data-id]');

function getPokemonAtPoint(x, y) {
  let closestPokemon = null;
  let closestDistance = Infinity;

  // Find the closest Pokémon to the click point
  for (const img of allPokemon) {
    // Skip if already being caught
    if (img.dataset.catching) continue;

    const rect = img.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from click to center of Pokémon
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    // Check if click is within the Pokémon bounds (with generous padding)
    const pad = 32;
    if (x >= rect.left - pad && x <= rect.right + pad &&
      y >= rect.top - pad && y <= rect.bottom + pad) {
      // If this is closer than previous matches, use it
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPokemon = img;
      }
    }
  }

  return closestPokemon;
}

let currentHover = null;

document.addEventListener('mousemove', (e) => {
  const hit = getPokemonAtPoint(e.clientX, e.clientY);
  if (hit !== currentHover) {
    if (currentHover && !currentHover.dataset.catching) {
      currentHover.classList.remove('poke-hover');
    }
    currentHover = hit;
    if (hit && !hit.dataset.catching) {
      hit.classList.add('poke-hover');
    }
  }
  document.body.style.cursor = hit ? 'pointer' : '';
});

document.addEventListener('click', (e) => {
  const hit = getPokemonAtPoint(e.clientX, e.clientY);
  if (hit && !hit.dataset.catching) {
    catchPokemon(hit);
  }
});

// === HP Bar Fill Animation ===
const hpObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      const width = fill.getAttribute('data-fill') + '%';
      fill.style.setProperty('--fill-width', width);
      fill.classList.add('animated');
      // Reveal the percentage label on the track
      const track = fill.closest('.hp-track');
      if (track) setTimeout(() => track.classList.add('labeled'), 900);
      hpObserver.unobserve(fill);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.hp-fill').forEach(el => hpObserver.observe(el));

// === Project Stack Navigation (Click Left/Right) ===
let currentProjectIndex = 0;
const projectCards = document.querySelectorAll('.project-card');
const totalProjects = projectCards.length;

const projectDots = document.querySelectorAll('#projectDots .dot');

function updateProjectDisplay() {
  projectCards.forEach((card, index) => {
    card.classList.remove('active', 'prev', 'next');

    if (index === currentProjectIndex) {
      card.classList.add('active');
    } else if (index < currentProjectIndex) {
      card.classList.add('prev');
    } else {
      card.classList.add('next');
    }
  });
  // Sync dot indicators
  projectDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentProjectIndex);
  });
}

function nextProject() {
  currentProjectIndex = (currentProjectIndex + 1) % totalProjects;
  updateProjectDisplay();
  showPopup(`Project ${currentProjectIndex + 1} of ${totalProjects}`);
}

function prevProject() {
  currentProjectIndex = (currentProjectIndex - 1 + totalProjects) % totalProjects;
  updateProjectDisplay();
  showPopup(`Project ${currentProjectIndex + 1} of ${totalProjects}`);
}

// Click left side to go back, right side to go forward
projectCards.forEach(card => {
  card.addEventListener('click', function (e) {
    if (!this.classList.contains('active')) return;

    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const cardWidth = rect.width;

    // If clicked on left half, go back; if right half, go forward
    if (clickX < cardWidth / 2) {
      prevProject();
    } else {
      nextProject();
    }
  });

  // Add visual feedback on hover
  card.addEventListener('mousemove', function (e) {
    if (!this.classList.contains('active')) return;

    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const cardWidth = rect.width;

    if (clickX < cardWidth / 2) {
      this.style.cursor = 'w-resize'; // Left arrow cursor
    } else {
      this.style.cursor = 'e-resize'; // Right arrow cursor
    }
  });
});

// Initialize project display
if (projectCards.length > 0) {
  updateProjectDisplay();
}

// Dot click navigation for projects
projectDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    currentProjectIndex = i;
    updateProjectDisplay();
    showPopup(`Project ${i + 1} of ${totalProjects}`);
  });
});

// === Certificate Stack Navigation (Click Left/Right) ===
let currentCertIndex = 0;
const certCards = document.querySelectorAll('.certificate-cards-container .certificate-card');
const totalCerts = certCards.length;

const certDots = document.querySelectorAll('#certDots .dot');

function updateCertDisplay() {
  certCards.forEach((card, index) => {
    card.classList.remove('active', 'prev', 'next');

    if (index === currentCertIndex) {
      card.classList.add('active');
    } else if (index < currentCertIndex) {
      card.classList.add('prev');
    } else {
      card.classList.add('next');
    }
  });
  // Sync dot indicators
  certDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentCertIndex);
  });
}

function nextCert() {
  currentCertIndex = (currentCertIndex + 1) % totalCerts;
  updateCertDisplay();
  showPopup(`Certificate ${currentCertIndex + 1} of ${totalCerts}`);
}

function prevCert() {
  currentCertIndex = (currentCertIndex - 1 + totalCerts) % totalCerts;
  updateCertDisplay();
  showPopup(`Certificate ${currentCertIndex + 1} of ${totalCerts}`);
}

// Click left side to go back, right side to go forward
certCards.forEach(card => {
  card.addEventListener('click', function (e) {
    if (!this.classList.contains('active')) return;

    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const cardWidth = rect.width;

    // If clicked on left half, go back; if right half, go forward
    if (clickX < cardWidth / 2) {
      prevCert();
    } else {
      nextCert();
    }
  });

  // Add visual feedback on hover
  card.addEventListener('mousemove', function (e) {
    if (!this.classList.contains('active')) return;

    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const cardWidth = rect.width;

    if (clickX < cardWidth / 2) {
      this.style.cursor = 'w-resize'; // Left arrow cursor
    } else {
      this.style.cursor = 'e-resize'; // Right arrow cursor
    }
  });
});

// Initialize certificate display
if (certCards.length > 0) {
  updateCertDisplay();
}

// Dot click navigation for certificates
certDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    currentCertIndex = i;
    updateCertDisplay();
    showPopup(`Certificate ${i + 1} of ${totalCerts}`);
  });
});

// Reset certificate index when modal opens
const certModal = document.getElementById('certificatesModal');
if (certModal) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        if (certModal.classList.contains('show')) {
          currentCertIndex = 0;
          updateCertDisplay();
        }
      }
    });
  });
  observer.observe(certModal, { attributes: true });
}

// === Scroll Reveal for Cards ===
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section, .stats-section, .pokecard, .move-category, .training-card').forEach(el => {
  cardObserver.observe(el);
});

// === Battle Text Popup ===
function showPopup(text) {
  const pop = document.createElement('div');
  pop.className = 'fun-popup';
  pop.textContent = text;
  pop.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:1rem 1.5rem;background:var(--pball-yellow);color:var(--pball-black);font-family:var(--font-pixel);font-size:0.6rem;border:3px solid #212121;border-radius:8px;z-index:9998;animation:popIn 0.4s ease;box-shadow:0 4px 0 #212121;';
  document.body.appendChild(pop);
  setTimeout(() => {
    pop.style.animation = 'popOut 0.3s ease forwards';
    setTimeout(() => pop.remove(), 300);
  }, 600);
}

// Inject popup keyframes
const style = document.createElement('style');
style.textContent = `@keyframes popIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes popOut{0%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(0.8)}}`;
document.head.appendChild(style);

// === Interactive Skill Badges with Sound Effect ===
document.querySelectorAll('.move-badge').forEach(badge => {
  badge.addEventListener('click', function () {
    const skill = this.textContent;
    this.style.animation = 'none';
    void this.offsetWidth;
    this.style.animation = 'skillPulse 0.4s ease';
    showPopup(`${skill} learned!`);
  });
});

// === Interactive Training Cards Progress ===
const trainingCards = document.querySelectorAll('.training-card');
trainingCards.forEach((card, index) => {
  let progress = 0;
  card.addEventListener('click', function () {
    progress += 25;
    if (progress > 100) progress = 0;

    const icon = this.querySelector('.training-icon');
    icon.style.transform = `scale(${1 + progress / 200})`;

    if (progress === 100) {
      this.style.borderColor = 'var(--hp-green)';
      this.style.background = 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))';
      showPopup('Training Complete! 🎉');
    } else {
      this.style.borderColor = '';
      this.style.background = '';
      showPopup(`Training ${progress}%`);
    }
  });
});

// === Interactive Project Card Flip ===
const pokecard = document.querySelector('.pokecard');
if (pokecard) {
  let flipped = false;
  pokecard.addEventListener('dblclick', function () {
    flipped = !flipped;
    this.style.transform = flipped
      ? 'rotateY(180deg) scale(1.02)'
      : 'rotateY(0deg)';
    this.style.transition = 'transform 0.6s';
    showPopup(flipped ? 'Card Flipped!' : 'Card Reset!');
  });
}

// === Parallax Effect on Mouse Move ===
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 20;

  document.querySelectorAll('.bg-pokemon').forEach((pokemon, i) => {
    const speed = 0.5 + (i * 0.1);
    pokemon.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
  });

  document.querySelectorAll('.sparkle').forEach((sparkle, i) => {
    const speed = 0.3 + (i * 0.05);
    sparkle.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
  });
});

// === Konami Code Easter Egg ===
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      activateSecretMode();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function activateSecretMode() {
  document.body.style.animation = 'rainbowBg 3s ease infinite';
  showPopup('🌈 SECRET MODE ACTIVATED! 🌈');

  document.querySelectorAll('.bg-pokemon').forEach(pokemon => {
    pokemon.style.filter = 'hue-rotate(180deg) saturate(2)';
    pokemon.style.animation = 'crazyFloat 1s ease-in-out infinite';
  });

  setTimeout(() => {
    document.body.style.animation = '';
    document.querySelectorAll('.bg-pokemon').forEach(pokemon => {
      pokemon.style.filter = '';
    });
  }, 5000);
}

// === HP Bar Interactive Click ===
document.querySelectorAll('.hp-stat').forEach(stat => {
  stat.addEventListener('click', function () {
    const fill = this.querySelector('.hp-fill');
    const label = this.querySelector('.hp-label span:first-child').textContent;
    fill.style.animation = 'hpPulse 0.5s ease';
    setTimeout(() => fill.style.animation = '', 500);
    showPopup(`${label} boosted!`);
  });
});

// === Shake Effect on Trainer Card ===
const trainerCard = document.querySelector('.trainer-card-inner');
const closeModal = document.getElementById('closeModal');

if (trainerCard) {
  trainerCard.addEventListener('click', function () {
    this.style.animation = 'cardShake 0.5s ease';
    setTimeout(() => this.style.animation = '', 500);

    // Show certificates modal
    const certificatesModal = document.getElementById('certificatesModal');
    if (certificatesModal) {
      certificatesModal.classList.add('show');
      showPopup('Viewing Trainer Badges!');
    }
  });
}

// Close modal handlers
if (closeModal) {
  closeModal.addEventListener('click', function () {
    const certificatesModal = document.getElementById('certificatesModal');
    if (certificatesModal) {
      certificatesModal.classList.remove('show');
    }
  });
}

// Close on click outside and Escape key
document.addEventListener('click', function (e) {
  const certificatesModal = document.getElementById('certificatesModal');
  if (certificatesModal && e.target === certificatesModal) {
    certificatesModal.classList.remove('show');
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const certificatesModal = document.getElementById('certificatesModal');
    if (certificatesModal && certificatesModal.classList.contains('show')) {
      certificatesModal.classList.remove('show');
    }
  }
});

// === Contact Button Hover Sound Effect ===
const contactBtns = document.querySelectorAll('.contact-btn');
contactBtns.forEach(btn => {
  btn.addEventListener('mouseenter', function () {
    this.style.animation = 'buttonWiggle 0.3s ease';
  });
  btn.addEventListener('animationend', function () {
    this.style.animation = '';
  });
});

// === Email Button Click Handler ===
const emailBtn = document.querySelector('.contact-btn--email');
if (emailBtn) {
  emailBtn.addEventListener('click', function(e) {
    // Try to open mailto, but also copy to clipboard as fallback
    const email = 'cristianjohnnorono@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      // Show a temporary notification
      const notification = document.createElement('div');
      notification.textContent = 'Email copied to clipboard!';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 2000);
    }).catch(err => {
      console.log('Could not copy email:', err);
    });
  });
}

// === Tooltip System ===
const tooltip = document.getElementById('tooltip');
const tooltipElements = {
  '.move-badge': 'Click to learn this skill!',
  '.training-card': 'Click to train! (4 clicks = 100%)',
  '.hp-stat': 'Click to boost stats!',
  '.trainer-card-inner': 'Click to view certificates!',
  '.pokecard': 'Double-click to flip card!',
  '.pball-toggle': 'Click to evolve Pokémon!',
  '.bg-pokemon': 'Click to catch!',
  '.music-toggle': 'Toggle background music'
};

Object.entries(tooltipElements).forEach(([selector, text]) => {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mouseenter', function (e) {
      tooltip.textContent = text;
      tooltip.classList.add('show');
      updateTooltipPosition(e);
    });

    el.addEventListener('mousemove', updateTooltipPosition);

    el.addEventListener('mouseleave', function () {
      tooltip.classList.remove('show');
    });
  });
});

function updateTooltipPosition(e) {
  tooltip.style.left = (e.clientX + 15) + 'px';
  tooltip.style.top = (e.clientY + 15) + 'px';
}

// === Keyboard Shortcuts Info ===
document.addEventListener('keydown', (e) => {
  if (e.key === '?') {
    showPopup('Try: Click badges, cards, stats! Konami code for secret! 🎮');
  }
});

