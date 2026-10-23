(() => {
  const canvas = document.querySelector('[data-particles]');
  if (!canvas) return;

  const context = canvas.getContext('2d', { alpha: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const points = [];
  let frameId = 0;
  let width = 0;
  let height = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    points.length = 0;
    const count = Math.min(46, Math.max(18, Math.round(width / 34)));
    for (let i = 0; i < count; i += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.1 + 0.35,
        speedX: (Math.random() - 0.5) * 0.12,
        speedY: (Math.random() - 0.5) * 0.09,
        alpha: Math.random() * 0.32 + 0.12,
      });
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      if (!reduceMotion.matches) {
        p.x = (p.x + p.speedX + width + 16) % (width + 16);
        p.y = (p.y + p.speedY + height + 16) % (height + 16);
      }
      context.beginPath();
      context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 201, 120, ${p.alpha})`;
      context.fill();
      for (let j = i + 1; j < points.length; j += 1) {
        const q = points[j];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance > 118) continue;
        context.beginPath();
        context.moveTo(p.x, p.y);
        context.lineTo(q.x, q.y);
        context.strokeStyle = `rgba(200, 96, 28, ${(1 - distance / 118) * 0.12})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
    }
    frameId = window.requestAnimationFrame(draw);
  };

  let timer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(resize, 120);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.cancelAnimationFrame(frameId);
    else draw();
  });

  resize();
  draw();
})();
