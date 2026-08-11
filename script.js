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

    // 1.5 Scroll-Spy Active Menu Highlight for 5 Master Sections
    const masterSectionIds = ['home', 'services', 'portfolio', 'reviews', 'contact'];
    function scrollSpy() {
        const currentScrollY = window.pageYOffset + 140;
        let activeId = 'home';

        masterSectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
                    activeId = id;
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', scrollSpy);
    scrollSpy();

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

    // 7. Contact Form & Geolocation GPS to WhatsApp Dispatch
    const contactForm = document.getElementById('contactForm');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationStatus = document.getElementById('locationStatus');
    const locationUrlInput = document.getElementById('locationUrlInput');
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    function showToast(message, duration = 4000) {
        if (toastMessage) toastMessage.textContent = message;
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }
    }

    // Geolocation GPS Capture
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                if (locationStatus) {
                    locationStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> خدمة GPS غير مدعومة في متصفحك. اختر حيك من القائمة.';
                }
                return;
            }

            const originalBtnHtml = getLocationBtn.innerHTML;
            getLocationBtn.disabled = true;
            getLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري تحديد موقعك الجغرافي...</span>';
            
            if (locationStatus) {
                locationStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> يرجى إعطاء الإذن للمتصفح لتحديد موقعك الجغرافي...';
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
                    
                    if (locationUrlInput) locationUrlInput.value = mapsUrl;
                    
                    getLocationBtn.disabled = false;
                    getLocationBtn.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #25D366;"></i> <span>تم التقاط الموقع بنجاح!</span>';
                    getLocationBtn.style.borderColor = '#25D366';
                    
                    if (locationStatus) {
                        locationStatus.innerHTML = `<i class="fa-solid fa-location-dot" style="color: #25D366;"></i> <strong>تم تحديد موقعك:</strong> <a href="${mapsUrl}" target="_blank" style="color: #2dd4bf; text-decoration: underline;">عرض على الخريطة</a>`;
                    }
                    showToast('تم التقاط موقعك الجغرافي بنجاح! 📍');
                },
                (error) => {
                    getLocationBtn.disabled = false;
                    getLocationBtn.innerHTML = originalBtnHtml;
                    if (locationStatus) {
                        locationStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i> تعذر تحديد الموقع تلقائياً. يرجى اختيار حيك في القائمة.';
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }

    // Form Submit to WhatsApp Handler
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('nameInput')?.value.trim() || '';
            const phone = document.getElementById('phoneInput')?.value.trim() || '';
            const district = document.getElementById('districtInput')?.value || '';
            const service = document.getElementById('serviceInput')?.value || '';
            const locationUrl = document.getElementById('locationUrlInput')?.value || '';
            const notes = document.getElementById('messageInput')?.value.trim() || '';

            const submitBtn = document.getElementById('submitBtn');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري تجهيز محادثة الواتساب...</span>';

            // Construct WhatsApp Formatted Message
            let waText = `السلام عليكم، أرغب في طلب خدمة صرف صحي بمكة المكرمة:\n\n`;
            waText += `👤 *الاسم:* ${name}\n`;
            waText += `📱 *رقم الجوال:* ${phone}\n`;
            waText += `📍 *الحي في مكة:* ${district}\n`;
            waText += `🔧 *الخدمة المطلوبة:* ${service}\n`;
            if (locationUrl) {
                waText += `🗺️ *رابط الموقع الجغرافي (GPS):* ${locationUrl}\n`;
            } else {
                waText += `🗺️ *الموقع:* (لم يتم التقاط رابط GPS تلقائي)\n`;
            }
            if (notes) {
                waText += `📝 *ملاحظات إضافية:* ${notes}\n`;
            }

            const encodedText = encodeURIComponent(waText);
            const waTargetUrl = `https://wa.me/966533255939?text=${encodedText}`;

            setTimeout(() => {
                showToast('جاري توجيهك فوراً لمحادثة الواتساب المباشرة مع الفني...');
                window.open(waTargetUrl, '_blank');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 800);
        });
    }

    // 8. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherBtn = otherItem.querySelector('.faq-question');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                });

                // Toggle target item
                if (!isActive) {
                    item.classList.add('active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    // 9. Realistic Live Social Proof Dispatch Ticker Rotation
    const tickerWidget = document.getElementById('liveDispatchTicker');
    const tickerText = document.getElementById('tickerText');
    const tickerCloseBtn = document.getElementById('tickerCloseBtn');

    if (tickerWidget && tickerText) {
        const dispatchAlerts = [
            'تم توجيه وايت شفط إلى حي الشرائع مخطط 4 (منذ 5 دقائق)',
            'طاقم فني يتواجد الآن في حي الشوقية لفك انسداد مجاري',
            'تم سحب بيارة رئيسية في حي العزيزية بنجاح (منذ 12 دقيقة)',
            'تريلة شفط سعة كبيرة في الطريق إلى مخطط ولي العهد',
            'تم غسيل وتطهير مانهول بالضغط العالي في حي العوالي'
        ];

        let alertIndex = 0;
        let tickerTimer = null;
        let isClosedByUser = false;

        const VISIBLE_DURATION = 8000;  // 8 ثواني ظهور
        const HIDDEN_DURATION = 15000;  // 15 ثانية اختفاء

        function showNotification() {
            if (isClosedByUser) return;

            // ضبط النص وإظهار التنبيه
            tickerText.textContent = dispatchAlerts[alertIndex];
            tickerWidget.classList.remove('hidden');

            // جدولة الاختفاء بعد 8 ثواني
            tickerTimer = setTimeout(() => {
                hideNotification();
            }, VISIBLE_DURATION);
        }

        function hideNotification() {
            if (isClosedByUser) return;

            // إخفاء التنبيه
            tickerWidget.classList.add('hidden');

            // الانقال للتنبيه التالي
            alertIndex = (alertIndex + 1) % dispatchAlerts.length;

            // جدولة الظهور التالي بعد 15 ثانية اختفاء
            tickerTimer = setTimeout(() => {
                showNotification();
            }, HIDDEN_DURATION);
        }

        // البدء بعد 3 ثواني من فتح الصفحة
        tickerTimer = setTimeout(showNotification, 3000);

        if (tickerCloseBtn) {
            tickerCloseBtn.addEventListener('click', () => {
                isClosedByUser = true;
                if (tickerTimer) clearTimeout(tickerTimer);
                tickerWidget.classList.add('hidden');
            });
        }
    }
});


