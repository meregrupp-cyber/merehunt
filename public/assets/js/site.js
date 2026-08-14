(() => {
  'use strict';

  const drawer = document.querySelector('.nav-drawer');
  if (!drawer) return;

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => drawer.removeAttribute('open'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.open) {
      drawer.removeAttribute('open');
      drawer.querySelector('summary')?.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (drawer.open && !drawer.contains(event.target)) drawer.removeAttribute('open');
  });
})();
