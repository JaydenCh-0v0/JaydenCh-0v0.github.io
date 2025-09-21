// 导航栏功能
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

document.getElementById('language-selector').addEventListener('change', function() {
    let lang = this.value;
    fetch(`locales/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            // 辅助函数：根据路径从数据对象中获取嵌套值
            const getNestedValue = (obj, path) => {
                const keys = path.split('.');
                let value = obj;
                for (const key of keys) {
                    if (value && typeof value === 'object' && key in value) {
                        value = value[key];
                    } else {
                        return undefined; // 键未找到或路径无效
                    }
                }
                return value;
            };

            // 辅助函数：更新元素的文本内容、HTML内容或placeholder属性
            const updateElementContent = (element, keyPath, data, contentType = 'text') => {
                if (!element) return; // 确保元素存在
                const value = getNestedValue(data, keyPath);
                if (value !== undefined) {
                    if (contentType === 'html') {
                        element.innerHTML = value;
                    } else if (contentType === 'placeholder') {
                        element.setAttribute('placeholder', value);
                    } else { // 默认为 'text'
                        element.innerText = value;
                    }
                }
            };

            // 1. 更新页面标题
            document.title = data.pageTitle;

            // 2. 更新导航栏Logo (此元素没有 data-i18n-key 属性)
            updateElementContent(document.querySelector('.nav-logo a'), 'nav.logo', data);

            // 3. 更新所有带有 data-i18n-key 属性的元素
            document.querySelectorAll('[data-i18n-key]').forEach(element => {
                const keyPath = element.getAttribute('data-i18n-key');
                if (keyPath) {
                    // 特殊处理需要 innerHTML 的元素 (如 hero.title 和 footer.copyright)
                    if (keyPath === 'hero.title' || keyPath === 'footer.copyright') {
                        updateElementContent(element, keyPath, data, 'html');
                    } else {
                        updateElementContent(element, keyPath, data, 'text');
                    }
                }
            });

            // 4. 更新所有带有 data-i18n-placeholder-key 属性的元素的 placeholder
            document.querySelectorAll('[data-i18n-placeholder-key]').forEach(element => {
                const keyPath = element.getAttribute('data-i18n-placeholder-key');
                if (keyPath) {
                    updateElementContent(element, keyPath, data, 'placeholder');
                }
            });

            // 5. 更新“关于我”部分的统计数据 (这些元素没有 data-i18n-key 属性)
            updateElementContent(document.querySelector('.about-stats .stat:nth-child(1) h3'), 'about.expYearsNum', data);
            updateElementContent(document.querySelector('.about-stats .stat:nth-child(1) p'), 'about.expYearsText', data);
            updateElementContent(document.querySelector('.about-stats .stat:nth-child(2) h3'), 'about.projectsCompletedNum', data);
            updateElementContent(document.querySelector('.about-stats .stat:nth-child(2) p'), 'about.projectsCompletedText', data);
            updateElementContent(document.querySelector('.about-stats .stat:nth-child(3) h3'), 'about.techStacksNum', data);
            updateElementContent(document.querySelector('.about-stats .stat:nth-child(3) p'), 'about.techStacksText', data);

            // 6. 更新“工作经历”部分 (复杂结构，需要映射)
            const experienceKeys = [
                {
                    title: 'fullstackTitle', company: 'company1', date: 'date1', desc: 'desc1',
                    lis: ['li1_1', 'li1_2', 'li1_3']
                },
                {
                    title: 'frontendTitle', company: 'company2', date: 'date2', desc: 'desc2',
                    lis: ['li2_1', 'li2_2', 'li2_3']
                },
                {
                    title: 'gameDevInternTitle', company: 'company3', date: 'date3', desc: 'desc3',
                    lis: ['li3_1', 'li3_2', 'li3_3']
                }
            ];

            const timelineItems = document.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                const keys = experienceKeys[index];
                if (keys) {
                    updateElementContent(item.querySelector('h3'), `experience.${keys.title}`, data);
                    updateElementContent(item.querySelector('h4'), `experience.${keys.company}`, data);
                    updateElementContent(item.querySelector('.timeline-date'), `experience.${keys.date}`, data);
                    updateElementContent(item.querySelector('p'), `experience.${keys.desc}`, data);

                    const listItems = item.querySelectorAll('li');
                    listItems.forEach((li, liIndex) => {
                        if (keys.lis[liIndex]) {
                            updateElementContent(li, `experience.${keys.lis[liIndex]}`, data);
                        }
                    });
                }
            });

            // 7. 更新“技能”部分 (复杂结构，需要映射)
            const skillCategoryKeys = [
                {
                    categoryTitle: 'frontendCategory',
                    skills: ['htmlCss', 'javascript', 'react', 'vuejs']
                },
                {
                    categoryTitle: 'backendCategory',
                    skills: ['nodejs', 'python', 'mysql', 'mongodb']
                },
                {
                    categoryTitle: 'gameDevCategory',
                    skills: ['godotEngine', 'gdscript', 'csharp', 'unity']
                }
            ];

            const skillCategories = document.querySelectorAll('.skill-category');
            skillCategories.forEach((category, index) => {
                const keys = skillCategoryKeys[index];
                if (keys) {
                    updateElementContent(category.querySelector('h3'), `skills.${keys.categoryTitle}`, data);
                    
                    const skillItems = category.querySelectorAll('.skill-item span');
                    skillItems.forEach((skillSpan, skillIndex) => {
                        if (keys.skills[skillIndex]) {
                            updateElementContent(skillSpan, `skills.${keys.skills[skillIndex]}`, data);
                        }
                    });
                }
            });

            // 8. 更新“项目”部分 (复杂结构，需要映射)
            const projectKeys = [
                {
                    title: 'rpgTitle', desc: 'rpgDesc',
                    techs: ['rpgTechGodot', 'rpgTechGDScript', 'rpgTech2D'],
                    viewProjectKey: 'viewProject', githubLinkKey: 'githubLink'
                },
                {
                    title: 'ecommerceTitle', desc: 'ecommerceDesc',
                    techs: ['ecommerceTechReact', 'ecommerceTechNodejs', 'ecommerceTechMysql'],
                    viewProjectKey: 'viewProject', githubLinkKey: 'githubLink'
                },
                {
                    title: 'taskAppTitle', desc: 'taskAppDesc',
                    techs: ['taskAppTechVuejs', 'taskAppTechPython', 'taskAppTechMongodb'],
                    viewProjectKey: 'viewProject', githubLinkKey: 'githubLink'
                }
            ];

            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach((card, index) => {
                const keys = projectKeys[index];
                if (keys) {
                    updateElementContent(card.querySelector('h3'), `projects.proj.${keys.title}`, data);
                    updateElementContent(card.querySelector('p'), `projects.proj.${keys.desc}`, data);

                    const techs = card.querySelectorAll('.project-tech span');
                    techs.forEach((tech, techIndex) => {
                        if (keys.techs[techIndex]) {
                            updateElementContent(tech, `projects.proj.${keys.techs[techIndex]}`, data);
                        }
                    });
                    // 更新项目卡片内的“查看项目”和“GitHub”按钮
                    // 假设这些按钮有 data-i18n-key 属性
                    const viewProjectBtn = card.querySelector('.btn-primary[data-i18n-key="projects.proj.viewProject"]');
                    if (viewProjectBtn) updateElementContent(viewProjectBtn, `projects.proj.${keys.viewProjectKey}`, data);
                    const githubBtn = card.querySelector('.btn-secondary[data-i18n-key="projects.proj.githubLink"]');
                    if (githubBtn) updateElementContent(githubBtn, `projects.proj.${keys.githubLinkKey}`, data);
                }
            });
        })
        .catch(error => console.error('Error loading language file:', error));
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 关闭移动端菜单当点击链接时
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// 技能条动画
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillBars = entry.target.querySelectorAll('.skill-progress');
            skillBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
            });
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-category').forEach(category => {
    observer.observe(category);
});

// 联系表单处理
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const subject = contactForm.querySelectorAll('input[type="text"]')[1].value;
        const message = contactForm.querySelector('textarea').value;
        
        // 简单的表单验证
        if (!name || !email || !subject || !message) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 模拟发送邮件
        alert('感谢你的消息！我会尽快回复你。');
        contactForm.reset();
    });
}

// 页面加载动画
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 添加滚动时的淡入效果
const fadeElements = document.querySelectorAll('.timeline-item, .project-card, .skill-category');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
});

// 打字机效果
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 为英雄标题添加打字机效果
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 50);
        }, 1000);
    }
});

// 添加鼠标跟随效果
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    if (!cursor) {
        const newCursor = document.createElement('div');
        newCursor.className = 'cursor';
        newCursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(37, 99, 235, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(newCursor);
    }
    
    const cursorElement = document.querySelector('.cursor');
    cursorElement.style.left = e.clientX - 10 + 'px';
    cursorElement.style.top = e.clientY - 10 + 'px';
});

// 添加页面滚动进度条
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #3b82f6);
    z-index: 9999;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
});
