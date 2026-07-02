const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const languageSelector = document.getElementById('language-selector');

const HTML_KEYS = new Set(['hero.title', 'footer.copyright']);

function getNestedValue(obj, path) {
    return path.split('.').reduce((value, key) => {
        if (value && typeof value === 'object' && key in value) {
            return value[key];
        }
        return undefined;
    }, obj);
}

function applyTranslations(data) {
    document.title = data.pageTitle;
    document.documentElement.lang = languageSelector.value;

    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const keyPath = element.getAttribute('data-i18n-key');
        const value = getNestedValue(data, keyPath);
        if (value === undefined) return;

        if (HTML_KEYS.has(keyPath)) {
            element.innerHTML = value;
        } else {
            element.textContent = value;
        }
    });
}

function loadLanguage(lang) {
    return fetch(`locales/${lang}.json`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            return response.json();
        })
        .then(applyTranslations)
        .catch(error => console.error('Error loading language file:', error));
}

languageSelector.addEventListener('change', () => {
    loadLanguage(languageSelector.value);
});

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

document.querySelectorAll('.edu-card, .exp-card, .project-card, .skill-category, .highlight-card').forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
});

loadLanguage(languageSelector.value);
