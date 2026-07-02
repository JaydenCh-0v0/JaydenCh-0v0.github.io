const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const languageToggle = document.getElementById('language-toggle');
const languageMenu = document.getElementById('language-menu');
const languageOptions = document.querySelectorAll('.language-option');
const themeToggle = document.getElementById('theme-toggle');

const HTML_KEYS = new Set(['hero.title', 'footer.copyright']);
let currentLang = localStorage.getItem('lang') || 'en';
let i18nData = {};

function getNestedValue(obj, path) {
    return path.split('.').reduce((value, key) => {
        if (value && typeof value === 'object' && key in value) {
            return value[key];
        }
        return undefined;
    }, obj);
}

function applyTranslations(data) {
    i18nData = data;
    document.title = data.pageTitle;
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        if (element.hasAttribute('data-typewriter')) return;
        const keyPath = element.getAttribute('data-i18n-key');
        const value = getNestedValue(data, keyPath);
        if (value === undefined) return;

        if (HTML_KEYS.has(keyPath)) {
            element.innerHTML = value;
        } else {
            element.textContent = value;
        }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const keyPath = element.getAttribute('data-i18n-aria');
        const value = getNestedValue(data, keyPath);
        if (value) element.setAttribute('aria-label', value);
    });

    updateThemeToggleLabel();
    initTypewriters();
}

function playTypewriter(el, text) {
    clearTimeout(el._typewriterTimer);
    el.classList.remove('done');
    el.textContent = '';

    if (!text) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = text;
        return;
    }

    el.classList.add('typing');
    let index = 0;

    const step = () => {
        el.textContent = text.slice(0, index);
        index += 1;

        if (index <= text.length) {
            el._typewriterTimer = setTimeout(step, 55);
        } else {
            el.classList.remove('typing');
            el.classList.add('done');
        }
    };

    step();
}

function initTypewriters() {
    document.querySelectorAll('[data-typewriter]').forEach(el => {
        const keyPath = el.getAttribute('data-i18n-key');
        const text = getNestedValue(i18nData, keyPath) || '';

        if (!el._typewriterReady) {
            el._typewriterReady = true;
            const section = el.closest('section');

            if (!section) {
                playTypewriter(el, text);
                return;
            }

            const observer = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return;
                playTypewriter(el, getNestedValue(i18nData, keyPath) || '');
                el._typewriterPlayed = true;
                observer.disconnect();
            }, { threshold: 0.25 });

            observer.observe(section);
            return;
        }

        if (el._typewriterPlayed) {
            playTypewriter(el, text);
        }
    });
}

function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

function updateThemeToggleLabel() {
    if (!themeToggle) return;
    const isDark = getCurrentTheme() === 'dark';
    const key = isDark ? 'theme.toLight' : 'theme.toDark';
    const label = getNestedValue(i18nData, key);
    if (label) themeToggle.setAttribute('aria-label', label);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleLabel();
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
    });
}

updateThemeToggleLabel();

function loadLanguage(lang) {
    return fetch(`locales/${lang}.json`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            return response.json();
        })
        .then(applyTranslations)
        .catch(error => console.error('Error loading language file:', error));
}

function setActiveLanguageOption(lang) {
    languageOptions.forEach(option => {
        option.classList.toggle('is-active', option.dataset.lang === lang);
    });
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    setActiveLanguageOption(lang);
    return loadLanguage(lang);
}

function closeLanguageMenu() {
    if (!languageMenu || !languageToggle) return;
    languageMenu.hidden = true;
    languageToggle.setAttribute('aria-expanded', 'false');
}

if (languageToggle && languageMenu) {
    languageToggle.addEventListener('click', e => {
        e.stopPropagation();
        const willOpen = languageMenu.hidden;
        languageMenu.hidden = !willOpen;
        languageToggle.setAttribute('aria-expanded', String(willOpen));
    });

    languageMenu.addEventListener('click', e => e.stopPropagation());

    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            setLanguage(option.dataset.lang);
            closeLanguageMenu();
        });
    });

    document.addEventListener('click', closeLanguageMenu);
}

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 16px rgba(15, 23, 42, 0.08)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
});

const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.project-card, .skill-category, .highlight-card').forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
});

setLanguage(currentLang);

function initCollapsibles() {
    document.querySelectorAll('.collapse-item').forEach(item => {
        const trigger = item.querySelector('.collapse-trigger');
        const panel = item.querySelector('.collapse-panel');
        if (!trigger || !panel) return;

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', String(isOpen));
            panel.setAttribute('aria-hidden', String(!isOpen));
        });
    });
}

initCollapsibles();

const GRID_SIZE = 48;

function initGridElectrons() {
    const grid = document.querySelector('.hero-bg-grid');
    const container = document.querySelector('.hero-grid-particles');
    if (!grid || !container) return;

    container.innerHTML = '';

    const width = grid.clientWidth;
    const height = grid.clientHeight;
    const hLines = Math.ceil(height / GRID_SIZE);
    const vLines = Math.ceil(width / GRID_SIZE);
    const count = Math.min(28, Math.max(14, Math.floor((width * height) / 45000)));

    for (let i = 0; i < count; i++) {
        const electron = document.createElement('span');
        const horizontal = Math.random() > 0.5;

        electron.className = `grid-electron grid-electron--${horizontal ? 'h' : 'v'}`;

        const duration = 4 + Math.random() * 6;
        const delay = Math.random() * 8;
        const reverse = Math.random() > 0.5;

        electron.style.animationDuration = `${duration}s`;
        electron.style.animationDelay = `${delay}s`;
        if (reverse) electron.style.animationDirection = 'reverse';

        if (horizontal) {
            const line = Math.floor(Math.random() * hLines);
            const startX = -GRID_SIZE + Math.random() * (width + GRID_SIZE);
            electron.style.top = `${line * GRID_SIZE}px`;
            electron.style.left = `${startX}px`;
            electron.style.setProperty('--travel', `${width + GRID_SIZE * 2}px`);
        } else {
            const line = Math.floor(Math.random() * vLines);
            const startY = -GRID_SIZE + Math.random() * (height + GRID_SIZE);
            electron.style.left = `${line * GRID_SIZE}px`;
            electron.style.top = `${startY}px`;
            electron.style.setProperty('--travel', `${height + GRID_SIZE * 2}px`);
        }

        container.appendChild(electron);
    }
}

let electronResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(electronResizeTimer);
    electronResizeTimer = setTimeout(initGridElectrons, 200);
});

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initGridElectrons();
}
