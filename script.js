/* ── LOADER ── */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 300);
});

/* ── CUSTOM CURSOR ── */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
  dot.style.transform = 'translate(-50%, -50%)';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .work-card, .contact-email, .soft-tag, .timeline-tags span').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    // Close mobile menu if open
    const menu = document.getElementById('mobileMenu');
    const burger = document.getElementById('burger');
    if (menu && menu.classList.contains('open')) {
      menu.classList.remove('open');
      burger.classList.remove('active');
    }
  });
});

/* ── HAMBURGER MENU ── */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
}

/* ── HIDE CURSOR ON TOUCH DEVICES ── */
if ('ontouchstart' in window) {
  dot.style.display = 'none';
  ring.style.display = 'none';
}

/* ── ROTATING WORD (only on index page) ── */
const rotatingEl = document.getElementById('rotatingWord');
if (rotatingEl) {
  const words = ['people', 'money', 'brands', 'ideas'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeWord() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      rotatingEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 60;
    } else {
      rotatingEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 400;
    }

    setTimeout(typeWord, typingSpeed);
  }

  setTimeout(typeWord, 3000);
}

/* ── CAROUSEL DRAG & VIDEO ── */
function initCarousel(carouselEl, progressBarEl) {
  if (!carouselEl) return;

  let isDragging = false;
  let startX, scrollLeft;

  carouselEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    carouselEl.classList.add('dragging');
    startX = e.pageX - carouselEl.offsetLeft;
    scrollLeft = carouselEl.scrollLeft;
  });

  carouselEl.addEventListener('mouseleave', () => {
    isDragging = false;
    carouselEl.classList.remove('dragging');
  });

  carouselEl.addEventListener('mouseup', () => {
    isDragging = false;
    carouselEl.classList.remove('dragging');
  });

  carouselEl.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselEl.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselEl.scrollLeft = scrollLeft - walk;
  });

  // Progress bar
  if (progressBarEl) {
    carouselEl.addEventListener('scroll', () => {
      const scrollWidth = carouselEl.scrollWidth - carouselEl.clientWidth;
      const scrolled = carouselEl.scrollLeft / scrollWidth;
      progressBarEl.style.width = (scrolled * 100) + '%';
    });
  }

  // Video hover play + show first frame
  const cards = carouselEl.querySelectorAll('.carousel-card:not(.carousel-hint)');
  const isTouchDevice = 'ontouchstart' in window;
  let soundUnlocked = false;

  cards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.1;
      card.classList.add('has-video');
    });

    video.load();

    if (isTouchDevice) {
      let touchMoved = false;

      card.addEventListener('touchstart', () => { touchMoved = false; });
      card.addEventListener('touchmove', () => { touchMoved = true; });

      card.addEventListener('touchend', () => {
        if (touchMoved) return;

        // Pause all videos on page
        document.querySelectorAll('.carousel-card video').forEach(v => {
          v.pause();
          v.closest('.carousel-card').classList.remove('is-playing');
        });

        if (video.paused) {
          video.muted = false;
          video.play().catch(() => {});
          card.classList.add('is-playing');
        } else {
          video.pause();
          card.classList.remove('is-playing');
        }
      });

    } else {
      card.addEventListener('click', () => {
        if (!soundUnlocked) {
          document.querySelectorAll('.carousel-card video').forEach(v => { v.muted = false; });
          soundUnlocked = true;
        }
        if (video.paused) {
          video.play().catch(() => {});
        }
      });

      card.addEventListener('mouseenter', () => {
        if (!carouselEl.classList.contains('dragging')) {
          video.play().catch(() => {});
        }
      });

      card.addEventListener('mouseleave', () => {
        video.pause();
      });
    }
  });
}

// Init both carousels
initCarousel(
  document.getElementById('carousel'),
  document.getElementById('carouselProgress')
);
initCarousel(
  document.getElementById('carouselH'),
  document.getElementById('carouselProgressH')
);

/* ── SKILL BAR ANIMATION (CV page) ── */
const skillBars = document.querySelectorAll('.skill-fill, .lang-fill');
if (skillBars.length > 0) {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const level = entry.target.getAttribute('data-level');
        setTimeout(() => {
          entry.target.style.width = level + '%';
        }, 200);
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => barObserver.observe(bar));
}