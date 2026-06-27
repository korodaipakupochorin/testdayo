(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.getElementById('site-header');
  const menuButton = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 60);
  };

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
    mobileMenu.hidden = true;
    mobileMenu.classList.remove('is-opening');
    header?.classList.remove('is-menu-open');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'メニューを閉じる');
    mobileMenu.hidden = false;
    mobileMenu.classList.remove('is-opening');
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add('is-opening');
    header?.classList.add('is-menu-open');
    document.body.classList.add('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  document.querySelectorAll('.js-scroll').forEach((button) => {
    button.addEventListener('click', () => {
      const selector = button.getAttribute('data-target');
      const target = selector ? document.querySelector(selector) : null;
      closeMenu();
      if (!target) return;

      const headerOffset = header?.offsetHeight ?? 0;
      const destination = target.getBoundingClientRect().top + window.scrollY - headerOffset + 1;
      window.scrollTo({
        top: destination,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });

  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  updateHeader();

  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((element) => {
    const delay = Number(element.getAttribute('data-delay') || 0);
    element.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -80px', threshold: 0.08 },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

  const animateCounter = (element) => {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';

    const target = Number(element.dataset.target || 0);
    const suffix = element.dataset.suffix || '';

    if (prefersReducedMotion) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1600;
    const startTime = performance.now();

    const frame = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const current = Math.round(target * easeOutCubic(progress));
      element.textContent = `${current}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    contactForm.hidden = true;
    if (formSuccess) {
      formSuccess.hidden = false;
      formSuccess.focus({ preventScroll: true });
      formSuccess.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    }
  });

  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.alt = `${image.alt || '画像'}（読み込みに失敗しました）`;
      image.style.background = '#d0ccc4';
      image.style.minHeight = '240px';
      image.removeAttribute('src');
    }, { once: true });
  });
})();
