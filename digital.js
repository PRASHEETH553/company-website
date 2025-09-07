document.addEventListener('DOMContentLoaded', function() {
    // Animation 1: Page Loading Animation
    const loader = document.querySelector('.loader-container');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 2000);
    } else {
        console.warn('Loader container not found');
    }

    // Animation 2: Scroll Progress Bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winScroll = window.scrollY || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = `${Math.min(scrolled, 100)}%`; // Cap at 100%
        });
    } else {
        console.warn('Progress bar element not found');
    }

    // Animation 3: Service Cards Reveal on Scroll
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        serviceCards.forEach((card, index) => {
            observer.observe(card);
            card.style.transitionDelay = `${index * 100}ms`;
        });
    }

    // Animation 4: Parallax Effect
    const heroShapes = document.querySelectorAll('.hero-shape');
    if (heroShapes.length > 0) {
        document.addEventListener('mousemove', (e) => {
            heroShapes.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 5;
                const x = (window.innerWidth - e.pageX * speed) / 100;
                const y = (window.innerHeight - e.pageY * speed) / 100;
                layer.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }

    // Animation 5: Mouse Spotlight Effect
    const spotlight = document.querySelector('.spotlight');
    if (spotlight) {
        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {
                spotlight.style.display = 'block';
                spotlight.style.left = `${e.pageX - 150}px`;
                spotlight.style.top = `${e.pageY - 150}px`;
            } else {
                spotlight.style.display = 'none';
            }
        });
    }

    // Animation 6: Testimonial Slider
    const testimonialTrack = document.querySelector('.testimonial-track');
    const testimonials = document.querySelectorAll('.testimonial');
    const sliderButtons = document.querySelectorAll('.slider-btn'); // Renamed to avoid confusion
    if (testimonialTrack && testimonials.length > 0 && sliderButtons.length > 0) {
        let currentIndex = 0;

        function goToSlide(index) {
            testimonialTrack.style.transform = `translateX(-${index * 100}%)`;
            sliderButtons.forEach(btn => btn.classList.remove('active'));
            sliderButtons[index].classList.add('active');
            currentIndex = parseInt(index);
        }

        sliderButtons.forEach(btn => { // Fixed variable name from 'button' to 'btn'
            btn.addEventListener('click', () => {
                const slideIndex = parseInt(btn.getAttribute('data-index'));
                if (!isNaN(slideIndex)) goToSlide(slideIndex);
            });
        });

        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            goToSlide(currentIndex);
        }, 5000);
    }

    // Animation 7: Particles Animation
    function createParticles(containerId, count = 50) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Particle container '${containerId}' not found`);
            return;
        }

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 12 + 3;
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                background-color: ${['#FF5F7E', '#6CA6FF', '#FFD166', '#9C89FF', '#60D394'][Math.floor(Math.random() * 5)]};
                opacity: ${Math.random() * 0.5 + 0.1};
                animation: float ${Math.random() * 20 + 10}s ease-in-out infinite;
            `;
            container.appendChild(particle);
            animateParticle(particle, Math.random() > 0.5 ? 1 : -1);
        }
    }

    function animateParticle(particle, direction) {
        let posX = parseFloat(particle.style.left);
        let posY = parseFloat(particle.style.top);
        let speedX = (Math.random() - 0.5) * 0.2;
        let speedY = (Math.random() - 0.5) * 0.2;

        function update() {
            posX += speedX * direction;
            posY += speedY * direction;
            if (posX < 0 || posX > 100) speedX *= -1;
            if (posY < 0 || posY > 100) speedY *= -1;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            requestAnimationFrame(update);
        }
        update();
    }

    createParticles('particles', 30);
    createParticles('cta-particles', 20);

    // Animation 8: Floating Stars Animation
    const hero = document.querySelector('.hero');
    if (hero) {
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            const size = Math.random() * 20 + 5;
            star.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: pulse ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            hero.appendChild(star);
            setTimeout(() => {
                star.style.opacity = Math.random() * 0.7 + 0.3;
            }, Math.random() * 3000);
        }
    }

    // Animation 9: Text Animation for Feature Section
    const featureTitles = document.querySelectorAll('.feature h3');
    if (featureTitles.length > 0) {
        featureTitles.forEach(title => {
            const text = title.textContent.trim();
            title.textContent = '';
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.cssText = `
                    opacity: 0;
                    display: inline-block;
                    transform: translateY(20px);
                    transition: all 0.3s ease ${i * 50}ms;
                `;
                title.appendChild(span);
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(title);
        });
    }

    // Animation 10: Image Reveal Animation
    const featureImages = document.querySelectorAll('.feature-image');
    if (featureImages.length > 0) {
        featureImages.forEach(image => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #FF5F7E, #FFD166);
                transform: scaleX(1);
                transform-origin: right;
                transition: transform 1s cubic-bezier(0.77, 0, 0.175, 1);
                z-index: 1;
            `;
            image.style.position = 'relative';
            image.appendChild(overlay);

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            observer.observe(image);
        });
    }

    // Animation 11: Button Hover Animation Enhancement
    const ctaButtons = document.querySelectorAll('.cta-button, .primary-btn, .secondary-btn'); // Renamed to avoid conflict
    if (ctaButtons.length > 0) {
        ctaButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.7);
                    left: ${x}px;
                    top: ${y}px;
                    animation: scale 0.5s linear;
                    transform: scale(0);
                `;
                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 500);
            });
        });
    }

    // Animation 12: Navbar Scroll Effect
    const header = document.querySelector('header');
    const logo = document.querySelector('.logo');
    if (header && logo) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 95, 126, 0.95)';
                header.style.padding = '1rem 1.5rem';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                logo.style.fontSize = '1.5rem';
            } else {
                header.style.background = 'linear-gradient(135deg, #FF5F7E 0%, #FFD166 100%)';
                header.style.padding = '1.5rem';
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
                logo.style.fontSize = '1.8rem';
            }
        });
    }

    // Animation 13: Parallax Scroll Effect
    const containers = document.querySelectorAll('.feature, .hero, .cta-section');
    if (containers.length > 0) {
        containers.forEach(container => {
            const parallaxBg = document.createElement('div');
            parallaxBg.classList.add('parallax-bg');
            for (let i = 0; i < 5; i++) {
                const item = document.createElement('div');
                item.classList.add('parallax-item');
                const size = Math.random() * 100 + 50;
                const depth = Math.random() * 5 + 1;
                item.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                `;
                item.setAttribute('data-depth', depth);
                parallaxBg.appendChild(item);
            }
            container.appendChild(parallaxBg);
        });

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            document.querySelectorAll('.parallax-item').forEach(item => {
                const depth = parseFloat(item.getAttribute('data-depth'));
                const movement = scrollY * (depth / 10);
                item.style.transform = `translateY(${movement}px)`;
            });
        });
    }

    // Animation 14: Letter Animation for Logo
    if (logo) {
        const logoText = logo.textContent.trim();
        logo.innerHTML = '';
        logoText.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.cssText = 'display: inline-block; transition: all 0.3s ease;';
            span.addEventListener('mouseenter', function() {
                this.style.color = '#FF5F7E';
                this.style.transform = 'translateY(-5px) rotate(10deg)';
            });
            span.addEventListener('mouseleave', function() {
                this.style.color = '';
                this.style.transform = '';
            });
            logo.appendChild(span);
        });
    }

    // Animation 15: Wave Animation in Footer
    const footer = document.querySelector('footer');
    if (footer) {
        const wave = document.createElement('div');
        wave.style.cssText = `
            position: absolute;
            top: -70px;
            left: 0;
            width: 100%;
            height: 70px;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' style='fill:%23FDF6E3;'%3E%3C/path%3E%3C/svg%3E");
            background-size: 100% 100%;
        `;
        footer.style.position = 'relative';
        footer.style.marginTop = '70px';
        footer.insertBefore(wave, footer.firstChild);
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});