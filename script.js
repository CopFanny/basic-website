// Mobile nav toggle + smooth scroll + scroll reveal + theme + counters + carousel + contact submit
(function(){
  const doc = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  const links = document.querySelectorAll('.nav-link');
  const themeBtn = document.getElementById('theme-toggle');
  const video = document.querySelector('.hero-video');

  // Mobile nav
  if(toggle){
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      header.classList.toggle('nav-open');
    });
  }

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

  // Testimonials carousel
  (function carousel(){
    const track = document.querySelector('.carousel-track');
    if(!track) return;
    const items = Array.from(track.querySelectorAll('.testimonial'));
    const prev = document.querySelector('.carousel-btn.prev');
    const next = document.querySelector('.carousel-btn.next');
    let idx = items.findIndex(i=> i.classList.contains('active'));
    if(idx === -1) idx = 0;

    function show(i){
      items.forEach((it, n)=>{
        it.classList.toggle('active', n === i);
      });
    }

    prev.addEventListener('click', ()=>{ idx = (idx - 1 + items.length) % items.length; show(idx); });
    next.addEventListener('click', ()=>{ idx = (idx + 1) % items.length; show(idx); });

    let timer = setInterval(()=>{ idx = (idx + 1) % items.length; show(idx); }, 6000);
    [prev,next, track].forEach(el => el.addEventListener('mouseenter', ()=> clearInterval(timer)));
    [prev,next, track].forEach(el => el.addEventListener('mouseleave', ()=> timer = setInterval(()=>{ idx = (idx + 1) % items.length; show(idx); }, 6000)));
  })();

  // Contact form submission (POST to /api/contact)
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const body = { name: fd.get('name'), email: fd.get('email'), message: fd.get('message') };
      statusEl.textContent = 'Sending…';
      try{
        const res = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if(res.ok){
          statusEl.textContent = 'Thanks — your message has been sent.';
          form.reset();
        } else {
          const json = await res.json().catch(()=>null);
          statusEl.textContent = json && json.error ? json.error : 'There was a problem sending your message.';
        }
      }catch(err){
        statusEl.textContent = 'Network error — try again later.';
      }
    });
  }

  // Pause video if user prefers reduced motion
  try{
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq && mq.matches && video){ video.pause(); video.style.display = 'none'; }
  }catch(e){}

  // Tiny accessibility: dismiss mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('nav-open')){
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded','false');
      toggle.focus();
    }
  });

})();
