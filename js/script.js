/* =========================================================
   Laura Menezes — Portfólio
   script.js — interações em JavaScript puro
   ========================================================= */

/**
 * Ao entrar no site (ou recarregar a página) sem um link direto pra outra
 * seção, a primeira tela deve mostrar a hero — não uma posição de scroll
 * deixada pelo navegador. Dois navegadores restauram scroll por conta
 * própria em cenários assim: (1) "scroll restoration" do histórico, que
 * reaplica a posição rolada de antes de um reload/voltar; (2) o scroll
 * nativo até uma âncora, quando a URL já contém #inicio (ex.: depois de
 * clicar em "Início", ver initHomeLinks() abaixo, que atualiza a URL).
 * Desativamos a restauração automática e forçamos o topo sempre que não
 * há um hash apontando pra outra seção específica (#projetos, #sobre etc.,
 * esses continuam funcionando normalmente como link direto).
 */
(function ensureHeroIsFirstScreen() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const goToTop = () => {
    const hash = window.location.hash;
    if (!hash || hash === '#inicio') {
      window.scrollTo(0, 0);
    }
  };

  goToTop();
  window.addEventListener('load', goToTop);
})();

document.addEventListener('DOMContentLoaded', () => {
  initLanguageToggle();
  initMobileNav();
  initActiveNavOnScroll();
  initTimelineCardToggle();
  initSwatchCycles();
  initHomeLinks();
  initSidebarLinks();
  initLightbox();
  initSidebarStop();
  initCollapsibleSections();
  initProjectCardSpotlight();
  initDensityToggle();
  initScrollTopButton();
});

/**
 * "Hover simulado" dos cards de projeto pro mobile — sem mouse não existe
 * :hover pra revelar a variante com as telas "em leque" e escurecer o
 * título. Em vez disso, o card que estiver cruzando o centro vertical da
 * tela durante o scroll ganha a classe is-in-view, que dispara exatamente
 * as mesmas regras CSS do :hover (só ativas dentro do breakpoint mobile —
 * no desktop a classe pode até ser adicionada, mas o CSS a ignora).
 */
function initProjectCardSpotlight() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting);
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  cards.forEach((card) => observer.observe(card));
}

/**
 * Seções recolhíveis dos cases (mobile) — cada .cs-section (exceto a
 * introdução, que não tem esse wrapper) abre/fecha ao clicar no header
 * (eyebrow+h2). No desktop o CSS ignora a classe is-open e mantém o corpo
 * sempre visível, então isto é inofensivo lá — só visualmente ativo no
 * breakpoint mobile.
 */
function initCollapsibleSections() {
  const headers = document.querySelectorAll('.cs-section__header');
  if (!headers.length) return;

  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const section = header.closest('.cs-section');
      const isOpen = section.classList.toggle('is-open');
      header.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

/**
 * Toggle "Compacto"/"Completo" da sidebar (desktop, widget do Figma node
 * 6874:1674) — liga/desliga .is-compact no body, que reaproveita o mesmo
 * par de spans .cs-title-full/.cs-title-short já usado pro resumo
 * automático no mobile (ver CSS). "Completo" é o estado inicial porque já
 * é o comportamento padrão do desktop antes deste widget existir.
 */
function initDensityToggle() {
  // Pode haver mais de uma instância na página (o widget da sidebar no
  // desktop e a cópia dentro do menu hambúrguer no mobile) — todas
  // precisam refletir a mesma densidade selecionada, então o clique em
  // qualquer botão de qualquer instância atualiza todas juntas.
  const buttons = document.querySelectorAll('.cs-density-toggle__btn');
  if (!buttons.length) return;

  const applyDensity = (density) => {
    buttons.forEach((btn) => {
      const active = btn.dataset.density === density;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    // "is-compact" força o texto resumido mesmo no desktop; "is-complete"
    // força o texto completo mesmo no mobile (onde ele normalmente vem
    // resumido por padrão, via media query). Sem nenhuma das duas classes,
    // cada tamanho de tela usa seu próprio padrão (completo no desktop,
    // resumido no mobile).
    document.body.classList.toggle('is-compact', density === 'compacto');
    document.body.classList.toggle('is-complete', density === 'completo');
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => applyDensity(button.dataset.density));
  });
}

/**
 * Botão flutuante "voltar ao topo" — some enquanto a pessoa está na hero
 * (Home) ou na introdução (páginas de case) e aparece assim que ela rola
 * pra qualquer seção depois dessas. Em vez de observar a hero/introdução
 * diretamente (a hero é position:sticky, então seu retângulo praticamente
 * nunca "sai" da tela — mesmo problema já resolvido em
 * initActiveNavOnScroll), mede a posição estática (não afetada por
 * sticky) da seção seguinte e compara com o scroll atual.
 */
function initScrollTopButton() {
  const button = document.querySelector('.scroll-top-btn');
  if (!button) return;

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const boundary = document.querySelector('#projetos, .cs-section');
  if (!boundary) return;

  let threshold = 0;

  const measureThreshold = () => {
    threshold = boundary.getBoundingClientRect().top + window.scrollY;
  };

  const updateVisibility = () => {
    button.classList.toggle('is-visible', window.scrollY > threshold - 1);
  };

  measureThreshold();
  updateVisibility();

  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', () => {
    measureThreshold();
    updateVisibility();
  });
}

/**
 * Alterna o estado visual do seletor de idioma PT/EN.
 */
function initLanguageToggle() {
  // Pode haver mais de uma instância na página (a do header, escondida no
  // mobile, e a duplicada dentro do menu hambúrguer) — todas precisam
  // refletir o mesmo idioma selecionado, então o clique em qualquer botão
  // de qualquer instância atualiza todas juntas em vez de só a instância
  // clicada.
  const toggles = document.querySelectorAll('.lang-toggle');
  if (!toggles.length) return;

  const applyLang = (lang) => {
    toggles.forEach((toggle) => {
      toggle.querySelectorAll('.lang-toggle__code').forEach((btn) => {
        const isActive = btn.dataset.lang === lang;
        btn.setAttribute('aria-pressed', String(isActive));
        btn.classList.toggle('lang-toggle__code--muted', !isActive);
      });
    });
  };

  toggles.forEach((toggle) => {
    toggle.querySelectorAll('.lang-toggle__code').forEach((btn) => {
      btn.addEventListener('click', () => applyLang(btn.dataset.lang));
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
 * Links "Início" (logo do header e item do menu) apontam para #inicio, que
 * fica na própria .hero (que é position:sticky, ver comentário em main >
 * section no CSS). O scroll
 * nativo do navegador até uma âncora, quando o alvo é seguido de perto por
 * um elemento sticky, pode se comportar de forma inconsistente entre
 * navegadores/situações (ex.: cálculo relativo ao invés de absoluto).
 * Para garantir 100% de confiabilidade, tratamos esses links explicitamente
 * e rolamos para o topo da página via JS, em vez de depender do
 * comportamento nativo de âncora.
 */
function initHomeLinks() {
  const homeLinks = document.querySelectorAll('a[href="#inicio"]');
  if (!homeLinks.length) return;

  homeLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (history.pushState) {
        history.pushState(null, '', '#inicio');
      } else {
        window.location.hash = 'inicio';
      }
    });
  });
}

/**
 * Sumário lateral das páginas de estudo de caso (.cs-sidebar__link) — mesmo
 * problema descrito em initHomeLinks() acima: a .cs-sidebar fica
 * position:fixed (ou sticky, fora do fluxo) ao lado de conteúdo com header
 * sticky, e o scroll nativo do navegador até a âncora (clique em <a href="#id">)
 * mostrou-se pouco confiável nesse cenário — o hash da URL é atualizado, mas
 * a rolagem até a seção às vezes não acontece. Por isso tratamos o clique
 * explicitamente aqui também, usando scrollToElement() (abaixo) para já
 * respeitar o espaço do header sticky (via scroll-margin-top) em vez de
 * depender do comportamento nativo de âncora.
 */
function initSidebarLinks() {
  // Inclui também CTAs de conteúdo que apontam para uma seção da própria
  // página (ex.: botão "Ver resultado" da Introdução, Programação
  // Criativa) — sem isso eles caem no scroll nativo do navegador, que se
  // mostrou pouco confiável neste layout (ver comentário abaixo).
  const links = document.querySelectorAll('.cs-sidebar__link, .cs-content a[href^="#"]');
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      if (history.pushState) {
        history.pushState(null, '', `#${id}`);
      } else {
        window.location.hash = id;
      }
      scrollToElement(target);
    });
  });
}

/**
 * Rola suavemente até `target`, respeitando seu scroll-margin-top — e, ao
 * contrário de um único window.scrollTo(destino fixo calculado uma vez),
 * recalcula o destino A CADA FRAME da animação.
 *
 * Por quê: as páginas de estudo de caso têm muitas imagens com
 * loading="lazy" e sem width/height reservado. Ao entrar na página e clicar
 * logo na ÚLTIMA seção do sumário, a rolagem passa por imagens ainda não
 * carregadas; conforme elas carregam, o documento cresce em altura (empurra
 * o conteúdo abaixo para baixo). Um destino fixo, calculado só no instante
 * do clique, fica desatualizado por esse crescimento e a rolagem parava
 * numa seção do meio em vez da seção realmente clicada. Recalcular o
 * destino a cada frame corrige isso automaticamente, convergindo sempre
 * para a posição real e atual do elemento.
 */
function scrollToElement(target, duration = 500) {
  const getTargetY = () => {
    const scrollMarginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const rawTarget = target.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
    return Math.min(Math.max(rawTarget, 0), Math.max(maxScroll, 0));
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    window.scrollTo({ top: getTargetY(), left: 0, behavior: 'instant' });
    return;
  }

  const startY = window.scrollY;
  const startTime = performance.now();
  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = easeInOutQuad(progress);
    const currentTargetY = getTargetY();
    const nextY = startY + (currentTargetY - startY) * eased;
    window.scrollTo({ top: nextY, left: 0, behavior: 'instant' });

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      window.scrollTo({ top: getTargetY(), left: 0, behavior: 'instant' });
    }
  }

  requestAnimationFrame(step);
}

/**
 * Marca o item de navegação correspondente à seção visível como ativo.
 * Cobre tanto o menu principal do header (.site-nav__link, via aria-current)
 * quanto o sumário lateral das páginas de estudo de caso (.cs-sidebar__link, via .is-active).
 */
function initActiveNavOnScroll() {
  // A .hero fica de fora: ela é position:sticky, então seu retângulo
  // praticamente nunca deixa de cruzar a faixa central da viewport (fica
  // "grudada" no topo enquanto as seções seguintes avançam por cima dela —
  // ver comentário em "Interação de rolagem do protótipo"). Isso significa
  // que o IntersectionObserver nunca dispara uma transição pra "false" nela,
  // então "Início" nunca seria reativado ao rolar de volta pro topo. Em vez
  // de observar a .hero, ela vira o fallback: sempre que nenhuma das seções
  // reais abaixo estiver cruzando a faixa central, o item ativo cai pra
  // "Início" (ver isAnySectionActive/updateActiveId abaixo).
  const sections = document.querySelectorAll('main section[id]:not(.hero)');
  const navLinks = document.querySelectorAll('.site-nav__link');
  const sidebarLinks = document.querySelectorAll('.cs-sidebar__link');
  if (!navLinks.length && !sidebarLinks.length) return;

  const applyActive = (id) => {
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
  };

  if (!sections.length) {
    applyActive('inicio');
    return;
  }

  const intersecting = new Map();
  sections.forEach((section) => intersecting.set(section.id, false));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        intersecting.set(entry.target.id, entry.isIntersecting);
      });

      const activeSection = [...sections].find((section) => intersecting.get(section.id));
      applyActive(activeSection ? activeSection.id : 'inicio');
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

/**
 * Sidebar das páginas de estudo de caso (.cs-sidebar) — em telas largas ela
 * fica position:fixed e centralizada verticalmente no viewport (ver CSS,
 * ".page-design-system .cs-sidebar" etc.), acompanhando o scroll do zero até
 * o fim da página. Isso faz com que, perto do final do case, ela se sobreponha
 * ao parágrafo final ".cs-thanks" ("Obrigada por ler até aqui :)") e ao rodapé.
 * Aqui recalculamos, a cada scroll/resize, a posição em que a sidebar (ainda
 * fixa) colidiria com esse limite; quando isso ocorre, trocamos para
 * position:absolute (classe .is-stopped, ancorada em .cs-layout, que é
 * position:relative) num "top" calculado para que a troca não gere nenhum
 * salto visual — a sidebar simplesmente para de acompanhar o viewport e passa
 * a rolar junto com o conteúdo, ficando "estacionada" logo acima do texto de
 * agradecimento. Ao rolar de volta para cima, o cálculo se inverte e ela volta
 * a ser fixa normalmente. Só se aplica na largura em que a sidebar é fixa
 * (>1200px, mesmo breakpoint do CSS); abaixo disso a sidebar é estática no
 * fluxo normal e esta função não faz nada.
 */
function initSidebarStop() {
  const layout = document.querySelector('.cs-layout');
  const sidebar = document.querySelector('.cs-sidebar');
  const thanks = document.querySelector('.cs-thanks');
  if (!layout || !sidebar || !thanks) return;

  const desktopQuery = window.matchMedia('(min-width: 1201px)');
  const headerHeight = 80; // mantido em sincronia com --header-height no CSS
  const stopGap = 40; // respiro entre o fim da sidebar e o texto de agradecimento

  const update = () => {
    if (!desktopQuery.matches) {
      sidebar.classList.remove('is-stopped');
      sidebar.style.removeProperty('--sidebar-stop-top');
      return;
    }

    const layoutTop = layout.getBoundingClientRect().top + window.scrollY;
    const sidebarHeight = sidebar.offsetHeight;
    const fixedViewportTop = window.innerHeight / 2 + headerHeight / 2 - sidebarHeight / 2;
    const sidebarDocBottom = window.scrollY + fixedViewportTop + sidebarHeight;

    const thanksDocTop = thanks.getBoundingClientRect().top + window.scrollY;
    const stopBottomLimit = thanksDocTop - stopGap;

    if (sidebarDocBottom >= stopBottomLimit) {
      const stopTop = Math.max(stopBottomLimit - sidebarHeight - layoutTop, 0);
      sidebar.classList.add('is-stopped');
      sidebar.style.setProperty('--sidebar-stop-top', `${stopTop}px`);
    } else {
      sidebar.classList.remove('is-stopped');
      sidebar.style.removeProperty('--sidebar-stop-top');
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', update);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(update);
  }
  window.addEventListener('load', update);

  update();
}

/**
 * Lightbox — ao clicar em uma imagem de painel do case (.cs-panel img), abre
 * a mesma imagem ampliada em um overlay, permitindo enxergar melhor os
 * detalhes. Fecha ao clicar fora, no X ou pressionando Esc.
 *
 * Também cobre os painéis "vivos" de escala de cores/theme mapping
 * (.cs-swatch-panel, que anima como um GIF via initSwatchCycles) e os
 * painéis de tokens (.cs-token-panel, tipografia e raio de canto): como
 * nenhum desses é uma <img>, ao clicar clonamos o painel (com o conteúdo
 * atual) para dentro do overlay, ampliado do mesmo jeito que as imagens.
 */
function initLightbox() {
  // Padrão único para TODAS as imagens de conteúdo dos cases (painéis e
  // fotos de contexto) — ícones de UI e imagens dentro de links (cards de
  // projeto) ficam de fora de propósito, já que clicar neles precisa
  // continuar navegando/acionando o botão em vez de abrir o lightbox.
  // .cs-demo-window (gifs recortados de #construcao, Programação Criativa)
  // fica de fora de `images` e entra em `cloneTargets`: clicar nele deve
  // ampliar só o recorte visível (como no Figma), não o gif inteiro —
  // abrir a <img> direto mostraria o gif completo sem o corte.
  const images = document.querySelectorAll('.cs-panel img:not(.cs-demo-window img), .cs-context-panel__img');
  const cloneTargets = document.querySelectorAll('.cs-swatch-panel, .cs-token-panel, .cs-demo-window');
  if (!images.length && !cloneTargets.length) return;

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;
  let zoom = ZOOM_MIN;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <button type="button" class="lightbox__close" aria-label="Fechar imagem ampliada">
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
    <div class="lightbox__viewport">
      <div class="lightbox__content"></div>
    </div>
    <div class="lightbox__zoom-menu" role="group" aria-label="Controles de zoom">
      <button type="button" class="lightbox__zoom-btn" data-zoom-action="in" aria-label="Aumentar zoom">+</button>
      <button type="button" class="lightbox__zoom-btn lightbox__zoom-level" data-zoom-action="reset" aria-label="Redefinir zoom para 100%">100%</button>
      <button type="button" class="lightbox__zoom-btn" data-zoom-action="out" aria-label="Diminuir zoom">&minus;</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const viewport = overlay.querySelector('.lightbox__viewport');
  const content = overlay.querySelector('.lightbox__content');
  const closeBtn = overlay.querySelector('.lightbox__close');
  const zoomMenu = overlay.querySelector('.lightbox__zoom-menu');
  const zoomInBtn = overlay.querySelector('[data-zoom-action="in"]');
  const zoomOutBtn = overlay.querySelector('[data-zoom-action="out"]');
  const zoomResetBtn = overlay.querySelector('[data-zoom-action="reset"]');
  const zoomLevelLabel = zoomResetBtn;
  let lastFocused = null;

  const applyZoom = () => {
    content.style.transform = zoom === 1 ? '' : `scale(${zoom})`;
    zoomLevelLabel.textContent = `${Math.round(zoom * 100)}%`;
    zoomInBtn.disabled = zoom >= ZOOM_MAX;
    zoomOutBtn.disabled = zoom <= ZOOM_MIN;
  };

  const setZoom = (value) => {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
    applyZoom();
  };

  const resetZoom = () => {
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
    setZoom(ZOOM_MIN);
  };

  const close = () => {
    overlay.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    content.innerHTML = '';
    if (lastFocused) lastFocused.focus();
  };

  const openImage = (img) => {
    lastFocused = document.activeElement;
    content.innerHTML = '';
    const bigImg = document.createElement('img');
    bigImg.className = 'lightbox__img';
    bigImg.src = img.currentSrc || img.src;
    bigImg.alt = img.alt || '';
    content.appendChild(bigImg);
    resetZoom();
    overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  };

  const openClone = (el) => {
    lastFocused = document.activeElement;
    content.innerHTML = '';
    const clone = el.cloneNode(true);
    clone.classList.add('lightbox__clone');
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    clone.removeAttribute('aria-label');
    content.appendChild(clone);
    resetZoom();
    overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  };

  images.forEach((img) => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Ampliar imagem: ${img.alt || 'imagem do case'}`);

    img.addEventListener('click', () => openImage(img));
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImage(img);
      }
    });
  });

  cloneTargets.forEach((el) => {
    el.classList.add('is-zoomable');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Ampliar');

    el.addEventListener('click', () => openClone(el));
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openClone(el);
      }
    });
  });

  zoomInBtn.addEventListener('click', () => setZoom(zoom + ZOOM_STEP));
  zoomOutBtn.addEventListener('click', () => setZoom(zoom - ZOOM_STEP));
  zoomResetBtn.addEventListener('click', resetZoom);
  zoomMenu.addEventListener('click', (event) => event.stopPropagation());

  viewport.addEventListener(
    'wheel',
    (event) => {
      if (!overlay.classList.contains('is-open')) return;
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    },
    { passive: false }
  );

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target === viewport) close();
  });
  document.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === '+' || event.key === '=') setZoom(zoom + ZOOM_STEP);
    if (event.key === '-' || event.key === '_') setZoom(zoom - ZOOM_STEP);
    if (event.key === '0') resetZoom();
  });
}
