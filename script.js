document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Drawer Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function toggleMenu() {
        navMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        const isOpen = navMenu.classList.contains('active');
        mobileToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    }

    if (mobileToggle) mobileToggle.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // 1.5 Scroll-Spy Active Menu Highlight
    const sections = document.querySelectorAll('section[id]');
    function scrollSpy() {
        const currentScrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');
            const targetNavLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);
            if (targetNavLink) {
                if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    targetNavLink.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', scrollSpy);

    // 2. IntersectionObserver Scroll Reveal Animations (css-animation-creator)
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale-up');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Animated Number Counters
    const counterElements = document.querySelectorAll('.counter');
    let countersStarted = false;

    function startCounters() {
        if (countersStarted) return;
        counterElements.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const isPercentage = counter.textContent.includes('%');
            const isPlus = counter.textContent.includes('+');
            let count = 0;
            const speed = target / 50;

            const updateCount = () => {
                count += speed;
                if (count < target) {
                    counter.innerText = `${isPlus ? '+' : ''}${Math.ceil(count)}${isPercentage ? '%' : ''}`;
                    setTimeout(updateCount, 25);
                } else {
                    counter.innerText = `${isPlus ? '+' : ''}${target}${isPercentage ? '%' : ''}`;
                }
            };
            updateCount();
        });
        countersStarted = true;
    }

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounters();
            }
        }, { threshold: 0.5 });
        statsObserver.observe(heroStats);
    }

    // 4. Portfolio Category Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 5. Before & After Slider Logic
    const baRangeInput = document.getElementById('baRangeInput');
    const baAfterLayer = document.getElementById('baAfterLayer');
    const baHandle = document.getElementById('baHandle');

    if (baRangeInput && baAfterLayer && baHandle) {
        function updateBeforeAfterSlider(val) {
            baAfterLayer.style.clipPath = `inset(0 0 0 ${val}%)`;
            baHandle.style.left = `${val}%`;
        }

        baRangeInput.addEventListener('input', (e) => {
            updateBeforeAfterSlider(e.target.value);
        });

        baRangeInput.addEventListener('change', (e) => {
            updateBeforeAfterSlider(e.target.value);
        });

        // Initialize at 50%
        updateBeforeAfterSlider(baRangeInput.value || 50);
    }

    // 6. Lightbox Modal Image Zoom
    const zoomButtons = document.querySelectorAll('.btn-zoom-img');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    zoomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const imgSrc = btn.getAttribute('data-img');
            const imgTitle = btn.getAttribute('data-title');
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = imgTitle;
            lightboxModal.classList.add('active');
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightboxModal.classList.remove('active');
        });
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.remove('active');
            }
        });
    }

    // 7. Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    function showToast(message, duration = 4000) {
        if (toastMessage) toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري الإرسال...</span>';

            setTimeout(() => {
                showToast('شكراً لتواصلك معنا! تم استقبال طلبك وسنقوم بالاتصال بك فوراً.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 1200);
        });
    }
});
