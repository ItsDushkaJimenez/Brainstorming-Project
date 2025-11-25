// Utilidades
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Año en footer
$('#year').textContent = new Date().getFullYear();

// Menú móvil
const navToggle = $('.nav-toggle');
const siteNav = $('.site-nav');
navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
});

// Cerrar menú al hacer click en un enlace (móvil)
$$('.site-nav a').forEach(a => a.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
}));

// Desplazamiento suave (extra en navegadores que no lo soporten por CSS)
$$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const targetId = link.getAttribute('href');
        const el = document.querySelector(targetId);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth'});
    });
});

// Reveal on Scroll + stagger según data-animate
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting){
            const el = entry.target;
            // pequeño retraso aleatorio para efecto cascada
            const delay = (parseFloat(el.dataset.delay) || Math.random() * 0.2).toFixed(2);
            el.style.transitionDelay = `${delay}s`;
            el.classList.add('visible');
            observer.unobserve(el);
        }
    });
}, {threshold: .12, rootMargin: '0px 0px -10% 0px'});

document.querySelectorAll('.reveal,[data-animate]').forEach(el => observer.observe(el));

// Tilt 3D para cards
function attachTilt(el){
    const strength = 10; // grados máximos
    let frame;
    function onMove(e){
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const dx = (e.clientX - cx) / (rect.width/2);
        const dy = (e.clientY - cy) / (rect.height/2);
        const rx = (-dy * strength).toFixed(2);
        const ry = (dx * strength).toFixed(2);
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(()=>{
            el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
    }
    function onLeave(){
        el.style.transform = '';
    }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
}
document.querySelectorAll('.card, .todo-card').forEach(attachTilt);

// Scrollspy para navegación
const sections = Array.from(document.querySelectorAll('section[id]'));
const links = Array.from(document.querySelectorAll('.site-nav a'));
function setActive(id){
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
}
const spy = new IntersectionObserver(entries => {
    entries.forEach(entry =>{
        if(entry.isIntersecting){
            setActive(entry.target.id);
        }
    });
},{rootMargin:'-40% 0px -55% 0px', threshold:0});
sections.forEach(s => spy.observe(s));

// Control de tabs de pestañas
const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
function activateTab(id){
    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === id;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });
    tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tabPanel === id);
    });
}
tabButtons.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
if (tabButtons.length){
    const defaultTab = tabButtons.find(btn => btn.classList.contains('active'))?.dataset.tab || tabButtons[0].dataset.tab;
    activateTab(defaultTab);
}

// Checklist interactiva con almacenamiento local
const todoItems = Array.from(document.querySelectorAll('.todo-item'));
const resetBtn = document.querySelector('.reset-checklist');
const checklistKey = 'brainstormingExcelChecklist';
let savedState = {};
try{
    savedState = JSON.parse(localStorage.getItem(checklistKey) || '{}');
}catch(e){
    savedState = {};
}

todoItems.forEach(item => {
    const id = item.dataset.todo;
    if (savedState[id]) item.classList.add('done');
    item.addEventListener('click', () => {
        item.classList.toggle('done');
        savedState[id] = item.classList.contains('done');
        try{
            localStorage.setItem(checklistKey, JSON.stringify(savedState));
        }catch(e){}
    });
});

resetBtn?.addEventListener('click', () => {
    todoItems.forEach(item => item.classList.remove('done'));
    savedState = {};
    try{
        localStorage.removeItem(checklistKey);
    }catch(e){}
});
