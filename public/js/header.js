// 헤더 스크롤 효과와 모바일 메뉴 열기/닫기
import { DESKTOP_MEDIA_QUERY, HEADER_SOLID_OFFSET, MENU_LABELS } from './constants.js';

export function initHeader(el) {
  const header = el['site-header'];
  const menuButton = el['menu-button'];

  function updateScroll() {
    if (window.scrollY > HEADER_SOLID_OFFSET) {
      header.classList.add('site-header--solid');
    } else {
      header.classList.remove('site-header--solid');
    }
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  function openMenu() {
    header.classList.add('site-header--menu-open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', MENU_LABELS.close);
  }

  function closeMenu() {
    header.classList.remove('site-header--menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', MENU_LABELS.open);
  }

  menuButton.addEventListener('click', () => {
    const isOpen = header.classList.contains('site-header--menu-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  const links = header.querySelectorAll('a');
  for (const link of links) {
    link.addEventListener('click', () => {
      closeMenu();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('site-header--menu-open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mql.addEventListener('change', (e) => {
    if (e.matches) {
      closeMenu();
    }
  });
}
