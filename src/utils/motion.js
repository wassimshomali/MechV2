export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function staggerIn(selector, { baseDelay = 50, duration = 250 } = {}) {
  if (prefersReducedMotion()) {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.opacity = '1';
    });
    return;
  }

  document.querySelectorAll(selector).forEach((el, index) => {
    el.style.animationDelay = `${index * baseDelay}ms`;
    el.style.animationDuration = `${duration}ms`;
  });
}

export function replaceIcons() {
  if (window.feather) {
    window.feather.replace({ width: 18, height: 18 });
  }
}
