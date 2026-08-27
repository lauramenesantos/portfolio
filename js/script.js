/* =========================================================
   Laura Menezes — Portfólio
   script.js — interações em JavaScript puro
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageToggle();
  initMobileNav();
  initActiveNavOnScroll();
  initTimelineCardToggle();
  initSwatchCycles();
});

/**
 * Alterna o estado visual do seletor de idioma PT/EN.
 */
function initLanguageToggle() {
  const buttons = document.querySelectorAll('.lang-toggle__code');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => {
        const isActive = btn === button;
        btn.setAttribute('aria-pressed', String(isActive));
        btn.classList.toggle('lang-toggle__code--muted', !isActive);
      });
    });
  });
}

/**
 * Menu mobile (hambúrguer) — mostra/esconde a navegação em telas pequenas.
 */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.site-nav__list');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('site-nav__list--open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('site-nav__list--open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Marca o item de navegação correspondente à seção visível como ativo.
 * Cobre tanto o menu principal do header (.site-nav__link, via aria-current)
 * quanto o sumário lateral das páginas de estudo de caso (.cs-sidebar__link, via .is-active).
 */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('main section[id], main[id]');
  const navLinks = document.querySelectorAll('.site-nav__link');
  const sidebarLinks = document.querySelectorAll('.cs-sidebar__link');
  if (!sections.length || (!navLinks.length && !sidebarLinks.length)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');

        navLinks.forEach((link) => {
          const matches = link.getAttribute('href') === `#${id}`;
          if (matches) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        });

        sidebarLinks.forEach((link) => {
          const matches = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('is-active', matches);
        });
      });
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * Cards de "Trajetória profissional" — no hover (desktop) ou clique/toque
 * (mobile), o card revela a lista de responsabilidades no lugar da colagem
 * de imagens, conforme a variante "Hover/Click" definida no Figma.
 * O clique alterna (toggle) a classe .is-active, permitindo "fixar" o
 * estado revelado em telas sem hover (touch) e fechar clicando novamente
 * ou clicando fora do card.
 */
function initTimelineCardToggle() {
  const cards = document.querySelectorAll('.timeline-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const willActivate = !card.classList.contains('is-active');
      cards.forEach((c) => c.classList.remove('is-active'));
      if (willActivate) card.classList.add('is-active');
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.timeline-card')) {
      cards.forEach((c) => c.classList.remove('is-active'));
    }
  });
}

/**
 * Swatches "Escala de cores" e "Theme mapping" (página Design System) —
 * no Figma essas telas são exibidas como um GIF alternando entre as
 * variações do componente. Aqui reproduzimos o mesmo efeito trocando os
 * valores (cor + hex) dos cartões a cada intervalo, com um leve fade.
 * Respeita prefers-reduced-motion, mostrando apenas o primeiro quadro.
 */
function initSwatchCycles() {
  const cycleEls = document.querySelectorAll('[data-cycle]');
  if (!cycleEls.length) return;

  const datasets = {
    palette: [
      { name: 'Neutral dark', colors: ['#252E3F', '#2F3A4F', '#3A465E', '#47546E', '#5F6D86', '#8A96AA', '#C2CAD6'] },
      { name: 'Neutral light', colors: ['#FAFBFC', '#F5F7F9', '#EDF1F5', '#E4E9EF', '#D3DAE3', '#B8C2CF', '#98A6B8'] },
      { name: 'Primary', colors: ['#D7EBF2', '#B5D9E5', '#8EC4D6', '#5FA9C4', '#2F7F9E', '#25657E', '#1E4E61'] },
      { name: 'Warning', colors: ['#FFF3EA', '#FCDDC8', '#F8BE94', '#F39E5E', '#FF7D21', '#C7631A', '#924813'] },
      { name: 'Highlight', colors: ['#FFF7E8', '#FCEACB', '#F7D89E', '#EFC36F', '#FFC14F', '#C89A3F', '#94712F'] },
      { name: 'Success', colors: ['#F1F7F3', '#DCEDE3', '#B8DAC8', '#8FC4AA', '#6BBD87', '#4F9A6B', '#3A7350'] },
      { name: 'Error', colors: ['#FBECEC', '#F5D2D4', '#EFA6AA', '#E97A80', '#EB1927', '#B7151F', '#851017'] },
    ],
    theme: [
      { name: 'Color-01', colors: ['#FAFBFC', '#252E3F'] },
      { name: 'Color-02', colors: ['#F5F7F9', '#2F3A4F'] },
      { name: 'Color-03', colors: ['#EDF1F5', '#3A465E'] },
      { name: 'Color-04', colors: ['#E4E9EF', '#47546E'] },
      { name: 'Color-05', colors: ['#D3DAE3', '#5F6D86'] },
      { name: 'Color-06', colors: ['#B8C2CF', '#8A96AA'] },
      { name: 'Color-07', colors: ['#98A6B8', '#C2CAD6'] },
    ],
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cycleEls.forEach((cycleEl) => {
    const frames = datasets[cycleEl.dataset.cycle];
    if (!frames || !frames.length) return;

    const labelEl = cycleEl.querySelector('[data-cycle-label]');
    const nameEls = cycleEl.querySelectorAll('[data-cycle-name]');
    const blockEls = cycleEl.querySelectorAll('[data-cycle-block]');
    const hexEls = cycleEl.querySelectorAll('[data-cycle-hex]');

    const render = (frame) => {
      if (labelEl) labelEl.textContent = frame.name;
      nameEls.forEach((el) => { el.textContent = frame.name; });
      frame.colors.forEach((hex, i) => {
        if (blockEls[i]) blockEls[i].style.backgroundColor = hex;
        if (hexEls[i]) hexEls[i].textContent = hex;
      });
    };

    render(frames[0]);

    if (prefersReducedMotion || frames.length < 2) return;

    let index = 0;
    setInterval(() => {
      index = (index + 1) % frames.length;
      cycleEl.classList.add('is-fading');
      setTimeout(() => {
        render(frames[index]);
        cycleEl.classList.remove('is-fading');
      }, 220);
    }, 2600);
  });
}
