(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('[data-site-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-site-nav]');

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && navigation) {
    const setOpen = (open) => {
      menuButton.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('is-open', open);
    };
    menuButton.addEventListener('click', () => setOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', (event) => event.target.closest('a') && setOpen(false));
    document.addEventListener('keydown', (event) => event.key === 'Escape' && setOpen(false));
    window.addEventListener('resize', () => window.innerWidth > 840 && setOpen(false));
  }

  const items = [...document.querySelectorAll('[data-reveal]')];
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    );
    items.forEach((item) => observer.observe(item));
  }

  const scene = document.querySelector('[data-phone-scene]');
  if (scene && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    scene.addEventListener('pointermove', (event) => {
      const rect = scene.getBoundingClientRect();
      scene.style.setProperty('--scene-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 5}deg`);
      scene.style.setProperty('--scene-y', `${((event.clientY - rect.top) / rect.height - 0.5) * -4}deg`);
    });
    scene.addEventListener('pointerleave', () => {
      scene.style.setProperty('--scene-x', '0deg');
      scene.style.setProperty('--scene-y', '0deg');
    });
  }

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
