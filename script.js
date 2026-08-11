document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    // Mobile navigation: one source of truth for open/close state.
    const mobileToggle = $('#mobileToggle');
    const navMenu = $('#navMenu');
    const mobileOverlay = $('#mobileOverlay');
    const navLinks = $$('.nav-link');
    mobileToggle?.setAttribute('aria-controls', 'navMenu');
    navMenu?.setAttribute('aria-hidden', 'true');

    const setMenuState = (open) => {
        if (!navMenu || !mobileOverlay || !mobileToggle) return;
        navMenu.classList.toggle('active', open);
        mobileOverlay.classList.toggle('active', open);
        document.body.classList.toggle('menu-open', open);
        mobileToggle.setAttribute('aria-expanded', String(open));
        mobileToggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
        navMenu.setAttribute('aria-hidden', String(!open));
        mobileToggle.innerHTML = open
            ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    };

    mobileToggle?.addEventListener('click', () => {
        setMenuState(!navMenu?.classList.contains('active'));
    });
    mobileOverlay?.addEventListener('click', () => setMenuState(false));
    navLinks.forEach(link => link.addEventListener('click', () => setMenuState(false)));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setMenuState(false);
            closeLightbox();
        }
    });

    // Scroll spy is throttled with requestAnimationFrame to avoid excess layout work.
    const masterSectionIds = ['home', 'services', 'portfolio', 'reviews', 'contact'];
    let spyFrame = 0;
    const scrollSpy = () => {
        if (spyFrame) return;
        spyFrame = requestAnimationFrame(() => {
            spyFrame = 0;
            const marker = window.scrollY + 140;
            let activeId = 'home';
            masterSectionIds.forEach(id => {
                const section = document.getElementById(id);
                if (section && marker >= section.offsetTop && marker < section.offsetTop + section.offsetHeight) activeId = id;
            });
            navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));
        });
    };
    window.addEventListener('scroll', scrollSpy, { passive: true });
    window.addEventListener('resize', scrollSpy, { passive: true });
    scrollSpy();

    // Reveal-on-scroll with reduced-motion support.
    const revealElements = $$('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale-up');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealElements.forEach(element => element.classList.add('reveal-active'));
    } else if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealElements.forEach(element => revealObserver.observe(element));
    } else {
        revealElements.forEach(element => element.classList.add('reveal-active'));
    }

    // Animated counters: write final values immediately so +0/0% never remains visible.
    const counterElements = $$('.counter');
    const startCounters = () => {
        counterElements.forEach(counter => {
            const target = Number(counter.dataset.target);
            if (!Number.isFinite(target)) return;
            const original = counter.textContent || '';
            const isPercentage = original.includes('%');
            const isPlus = original.includes('+');
            const format = value => `${isPlus ? '+' : ''}${value}${isPercentage ? '%' : ''}`;
            counter.textContent = format(target);
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const start = performance.now();
            const duration = 900;
            const render = now => {
                const progress = Math.min((now - start) / duration, 1);
                const value = Math.ceil(target * (1 - Math.pow(1 - progress, 3)));
                counter.textContent = format(value);
                if (progress < 1) requestAnimationFrame(render);
            };
            requestAnimationFrame(render);
        });
    };
    if (counterElements.length) startCounters();

    // Portfolio filtering; cancel stale timers so rapid taps never leave hidden cards visible.
    const filterBtns = $$('.filter-btn');
    const portfolioItems = $$('.portfolio-item');
    let filterTimer;
    filterBtns.forEach(button => button.addEventListener('click', () => {
        filterBtns.forEach(item => item.classList.toggle('active', item === button));
        const filter = button.dataset.filter || 'all';
        clearTimeout(filterTimer);
        portfolioItems.forEach(item => {
            const visible = filter === 'all' || item.dataset.category === filter;
            item.classList.toggle('is-filtered-out', !visible);
            if (visible) item.style.removeProperty('display');
        });
        filterTimer = setTimeout(() => {
            portfolioItems.forEach(item => {
                if (item.classList.contains('is-filtered-out')) item.style.display = 'none';
            });
        }, 260);
    }));

    // Before/after comparison slider.
    const baRangeInput = $('#baRangeInput');
    const baAfterLayer = $('#baAfterLayer');
    const baHandle = $('#baHandle');
    const updateBeforeAfter = value => {
        const numericValue = Math.max(0, Math.min(100, Number(value) || 50));
        if (baAfterLayer) baAfterLayer.style.clipPath = `inset(0 0 0 ${numericValue}%)`;
        if (baHandle) baHandle.style.left = `${numericValue}%`;
    };
    baRangeInput?.addEventListener('input', event => updateBeforeAfter(event.target.value));
    if (baRangeInput) updateBeforeAfter(baRangeInput.value || 50);

    // Lightbox.
    const lightboxModal = $('#lightboxModal');
    const lightboxImg = $('#lightboxImg');
    const lightboxCaption = $('#lightboxCaption');
    const lightboxClose = $('#lightboxClose');
    let lastLightboxTrigger = null;
    const closeLightbox = () => {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        lightboxImg?.removeAttribute('src');
        lastLightboxTrigger?.focus({ preventScroll: true });
        lastLightboxTrigger = null;
    };
    $$('.btn-zoom-img').forEach(button => button.addEventListener('click', () => {
        if (!lightboxModal || !lightboxImg) return;
        lightboxImg.src = button.dataset.img || '';
        lightboxImg.alt = button.dataset.title || 'صورة من أعمالنا';
        if (lightboxCaption) lightboxCaption.textContent = button.dataset.title || '';
        lastLightboxTrigger = button;
        lightboxModal.classList.add('active');
        document.body.classList.add('modal-open');
        lightboxClose?.focus({ preventScroll: true });
    }));
    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxModal?.addEventListener('click', event => {
        if (event.target === lightboxModal) closeLightbox();
    });

    // Toast helper with a single replaceable timer.
    const toast = $('#toastNotification');
    const toastMessage = $('#toastMessage');
    let toastTimer;
    const showToast = (message, duration = 4000) => {
        if (!toast) return;
        if (toastMessage) toastMessage.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
    };

    // GPS capture.
    const getLocationBtn = $('#getLocationBtn');
    const locationStatus = $('#locationStatus');
    const locationUrlInput = $('#locationUrlInput');
    getLocationBtn?.addEventListener('click', () => {
        if (!navigator.geolocation) {
            if (locationStatus) locationStatus.textContent = 'خدمة GPS غير مدعومة في متصفحك. اختر الحي من القائمة.';
            return;
        }
        const originalHtml = getLocationBtn.innerHTML;
        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري تحديد موقعك...</span>';
        if (locationStatus) locationStatus.textContent = 'يرجى السماح للمتصفح بتحديد موقعك الجغرافي...';
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
            if (locationUrlInput) locationUrlInput.value = mapsUrl;
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>تم التقاط الموقع بنجاح</span>';
            if (locationStatus) locationStatus.innerHTML = `<strong>تم تحديد موقعك:</strong> <a href="${mapsUrl}" target="_blank" rel="noopener">عرض على الخريطة</a>`;
            showToast('تم التقاط موقعك الجغرافي بنجاح');
        }, () => {
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = originalHtml;
            if (locationStatus) locationStatus.textContent = 'تعذر تحديد الموقع تلقائيًا. اختر الحي من القائمة.';
            showToast('تعذر تحديد الموقع تلقائيًا');
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });

    // Contact form to WhatsApp.
    const contactForm = $('#contactForm');
    contactForm?.addEventListener('submit', event => {
        event.preventDefault();
        const value = id => document.getElementById(id)?.value.trim() || '';
        const name = value('nameInput');
        const phone = value('phoneInput');
        const district = value('districtInput');
        const service = value('serviceInput');
        const location = value('locationUrlInput');
        const notes = value('messageInput');
        if (!name || !phone || !district || !service) {
            showToast('يرجى إكمال البيانات المطلوبة أولًا');
            contactForm.querySelector(':invalid')?.focus();
            return;
        }
        const submitBtn = $('#submitBtn');
        const originalHtml = submitBtn?.innerHTML || '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري تجهيز الواتساب...</span>';
        }
        const message = [
            'السلام عليكم، أرغب في طلب خدمة صرف صحي بمكة المكرمة:', '',
            `الاسم: ${name}`, `رقم الجوال: ${phone}`, `الحي في مكة: ${district}`, `الخدمة المطلوبة: ${service}`,
            `الموقع: ${location || 'لم يتم التقاط رابط GPS تلقائي'}`, notes ? `ملاحظات إضافية: ${notes}` : ''
        ].filter(Boolean).join('\n');
        const url = `https://wa.me/966533255939?text=${encodeURIComponent(message)}`;
        showToast('جاري فتح محادثة الواتساب...');
        window.open(url, '_blank', 'noopener');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
        }
    });

    // FAQ accordion: one open panel, keyboard-friendly ARIA state.
    const faqItems = $$('.faq-item');
    faqItems.forEach(item => {
        const question = $('.faq-question', item);
        if (!question) return;
        question.setAttribute('aria-expanded', String(item.classList.contains('active')));
        question.addEventListener('click', () => {
            const shouldOpen = !item.classList.contains('active');
            faqItems.forEach(other => {
                other.classList.remove('active');
                $('.faq-question', other)?.setAttribute('aria-expanded', 'false');
            });
            item.classList.toggle('active', shouldOpen);
            question.setAttribute('aria-expanded', String(shouldOpen));
        });
    });

    // Live dispatch ticker with clean timer lifecycle.
    const tickerWidget = $('#liveDispatchTicker');
    const tickerText = $('#tickerText');
    const tickerCloseBtn = $('#tickerCloseBtn');
    if (tickerWidget && tickerText) {
        const alerts = [
            'تم توجيه وايت شفط إلى حي الشرائع مخطط 4 (منذ 5 دقائق)',
            'طاقم فني يتواجد الآن في حي الشوقية لفك انسداد مجاري',
            'تم سحب بيارة رئيسية في حي العزيزية بنجاح (منذ 12 دقيقة)',
            'تريلة شفط سعة كبيرة في الطريق إلى مخطط ولي العهد',
            'تم غسيل وتطهير مانهول بالضغط العالي في حي العوالي'
        ];
        let index = 0;
        let timer = null;
        let closed = false;
        let paused = document.hidden;
        const clearTickerTimer = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };
        const scheduleCycle = delay => {
            clearTickerTimer();
            if (!closed && !paused) timer = setTimeout(cycle, delay);
        };
        const cycle = () => {
            if (closed || paused) return;
            tickerText.textContent = alerts[index];
            tickerWidget.classList.remove('hidden');
            timer = setTimeout(() => {
                tickerWidget.classList.add('hidden');
                index = (index + 1) % alerts.length;
                scheduleCycle(15000);
            }, 8000);
        };
        scheduleCycle(3000);
        document.addEventListener('visibilitychange', () => {
            paused = document.hidden;
            if (paused) clearTickerTimer();
            else if (!closed) scheduleCycle(1000);
        });
        tickerCloseBtn?.addEventListener('click', () => {
            closed = true;
            clearTickerTimer();
            tickerWidget.classList.add('hidden');
        });
    }
});
