// Mobile nav toggle + smooth scroll + scroll reveal + theme + counters
(function(){
  const doc = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  const links = document.querySelectorAll('.nav-link');
  const themeBtn = document.getElementById('theme-toggle');

  // Mobile nav
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    header.classList.toggle('nav-open');
  });

  // Close mobile nav when link clicked (if open)
  links.forEach(l => l.addEventListener('click', () => {
    if (header.classList.contains('nav-open')) {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }));

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Theme handling
  const THEME_KEY = 'mybrand:theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme){
    if(theme === 'light'){
      document.documentElement.classList.add('light');
      themeBtn.setAttribute('aria-pressed','true');
    } else {
      document.documentElement.classList.remove('light');
      themeBtn.setAttribute('aria-pressed','false');
    }
  }

  function loadTheme(){
    try{
      const saved = localStorage.getItem(THEME_KEY);
      if(saved) return saved;
      return prefersDark ? 'dark' : 'light';
    } catch(e){
      return prefersDark ? 'dark' : 'light';
    }
  }

  // init theme
  const initial = loadTheme();
  applyTheme(initial === 'light' ? 'light' : 'dark');

  themeBtn.addEventListener('click', ()=>{
    const isLight = document.documentElement.classList.contains('light');
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
  });

  // Intersection Observer for reveal animations
  if ('IntersectionObserver' in window){
    const items = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {root:null, rootMargin: '0px 0px -8% 0px', threshold: 0.06});

    items.forEach(i=> io.observe(i));
  } else {
    // fallback
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
  }

  // Counters animation when visible
  const counters = document.querySelectorAll('.counter');
  if(counters.length && 'IntersectionObserver' in window){
    const cObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
          const duration = 1400;
          const start = performance.now();
          const from = 0;
          function tick(now){
            const t = Math.min((now - start) / duration, 1);
            const val = Math.floor(t * (target - from) + from);
            el.textContent = val.toLocaleString();
            if(t < 1){ requestAnimationFrame(tick); } else { el.textContent = target.toLocaleString(); }
          }
          requestAnimationFrame(tick);
          obs.unobserve(el);
        }
      });
    }, {threshold: 0.6});

    counters.forEach(c => cObs.observe(c));
  } else {
    // fallback: set final values
    counters.forEach(c=> c.textContent = c.getAttribute('data-target'));
  }

  // Tiny accessibility: dismiss mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('nav-open')){
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded','false');
      toggle.focus();
    }
  });

})();
