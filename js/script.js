/* ═══════════════════════════════════════════════════════
   یوسف پرورش — وب‌سایت شخصی چندصفحه‌ای | اسکریپت اصلی
   منو، تم، جست‌وجوی کل سایت، مودال، فیلتر، لایت‌باکس
   (بزرگ‌نمایی تصویر)، فرم، کپی، رزومه و انیمیشن‌ها
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ---------- تنظیمات قابل ویرایش ---------- */
  /* ویرایش: ایمیل دریافت‌کننده فرم تماس */
  var CONTACT_EMAIL = 'yousefparvaresh89@gmail.com';
  /* ویرایش: مسیر فایل رزومه (فایل را با نام resume.pdf در پوشه files بگذارید) */
  var RESUME_URL = 'files/resume.pdf';

  /* ---------- ابزارهای کمکی ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function faDigits(value) {
    return String(value).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function ioSupported() { return 'IntersectionObserver' in window; }

  var html = document.documentElement;
  var body = document.body;
  var isHomePage = body.getAttribute('data-page') === 'home';

  /* ═══════════════ ۱) پیش‌بارگذار ═══════════════ */
  (function initPreloader() {
    var pre = $('#preloader');
    if (!pre) return;
    var done = false;
    function hide() {
      if (done) return;
      done = true;
      pre.classList.add('done');
      window.setTimeout(function () {
        if (pre.parentNode) pre.parentNode.removeChild(pre);
      }, 650);
    }
    if (document.readyState === 'complete') { hide(); }
    else { window.addEventListener('load', hide); }
    window.setTimeout(hide, 2500); /* اطمینان: هرگز کاربر را معطل نگه نمی‌داریم */
  })();

  /* ═══════════════ ۱.۵) هم‌عرض‌سازی متن پس‌زمینه هیرو ═══════════════ */
  (function initGhostFit() {
    var ghost = $('#heroGhost');
    if (!ghost) return;
    function fit() {
      var hero = ghost.closest('.hero');
      var available = ((hero && hero.clientWidth) || window.innerWidth) * 0.94;
      ghost.style.fontSize = '100px';
      var w = ghost.scrollWidth;
      if (w > 0) {
        var size = Math.max(36, Math.min(240, (available / w) * 100));
        ghost.style.fontSize = size + 'px';
      }
    }
    fit();
    window.addEventListener('resize', fit, { passive: true });
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(fit).catch(function () { /* بی‌اهمیت */ });
    }
  })();

  /* ═══════════════ ۲) تم روز و شب ═══════════════ */
  (function initTheme() {
    var btn = $('#themeToggle');
    var meta = $('meta[name="theme-color"]');

    function applyMeta() {
      var isLight = html.getAttribute('data-theme') === 'light';
      if (meta) meta.setAttribute('content', isLight ? '#f7f6fb' : '#1f1d25');
    }
    applyMeta();

    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('yp-theme', next); } catch (e) { /* بی‌اهمیت */ }
      applyMeta();
    });
  })();

  /* ═══════════════ ۳) وضعیت هدر و دکمه بازگشت به بالا ═══════════════ */
  (function initScrollUI() {
    var header = $('#siteHeader');
    var backTop = $('#backToTop');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.pageYOffset || html.scrollTop || 0;
        if (header) header.classList.toggle('scrolled', y > 40);
        if (backTop) backTop.classList.toggle('show', y > 600);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ═══════════════ ۴) منوی کشویی ═══════════════ */
  var drawer = (function initDrawer() {
    var drawerEl = $('#mobileDrawer');
    var toggle = $('#navToggle');
    var overlay = $('#overlay');
    var closeBtn = $('#drawerClose');
    var lastFocus = null;

    function open() {
      if (!drawerEl) return;
      lastFocus = document.activeElement;
      drawerEl.classList.add('open');
      drawerEl.setAttribute('aria-hidden', 'false');
      if (overlay) { overlay.hidden = false; requestAnimationFrame(function () { overlay.classList.add('show'); }); }
      if (toggle) { toggle.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); }
      body.classList.add('no-scroll');
      var first = $('.drawer-links a', drawerEl);
      if (first) first.focus();
    }
    function close() {
      if (!drawerEl) return;
      drawerEl.classList.remove('open');
      drawerEl.setAttribute('aria-hidden', 'true');
      if (overlay) {
        overlay.classList.remove('show');
        window.setTimeout(function () { overlay.hidden = true; }, 300);
      }
      if (toggle) { toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      body.classList.remove('no-scroll');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function isOpen() { return !!(drawerEl && drawerEl.classList.contains('open')); }

    if (toggle) toggle.addEventListener('click', function () {
      if (isOpen()) close(); else open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
    $$('.drawer-links a', drawerEl || document).forEach(function (a) {
      a.addEventListener('click', close);
    });

    return { open: open, close: close, isOpen: isOpen };
  })();

  /* ═══════════════ ۵) اسکرول‌اسپای (فقط لینک‌های لنگر همین صفحه) ═══════════════ */
  (function initScrollSpy() {
    var links = $$('.nav-link[href^="#"]');
    var sections = $$('main section[id]');
    if (!links.length || !sections.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        var target = (a.getAttribute('href') || '').replace('#', '');
        a.classList.toggle('active', target === id);
      });
    }

    if (!ioSupported()) {
      window.addEventListener('scroll', function () {
        var current = sections[0];
        var y = window.pageYOffset + 140;
        sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
        if (current) setActive(current.id);
      }, { passive: true });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  })();

  /* ═══════════════ ۶) انیمیشن نمایش هنگام اسکرول ═══════════════ */
  (function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    items.forEach(function (el) {
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      if (!isNaN(delay) && delay > 0) el.style.setProperty('--rd', delay + 'ms');
    });

    if (!ioSupported() || prefersReducedMotion()) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  })();

  /* ═══════════════ ۷) شمارنده‌های آماری ═══════════════ */
  (function initCounters() {
    var nums = $$('.stat-num');
    if (!nums.length) return;

    function animate(el) {
      if (el.dataset.counted === '1') return;
      el.dataset.counted = '1';
      var target = parseInt(el.getAttribute('data-target') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (prefersReducedMotion() || !window.requestAnimationFrame) {
        el.textContent = faDigits(target) + suffix;
        return;
      }
      var duration = 1500;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = faDigits(Math.round(target * eased)) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!ioSupported()) { nums.forEach(animate); return; }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { observer.observe(el); });
  })();

  /* ═══════════════ ۸) نوارهای مهارت ═══════════════ */
  (function initSkills() {
    var box = $('.about-skills');
    if (!box) return;

    function run() {
      $$('.skill', box).forEach(function (skill) {
        var percent = parseInt(skill.getAttribute('data-percent') || '0', 10);
        var bar = $('.skill-bar', skill);
        var num = $('.skill-num', skill);
        if (bar) bar.style.width = percent + '%';
        if (num) num.textContent = faDigits(percent) + '٪';
      });
    }

    if (!ioSupported() || prefersReducedMotion()) { run(); return; }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.3 });
    observer.observe(box);
  })();

  /* ═══════════════ ۹) فیلتر نمونه‌کارها ═══════════════ */
  (function initFilter() {
    var buttons = $$('.filter-btn');
    var cards = $$('.project-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var show = filter === 'all' || card.getAttribute('data-category') === filter;
          card.classList.toggle('hide', !show);
        });
      });
    });
  })();

  /* ═══════════════ ۱۰) مودال (پروژه و مقاله) ═══════════════ */
  var modal = (function initModal() {
    var root = $('#modal');
    var content = $('#modalContent');
    var closeBtn = $('#modalClose');
    var backdrop = $('#modalBackdrop');
    var lastFocus = null;

    function open(htmlContent) {
      if (!root || !content) return;
      lastFocus = document.activeElement;
      content.innerHTML = htmlContent;
      root.hidden = false;
      body.classList.add('no-scroll');
      if (closeBtn) closeBtn.focus();
      var dlg = $('.modal-dialog', root);
      if (dlg) dlg.scrollTop = 0;
    }
    function close() {
      if (!root) return;
      root.hidden = true;
      if (content) content.innerHTML = '';
      body.classList.remove('no-scroll');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    return { open: open, close: close, root: root };
  })();

  /* محتوای کامل مقاله‌های وبلاگ */
  /* ویرایش: متن مقاله‌های خود را اینجا تغییر دهید */
  var ARTICLES = {
    a1: {
      title: '۷ ترند جذاب طراحی وب در سال ۲۰۲۶',
      cat: 'طراحی وب',
      date: '۱۲ آبان ۱۴۰۵',
      paragraphs: [
        'دنیای طراحی وب هر سال با سرعتی شگفت‌انگیز تغییر می‌کند و سال ۲۰۲۶ هم استثنا نیست. در این سال، تمرکز طراحان روی تجربه‌ای است که کاربر را در همان سه ثانیه اول غافلگیر کند؛ از تایپوگرافی‌های بزرگ و جسورانه گرفته تا پس‌زمینه‌های سه‌بعدی تعاملی که با حرکت موس واکنش نشان می‌دهند.',
        'یکی از ترندهای اصلی، «ریزتعامل‌ها» است؛ پاسخ‌های بصری کوچکی که به هر کلیک و اسکرول جان می‌دهند. ترند مهم دیگر، طراحی «تاریکِ گرم» است: به‌جای سیاهی مطلق، پالت‌های تیره با ته‌مایه بنفش و آبی که چشم را کمتر خسته می‌کنند — دقیقاً چیزی که در همین سایت استفاده کرده‌ام!',
        'در نهایت، هوش مصنوعی نقش دستیار طراح را پیدا کرده است؛ از تولید پالت رنگی متناسب با برند تا پیشنهاد چیدمان بر اساس رفتار کاربر. اگر می‌خواهید وب‌سایت شما مدرن بماند، این ترندها را جدی بگیرید؛ اما یادتان باشد ترند را باید با هویت برند شما تطبیق داد، نه اینکه برند را فدای ترند کرد.'
      ]
    },
    a2: {
      title: 'چرا کسب‌وکار شما به وب‌سایت حرفه‌ای نیاز دارد؟',
      cat: 'کسب‌وکار',
      date: '۲۸ مهر ۱۴۰۵',
      paragraphs: [
        'تصور کنید مشتری نام شما را شنیده و اولین کاری که می‌کند، جست‌وجوی نامتان در گوگل است. اگر چیزی پیدا نکند یا به سایت سنگین و قدیمی برسد، همان‌جا اعتمادش از دست می‌رود. تجربه نشان می‌دهد بیش از ۷۰ درصد خریداران پیش از خرید، وب‌سایت فروشنده را بررسی می‌کنند.',
        'وب‌سایت حرفه‌ای فقط یک ویترین نیست؛ فروشنده‌ای است که ۲۴ ساعته کار می‌کند. فرم درخواست مشاوره، فروشگاه آنلاین، رزرو خدمات و پاسخ به پرسش‌های پرتکرار، همه بار مرکز فروش را سبک می‌کنند و هزینه جذب مشتری را پایین می‌آورند.',
        'نکته مهم‌تر برای بازار ایران، اهمیت سئوی فارسی است. رقابت روی کلمات کلیدی صنایع مختلف هنوز به شدت شبکه‌های اجتماعی سنگین نیست و فرصت خوبی است؛ وب‌سایت استاندارد بسازید، محتوای واقعی منتشر کنید و وقتی رقیب‌ها بیدار شوند، شما سال‌ها جلوتر خواهید بود.'
      ]
    },
    a3: {
      title: 'راهنمای جامع سئو برای وب‌سایت‌های فارسی',
      cat: 'سئو',
      date: '۹ مهر ۱۴۰۵',
      paragraphs: [
        'سئوی فارسی تفاوت‌های مهمی با سئوی انگلیسی دارد؛ از تحلیل معنایی کلمات هم‌خانواده تا اهمیت بالای جست‌وجوی محلی. قدم اول، تحقیق کلمه کلیدی است: برای هر صفحه دقیقاً یک کلمه اصلی و دو سه کلمه مکمل انتخاب کنید و آن‌ها را طبیعی در عنوان، توضیحات و متن به کار ببرید؛ پرحرفی و تکرار مصنوعی، نمره شما را کم می‌کند.',
        'قدم دوم، تجربه کاربری فنی است: گوگل سرعت، سازگاری با موبایل و ساختار منظم لینک‌ها را مستقیماً می‌سنجد. تصاویر را فشرده و با فرمت مدرن ذخیره کنید، از هدرهای سلسله‌مراتبی (H1 تا H3) استفاده کنید و حتماً برای هر صفحه عنوان و توضیحات متا یگانه بنویسید.',
        'در نهایت یادتان باشد سئو ماراتن است، نه دوی سرعت. انتشار منظم محتوای مفید، لینک‌سازی طبیعی و صبر سه تا شش ماهه، ترکیبی است که نتایج پایدار می‌سازد. اگر به کمک نیاز دارید، سرویس «طراحی سایت» در صفحه خدمات همین سایت دقیقاً برای همین مسیر طراحی شده است.'
      ]
    }
  };

  /* ═══════════════ ۱۰.۵) لایت‌باکس — گالری چندعکسی نمونه‌کارها ═══════════════
     برای هر پروژه عکس‌های بیشتر را با این الگو نام‌گذاری کنید:
       عکس اصلی:  w8-cyberapp.jpg
       عکس دوم:   w8-cyberapp-2.jpg   عکس سوم:  w8-cyberapp-3.jpg   ...
     سایت تا ۸ عکس اضافه برای هر پروژه را خودکار پیدا می‌کند؛
     تا وقتی آپلود نشده‌اند، فقط عکس اصلی نمایش داده می‌شود. */
  var lightbox = (function initLightbox() {
    var root = $('#lightbox');
    var img = $('#lbImg');
    var titleEl = $('#lbTitle');
    var counter = $('#lbCounter');
    var prevBtn = $('#lbPrev');
    var nextBtn = $('#lbNext');
    var closeBtn = $('#lbClose');
    var backdrop = $('#lbBackdrop');
    var thumbsBox = $('#lbThumbs');
    var MAX_EXTRA = 8;      /* حداکثر تعداد عکس اضافه برای هر پروژه (name-2 تا name-9) */
    var galleryCache = {};  /* stem -> { list, ready, waiters } */
    var projects = [];      /* پروژه‌های نمایان: { src, title, stem } */
    var flat = [];          /* همه تصاویر پروژه‌های نمایان، پشت‌سرهم */
    var current = 0;
    var lastFocus = null;
    var touchX = null;

    function stemOf(src) {
      return (src || '').replace(/\.(jpe?g|png|webp)$/i, '');
    }

    /* بررسی وجود فایل عکس بدون دانلود کامل آن */
    function probeOne(url) {
      if (!(window.fetch && window.Promise)) return Promise.resolve(null);
      return fetch(url, { method: 'HEAD' })
        .then(function (res) { return res.ok ? url : null; })
        .catch(function () { return null; });
    }

    /* کشف خودکار عکس‌های اضافه پروژه (stem-2.jpg تا stem-9.jpg) */
    function discover(stem, coverSrc, cb) {
      var entry = galleryCache[stem];
      if (entry) {
        if (entry.ready) { if (cb) cb(entry.list); }
        else if (cb) { entry.waiters.push(cb); }
        return;
      }
      entry = { list: [coverSrc], ready: false, waiters: cb ? [cb] : [] };
      galleryCache[stem] = entry;
      var probes = [];
      for (var i = 2; i <= MAX_EXTRA + 1; i++) probes.push(probeOne(stem + '-' + i + '.jpg'));
      Promise.all(probes).then(function (found) {
        found.forEach(function (u) { if (u) entry.list.push(u); });
        entry.ready = true;
        entry.waiters.forEach(function (w) { w(entry.list); });
        entry.waiters.length = 0;
      }).catch(function () {
        entry.ready = true;
        entry.waiters.length = 0;
      });
    }

    function collectProjects() {
      projects = $$('.project-card:not(.hide)').map(function (card) {
        var btn = $('.thumb-zoom', card);
        var src = (btn && btn.getAttribute('data-zoom-img')) || card.getAttribute('data-img') || '';
        if (!src) return null;
        return {
          src: src,
          title: (btn && btn.getAttribute('data-zoom-title')) || card.getAttribute('data-title') || 'نمونه‌کار',
          stem: stemOf(src)
        };
      }).filter(Boolean);
    }

    function buildFlat() {
      flat = [];
      projects.forEach(function (p) {
        var entry = galleryCache[p.stem];
        var list = (entry && entry.list && entry.list.length) ? entry.list : [p.src];
        list.forEach(function (src) {
          flat.push({ src: src, title: p.title, stem: p.stem });
        });
      });
    }

    function currentSrc() { return flat[current] ? flat[current].src : ''; }
    function currentStem() { return flat[current] ? flat[current].stem : ''; }

    /* بازسازی فهرست تصاویر با حفظ جایگاه فعلی */
    function refresh(stem, src) {
      buildFlat();
      if (!flat.length) return;
      var idx = -1, i;
      for (i = 0; i < flat.length; i++) {
        if (flat[i].stem === stem && flat[i].src === src) { idx = i; break; }
      }
      if (idx < 0) {
        for (i = 0; i < flat.length; i++) {
          if (flat[i].stem === stem) { idx = i; break; }
        }
      }
      current = idx >= 0 ? idx : 0;
      render();
    }

    function renderThumbs(stem, activeSrc, title) {
      if (!thumbsBox) return;
      var stage = thumbsBox.parentNode;
      var entry = galleryCache[stem];
      var list = (entry && entry.ready && entry.list.length > 1) ? entry.list : null;
      if (!list) {
        thumbsBox.hidden = true;
        thumbsBox.innerHTML = '';
        if (stage) stage.classList.remove('has-thumbs');
        return;
      }
      thumbsBox.hidden = false;
      if (stage) stage.classList.add('has-thumbs');
      thumbsBox.innerHTML = '';
      list.forEach(function (src, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lb-thumb' + (src === activeSrc ? ' active' : '');
        b.setAttribute('aria-label', 'نمایش تصویر ' + faDigits(i + 1) + ' از «' + title + '»');
        var t = document.createElement('img');
        t.src = src;
        t.alt = '';
        t.loading = 'lazy';
        b.appendChild(t);
        b.addEventListener('click', function () {
          var idx = -1, j;
          for (j = 0; j < flat.length; j++) {
            if (flat[j].stem === stem && flat[j].src === src) { idx = j; break; }
          }
          if (idx >= 0) { current = idx; render(); }
        });
        thumbsBox.appendChild(b);
      });
    }

    function render() {
      if (!flat.length || !img) return;
      var it = flat[current];
      var same = flat.filter(function (x) { return x.stem === it.stem; });
      var pos = same.indexOf(it) + 1;
      img.src = it.src;
      img.alt = 'تصویر بزرگ پروژه ' + it.title;
      if (titleEl) titleEl.textContent = it.title;
      if (counter) {
        if (same.length > 1) {
          counter.hidden = false;
          counter.textContent = faDigits(pos) + ' از ' + faDigits(same.length);
        } else {
          counter.hidden = true;
        }
      }
      var single = flat.length < 2;
      if (prevBtn) prevBtn.style.display = single ? 'none' : '';
      if (nextBtn) nextBtn.style.display = single ? 'none' : '';
      renderThumbs(it.stem, it.src, it.title);
    }

    function openAtCard(card) {
      if (!root || !img) return;
      lastFocus = document.activeElement;
      collectProjects();
      if (!projects.length) return;
      var btn = $('.thumb-zoom', card);
      var openSrc = (btn && btn.getAttribute('data-zoom-img')) || card.getAttribute('data-img') || '';
      var openStem = stemOf(openSrc);
      refresh(openStem, openSrc);
      root.hidden = false;
      body.classList.add('no-scroll');
      if (closeBtn) closeBtn.focus();
      /* کشف عکس‌های اضافه همه پروژه‌های نمایان؛ بعد از هر کشف، جایگاه حفظ می‌شود */
      projects.forEach(function (p) {
        discover(p.stem, p.src, function () {
          if (root && !root.hidden) refresh(currentStem(), currentSrc());
        });
      });
    }

    function close() {
      if (!root) return;
      root.hidden = true;
      body.classList.remove('no-scroll');
      if (img) img.removeAttribute('src');
      if (thumbsBox) { thumbsBox.hidden = true; thumbsBox.innerHTML = ''; }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function step(delta) {
      if (!flat.length || flat.length < 2) return;
      current = (current + delta + flat.length) % flat.length;
      render();
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

    /* کشیدن انگشت روی موبایل: راست = بعدی، چپ = قبلی (مطابق چیدمان راست‌به‌چپ) */
    if (root) {
      root.addEventListener('touchstart', function (e) {
        touchX = (e.touches && e.touches.length) ? e.touches[0].clientX : null;
      }, { passive: true });
      root.addEventListener('touchend', function (e) {
        if (touchX === null) return;
        var endX = (e.changedTouches && e.changedTouches.length) ? e.changedTouches[0].clientX : touchX;
        var dx = endX - touchX;
        touchX = null;
        if (Math.abs(dx) > 45) step(dx > 0 ? 1 : -1);
      }, { passive: true });
    }

    return { openAtCard: openAtCard, close: close, step: step, isOpen: function () { return !!(root && !root.hidden); } };
  })();

  /* ═══════════════ ۱۱) باز کردن مودال پروژه ═══════════════ */
  function openProject(card) {
    var title = card.getAttribute('data-title') || 'پروژه';
    var cat = card.getAttribute('data-cat-label') || '';
    var year = card.getAttribute('data-year') || '';
    var img = card.getAttribute('data-img') || '';
    var desc = card.getAttribute('data-desc') || '';
    var link = card.getAttribute('data-link') || '';
    var tags = (card.getAttribute('data-tags') || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    var features = (card.getAttribute('data-features') || '').split('|').map(function (f) { return f.trim(); }).filter(Boolean);

    var tagHtml = tags.map(function (t) { return '<span class="pm-tag">' + t + '</span>'; }).join('');
    var featHtml = features.map(function (f) {
      return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span>' + f + '</span></li>';
    }).join('');
    var yearHtml = year
      ? '<span class="pm-year"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' + year + '</span>'
      : '';

    var liveBtn = link
      ? '<a class="btn btn-primary" href="' + link + '" target="_blank" rel="noopener">مشاهده پروژه زنده</a>'
      : '';
    var orderBtn = '<a class="btn ' + (link ? 'btn-outline' : 'btn-primary') + '" href="contact.html">سفارش پروژه مشابه</a>';

    modal.open(
      '<img class="pm-img" src="' + img + '" alt="تصویر پروژه ' + title + '" title="برای بزرگ‌نمایی کلیک کنید">' +
      '<div class="pm-body">' +
        '<div class="pm-meta"><span class="chip">' + cat + '</span>' + yearHtml + '</div>' +
        '<h3 class="pm-title" id="modalTitle">' + title + '</h3>' +
        '<p class="pm-desc">' + desc + '</p>' +
        '<h4 class="pm-sub">امکانات پروژه</h4>' +
        '<ul class="pm-features">' + featHtml + '</ul>' +
        '<div class="pm-tags">' + tagHtml + '</div>' +
        '<div class="pm-actions">' + liveBtn + orderBtn +
          '<button class="btn btn-outline" type="button" data-modal-close>بستن</button>' +
        '</div>' +
      '</div>'
    );
    bindModalActions(card);
  }

  function openArticle(id) {
    var art = ARTICLES[id];
    if (!art) return;
    var bodyHtml = art.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    modal.open(
      '<div class="pm-body">' +
        '<div class="am-meta"><span class="chip">' + art.cat + '</span><span>' + art.date + '</span><span>یوسف پرورش</span></div>' +
        '<h3 class="pm-title" id="modalTitle">' + art.title + '</h3>' +
        '<div class="am-body">' + bodyHtml + '</div>' +
        '<div class="pm-actions">' +
          '<a class="btn btn-primary" href="contact.html">سفارش مشابه این کار</a>' +
          '<button class="btn btn-outline" type="button" data-modal-close>بستن</button>' +
        '</div>' +
      '</div>'
    );
    bindModalActions(null);
  }

  function bindModalActions(projectCard) {
    $$('[data-modal-close]', modal.root).forEach(function (b) {
      b.addEventListener('click', modal.close);
    });
    /* کلیک روی تصویر داخل مودال = بزرگ‌نمایی در لایت‌باکس */
    var pmImg = $('.pm-img', modal.root);
    if (pmImg && projectCard) {
      pmImg.addEventListener('click', function () {
        modal.close();
        window.setTimeout(function () { lightbox.openAtCard(projectCard); }, 60);
      });
    }
  }

  /* ═══════════════ ۱۲) اتصال کارت‌های پروژه و وبلاگ ═══════════════ */
  (function bindCards() {
    $$('.project-card').forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'مشاهده جزئیات ' + (card.getAttribute('data-title') || 'پروژه'));
      card.addEventListener('click', function () { openProject(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card); }
      });

      var zoom = $('.thumb-zoom', card);
      if (zoom) {
        zoom.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          lightbox.openAtCard(card);
        });
        zoom.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); lightbox.openAtCard(card); }
        });
      }

      var details = $('.btn-details', card);
      if (details) {
        details.addEventListener('click', function (e) { e.stopPropagation(); openProject(card); });
      }

      var live = $('.btn-live', card);
      if (live) {
        /* ناوبری پیش‌فرض لینک ادامه دارد؛ فقط از باز شدن مودال جلوگیری می‌کنیم */
        live.addEventListener('click', function (e) { e.stopPropagation(); });
        live.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
        });
      }
    });

    $$('.blog-card').forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('click', function () { openArticle(card.getAttribute('data-article')); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openArticle(card.getAttribute('data-article')); }
      });
      var h = $('h3', card);
      if (h) card.setAttribute('aria-label', 'خواندن مقاله: ' + h.textContent.trim());
    });
  })();

  /* ═══════════════ ۱۳) جست‌وجوی کل سایت (چندصفحه‌ای) ═══════════════ */
  var search = (function initSearch() {
    var root = $('#searchOverlay');
    var input = $('#searchInput');
    var results = $('#searchResults');
    var hint = $('#searchHint');
    var openBtn = $('#searchToggle');
    var closeBtn = $('#searchClose');
    var backdrop = $('#searchBackdrop');
    var lastFocus = null;

    var ICONS = {
      section: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
      project: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
      service: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      article: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
    };

    /* ویرایش: فهرست جست‌وجوی کل سایت — عنوان‌ها با محتوای صفحات هماهنگ نگه داشته شوند */
    var INDEX = [
      { t: 'خانه', type: 'section', label: 'صفحه', url: 'index.html' },
      { t: 'درباره من', type: 'section', label: 'بخش', url: 'index.html#about' },
      { t: 'پروژه‌ها', type: 'section', label: 'صفحه', url: 'projects.html' },
      { t: 'خدمات', type: 'section', label: 'صفحه', url: 'services.html' },
      { t: 'ابزارهای مورد استفاده', type: 'service', label: 'بخش', url: 'services.html#tools' },
      { t: 'فرآیند همکاری', type: 'service', label: 'بخش', url: 'services.html#process' },
      { t: 'وبلاگ', type: 'section', label: 'صفحه', url: 'blog.html' },
      { t: 'تماس با من', type: 'section', label: 'صفحه', url: 'contact.html' },
      { t: 'خدمت: طراحی سایت اختصاصی', type: 'service', label: 'خدمت', url: 'services.html' },
      { t: 'خدمت: فروشگاه اینترنتی', type: 'service', label: 'خدمت', url: 'services.html' },
      { t: 'خدمت: ربات تلگرام و n8n', type: 'service', label: 'خدمت', url: 'services.html' },
      { t: 'خدمت: ابزارها و هوش مصنوعی', type: 'service', label: 'خدمت', url: 'services.html' },
      { t: 'خدمت: طراحی لوگو و بنر', type: 'service', label: 'خدمت', url: 'services.html' },
      { t: 'خدمت: نرم‌افزار و رفع خطا', type: 'service', label: 'خدمت', url: 'services.html' },
      { t: 'VS Code', type: 'service', label: 'ابزار', url: 'services.html#tools' },
      { t: 'Git و GitHub', type: 'service', label: 'ابزار', url: 'services.html#tools' },
      { t: 'n8n', type: 'service', label: 'ابزار', url: 'services.html#tools' },
      { t: 'ChatGPT', type: 'service', label: 'ابزار', url: 'services.html#tools' },
      { t: 'Canva', type: 'service', label: 'ابزار', url: 'services.html#tools' },
      { t: 'Photoshop', type: 'service', label: 'ابزار', url: 'services.html#tools' },
      { t: 'GitHub Pages', type: 'service', label: 'ابزار', url: 'services.html#tools' },
      { t: 'تلگرام — @Yousef017', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'اینستاگرام — @yousef._.parvaresh', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'کانال تلگرام — NeuroCodeX', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'شماره تلفن — ۰۹۳۷۰۱۳۲۹۶۵', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'ایمیل — yousefparvaresh89@gmail.com', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'آدرس — اردبیل، بیله‌سوار', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'گیت‌هاب — github.com/yousef0177', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'لینکدین', type: 'service', label: 'تماس', url: 'contact.html' },
      { t: 'دانلود رزومه', type: 'service', label: 'بخش', url: 'index.html#about' },
      { t: 'سایت مشاوره تحصیلی سبز اپلای', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p1' },
      { t: 'فروشگاه آنلاین کلکسیون کیف Bagify', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p2' },
      { t: 'فروشگاه اینترنتی پوشاک', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p3' },
      { t: 'کالکشن لوگو و بنر لوکس', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p4' },
      { t: 'وب‌سایت هواشناسی WeatherPro', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p5' },
      { t: 'وب‌سایت ساخت QR Code — QRONIX', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p6' },
      { t: 'وب‌سایت امنیت سایبری CyberGuard', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p7' },
      { t: 'نرم‌افزار آموزشی CyberGuard', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p8' },
      { t: 'نرم‌افزار شبیه‌ساز اعضای تلگرام', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p9' },
      { t: 'ربات هواشناسی WeatherBot Pro', type: 'project', label: 'پروژه', url: 'projects.html', kind: 'project', id: 'p10' },
      { t: 'مقاله: ۷ ترند جذاب طراحی وب در سال ۲۰۲۶', type: 'article', label: 'مقاله', url: 'blog.html', kind: 'article', id: 'a1' },
      { t: 'مقاله: چرا کسب‌وکار شما به وب‌سایت حرفه‌ای نیاز دارد؟', type: 'article', label: 'مقاله', url: 'blog.html', kind: 'article', id: 'a2' },
      { t: 'مقاله: راهنمای جامع سئو برای وب‌سایت‌های فارسی', type: 'article', label: 'مقاله', url: 'blog.html', kind: 'article', id: 'a3' }
    ];

    function runItem(item) {
      if (item.kind === 'project') {
        var card = $('.project-card[data-id="' + item.id + '"]');
        if (card) { openProject(card); return; }
      }
      if (item.kind === 'article') {
        var exists = $('.blog-card[data-article="' + item.id + '"]');
        if (exists) { openArticle(item.id); return; }
      }
      window.location.href = item.url;
    }

    function render(query) {
      if (!results) return;
      results.innerHTML = '';
      var q = (query || '').trim().toLowerCase();
      if (!q) { if (hint) hint.style.display = ''; return; }
      if (hint) hint.style.display = 'none';
      var matches = INDEX.filter(function (item) {
        return item.t.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);

      if (!matches.length) {
        var li = document.createElement('li');
        li.innerHTML = '<p class="search-empty">نتیجه‌ای یافت نشد؛ عبارت دیگری امتحان کنید.</p>';
        results.appendChild(li);
        return;
      }
      matches.forEach(function (item, i) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = i === 0 ? 'active' : '';
        btn.innerHTML =
          '<span class="sr-icon">' + (ICONS[item.type] || ICONS.section) + '</span>' +
          '<span>' + item.t + '</span>' +
          '<span class="sr-type">' + item.label + '</span>';
        btn.addEventListener('click', function () {
          close();
          window.setTimeout(function () { runItem(item); }, 120);
        });
        li.appendChild(btn);
        results.appendChild(li);
      });
    }

    function open() {
      if (!root) return;
      lastFocus = document.activeElement;
      root.hidden = false;
      body.classList.add('no-scroll');
      if (input) { input.value = ''; render(''); }
      if (input) input.focus();
    }
    function close() {
      if (!root) return;
      root.hidden = true;
      body.classList.remove('no-scroll');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    if (input) {
      input.addEventListener('input', function () { render(input.value); });
      input.addEventListener('keydown', function (e) {
        var items = $$('li button', results || document);
        if (!items.length) return;
        var current = items.findIndex(function (b) { return b.classList.contains('active'); });
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          var next = current < 0 ? 0 : Math.min(current + 1, items.length - 1);
          items.forEach(function (b) { b.classList.remove('active'); });
          items[next].classList.add('active');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = current < 0 ? 0 : Math.max(current - 1, 0);
          items.forEach(function (b) { b.classList.remove('active'); });
          items[prev].classList.add('active');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          var active = items.find(function (b) { return b.classList.contains('active'); }) || items[0];
          if (active) active.click();
        }
      });
    }

    return { open: open, close: close, isOpen: function () { return !!(root && !root.hidden); } };
  })();

  /* ═══════════════ ۱۴) فرم تماس ═══════════════ */
  (function initForm() {
    var form = $('#contactForm');
    if (!form) return;

    var fields = {
      name: { input: $('#fName'), error: $('#errName'), validate: function (v) {
        if (!v.trim()) return 'نام و نام خانوادگی را وارد کنید.';
        if (v.trim().length < 3) return 'نام باید حداقل ۳ نویسه باشد.';
        return '';
      } },
      email: { input: $('#fEmail'), error: $('#errEmail'), validate: function (v) {
        if (!v.trim()) return 'ایمیل را وارد کنید.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'قالب ایمیل صحیح نیست.';
        return '';
      } },
      subject: { input: $('#fSubject'), error: $('#errSubject'), validate: function (v) {
        if (!v.trim()) return 'موضوع پیام را وارد کنید.';
        if (v.trim().length < 3) return 'موضوع باید حداقل ۳ نویسه باشد.';
        return '';
      } },
      message: { input: $('#fMessage'), error: $('#errMsg'), validate: function (v) {
        if (!v.trim()) return 'متن پیام را وارد کنید.';
        if (v.trim().length < 10) return 'پیام باید حداقل ۱۰ نویسه باشد.';
        return '';
      } }
    };

    Object.keys(fields).forEach(function (key) {
      var f = fields[key];
      if (!f.input || !f.error) return;
      f.input.addEventListener('input', function () {
        f.error.textContent = '';
        f.input.classList.remove('invalid');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        if (!f.input || !f.error) return;
        var msg = f.validate(f.input.value);
        f.error.textContent = msg;
        f.input.classList.toggle('invalid', !!msg);
        if (msg && !firstInvalid) firstInvalid = f.input;
      });
      if (firstInvalid) { firstInvalid.focus(); showToast('لطفاً خطاهای فرم را برطرف کنید.', 'error'); return; }

      var subject = 'پیام از وب‌سایت شخصی — ' + fields.subject.input.value.trim();
      var bodyText =
        'نام: ' + fields.name.input.value.trim() + '\n' +
        'ایمیل: ' + fields.email.input.value.trim() + '\n\n' +
        fields.message.input.value.trim();
      var mailto = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(bodyText);
      try {
        window.location.href = mailto;
        showToast('پیام شما آماده شد؛ برنامه ایمیل باز می‌شود.', 'success');
        form.reset();
      } catch (err) {
        showToast('ارسال خودکار ممکن نشد؛ لطفاً مستقیم ایمیل بزنید.', 'error');
      }
    });
  })();

  /* ═══════════════ ۱۵) توست اعلان ═══════════════ */
  var toastTimer = null;
  function showToast(message, type) {
    var toast = $('#toast');
    var msg = $('#toastMsg');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.remove('success', 'error');
    toast.classList.add(type === 'error' ? 'error' : 'success');
    toast.classList.add('show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('show'); }, 4200);
  }

  /* ═══════════════ ۱۶) لوگوی هدر و فوتر ═══════════════ */
  /* فایل لوگو را با نام images/logo.png بگذارید؛ تا آن موقع حرف Y نمایش داده می‌شود */
  (function initLogo() {
    var marks = $$('.brand-mark');
    if (!marks.length) return;
    var probe = new Image();
    probe.onload = function () {
      marks.forEach(function (m) {
        m.classList.add('has-logo');
        var im = $('.brand-logo', m);
        if (im) im.src = 'images/logo.png';
      });
    };
    probe.onerror = function () {
      marks.forEach(function (m) { m.classList.remove('has-logo'); });
    };
    /* بدون query-string تا در باز کردن محلی (file://) هم درست کار کند */
    probe.src = 'images/logo.png';
  })();
  /* ═══════════════ ۱۷) دکمه دانلود رزومه ═══════════════ */
  /* تا وقتی فایل files/resume.pdf وجود نداشته باشد، دکمه مخفی می‌ماند */
  (function initResume() {
    var btns = $$('.js-resume');
    if (!btns.length) return;
    function hideAll() { btns.forEach(function (b) { b.style.display = 'none'; }); }
    if (!window.fetch) { hideAll(); return; }
    fetch(RESUME_URL, { method: 'HEAD' })
      .then(function (res) { if (!res.ok) hideAll(); })
      .catch(hideAll);
  })();

  /* ═══════════════ ۱۸) دکمه‌های کپی ═══════════════ */
  (function initCopy() {
    $$('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy') || '';
        function legacy() {
          try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            var ok = document.execCommand('copy');
            document.body.removeChild(ta);
            showToast(ok ? 'کپی شد: ' + text : 'کپی ناموفق بود؛ دستی کپی کنید.', ok ? 'success' : 'error');
          } catch (err) {
            showToast('کپی ناموفق بود؛ دستی کپی کنید.', 'error');
          }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast('کپی شد: ' + text, 'success');
          }).catch(legacy);
        } else {
          legacy();
        }
      });
    });
  })();

  /* ═══════════════ ۱۹) تصویر پروفایل (قاب خالی) ═══════════════ */
  (function initProfilePhoto() {
    var wrap = $('#heroPhoto');
    var img = $('#profileImg');
    if (!wrap || !img) return;
    function check() {
      if (img.complete && img.naturalWidth > 0) wrap.classList.add('has-photo');
    }
    img.addEventListener('load', function () { wrap.classList.add('has-photo'); });
    img.addEventListener('error', function () { wrap.classList.remove('has-photo'); });
    check();
  })();

  /* ═══════════════ ۲۰) سال شمسی فوتر ═══════════════ */
  (function initFaYear() {
    var el = $('#faYear');
    if (!el) return;
    try {
      var formatted = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(new Date());
      var yearOnly = formatted.replace(/[^\u06F0-\u06F9]/g, '');
      if (yearOnly) el.textContent = yearOnly;
    } catch (e) { /* مقدار پیش‌فرض ۱۴۰۵ باقی می‌ماند */ }
  })();

  /* ═══════════════ ۲۱) کلید Escape و جهت‌نمای لایت‌باکس ═══════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (search.isOpen()) { search.close(); return; }
      if (lightbox.isOpen()) { lightbox.close(); return; }
      if (modal.root && !modal.root.hidden) { modal.close(); return; }
      if (drawer.isOpen()) { drawer.close(); }
      return;
    }
    if (lightbox.isOpen()) {
      if (e.key === 'ArrowRight') { e.preventDefault(); lightbox.step(-1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); lightbox.step(1); }
    }
  });

})();
