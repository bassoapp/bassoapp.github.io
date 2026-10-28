(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // The static HTML uses evening. Match the app's local-time buckets.
  const updateScene = () => {
    const hour = new Date().getHours();
    const time = hour >= 5 && hour < 12 ? 'morning'
      : hour >= 12 && hour < 17 ? 'afternoon'
      : hour >= 17 && hour < 21 ? 'evening' : 'night';
    // The app itself greets with "Good evening" at night.
    const greeting = time === 'night' ? 'Good evening' : `Good ${time}`;
    const scene = document.querySelector('[data-today-scene]');
    const phone = document.querySelector('[data-today-phone]');
    const descriptions = {
      morning: 'at sunrise', afternoon: 'in the afternoon sun',
      evening: 'at sunset', night: 'under a moonlit sky',
    };
    document.querySelector('[data-greeting]').textContent = greeting;
    scene.src = `assets/art/today-${time}.webp`;
    scene.alt = `Basso the lion on a balcony above a Mediterranean town ${descriptions[time]}.`;
    phone.src = `assets/screens/${time === 'evening' ? 'today' : `today-${time}`}.webp`;
    phone.alt = `Basso Today screen with the ${time} scene, a session card and example pitch data.`;
  };
  updateScene();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateScene();
  });

  // Navigation is fully visible without JS. Mobile JS adds disclosure behavior.
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const mobile = window.matchMedia('(max-width: 900px)');
  const setMenu = (open, restoreFocus = false) => {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.querySelector('span').textContent = open ? '−' : '+';
    navigation.hidden = mobile.matches && !open;
    if (restoreFocus) menu.focus();
  };
  const syncMenu = () => {
    menu.hidden = !mobile.matches;
    setMenu(false);
  };
  syncMenu();
  mobile.addEventListener('change', syncMenu);
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (mobile.matches && !event.target.closest('.site-header')) setMenu(false);
  });

  // Native horizontal scrolling also works without these optional controls.
  const gallery = document.querySelector('#screen-gallery');
  const previous = document.querySelector('[data-gallery-prev]');
  const next = document.querySelector('[data-gallery-next]');
  document.querySelector('.gallery-controls').hidden = false;
  const updateGallery = () => {
    previous.disabled = gallery.scrollLeft <= 2;
    next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
  };
  const moveGallery = direction => gallery.scrollBy({
    left: direction * (gallery.querySelector('.screen-card').getBoundingClientRect().width
      + parseFloat(getComputedStyle(gallery).gap)),
    behavior: reducedMotion.matches ? 'instant' : 'smooth',
  });
  previous.addEventListener('click', () => moveGallery(-1));
  next.addEventListener('click', () => moveGallery(1));
  gallery.addEventListener('scroll', updateGallery, { passive: true });
  window.addEventListener('resize', updateGallery, { passive: true });
  updateGallery();

  // Reveal only offscreen content, and never hide content without an observer.
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(item => {
      if (item.getBoundingClientRect().top > window.innerHeight) item.classList.add('will-reveal');
      observer.observe(item);
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        revealItems.forEach(item => item.classList.remove('will-reveal'));
        observer.disconnect();
      }
    });
  }

  // The marker climbs as this section passes through the viewport.
  const journey = document.querySelector('[data-journey]');
  const marker = document.querySelector('[data-trail-marker]');
  let framePending = false;
  const updateMarker = () => {
    framePending = false;
    if (reducedMotion.matches) {
      marker.style.top = '94%';
      marker.style.left = '50%';
      return;
    }
    const rect = journey.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * .75 - rect.top) / (rect.height + innerHeight * .25)));
    marker.style.top = `${94 - progress * 88}%`;
    marker.style.left = `${50 + Math.sin(progress * Math.PI * 6) * 14}%`;
  };
  const requestMarker = () => {
    if (!framePending) { framePending = true; requestAnimationFrame(updateMarker); }
  };
  window.addEventListener('scroll', requestMarker, { passive: true });
  window.addEventListener('resize', requestMarker, { passive: true });
  reducedMotion.addEventListener('change', requestMarker);
  updateMarker();
})();
