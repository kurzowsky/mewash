// --- KONFIGURACJA TAILWIND ---
tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
                primary: '#0ea5e9',
                dark: '#0f172a',
                accent: '#f59e0b',
            },
            animation: {
                'blob': 'blob 7s infinite',
            },
            keyframes: {
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" }
                }
            }
        }
    }
}

// --- LOGIKA APLIKACJI ---
document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }
    
    // 2. Scroll Reveal
    function reveal() {
        var reveals = document.querySelectorAll(".reveal");
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 100;
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            }
        }
    }
    window.addEventListener("scroll", reveal);

    // 3. Slider Logic (Obsługa wielu suwaków Przed/Po)
    const sliders = document.querySelectorAll(".slider-range");
    
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const container = e.target.closest('.comparison-container');
            const divisor = container.querySelector('.divisor');
            if (divisor) {
                divisor.style.width = e.target.value + "%";
            }
        });
        const container = slider.closest('.comparison-container');
        const divisor = container.querySelector('.divisor');
        if (divisor) {
            divisor.style.width = "50%";
        }
    });

    // 3.1 Logic for Carousel
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    
    if (track && prevBtn && nextBtn) {
        let currentIndex = 0;
        const slides = track.children;
        const totalSlides = slides.length;

        function updateCarousel() {
            const width = 100;
            track.style.transform = `translateX(-${currentIndex * width}%)`;
        }

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }
    
    // 4. Kalkulator + Obsługa Entera
    const form = document.getElementById('estimation-form');
    const serviceTypeSelect = document.getElementById('serviceType');
    const acreageInput = document.getElementById('acreageInput');
    const resultDiv = document.getElementById('estimationResult');
    
    function calculateEstimation() {
        const acreage = parseInt(acreageInput.value); 
        const serviceKey = serviceTypeSelect.value;
        
        if (isNaN(acreage) || acreage <= 0) {
            resultDiv.innerHTML = "🚨 Podaj poprawny metraż (m²).";
            resultDiv.classList.remove('hidden', 'bg-blue-50', 'border-blue-200');
            resultDiv.classList.add('bg-red-100', 'border-red-300');
            resultDiv.classList.remove('hidden');
            return;
        }

        let pricePerSqMeter = 0;

        if (serviceKey === 'paving') {
            pricePerSqMeter = acreage <= 100 ? 12 : 10;
        } else if (serviceKey === 'facade') {
            pricePerSqMeter = acreage <= 50 ? 12 : 10;
        } else if (serviceKey === 'impregnation') {
            pricePerSqMeter = acreage <= 100 ? 8 : 6;
        }

        const serviceName = serviceTypeSelect.options[serviceTypeSelect.selectedIndex].text;
        const totalCost = acreage * pricePerSqMeter;
        
        resultDiv.innerHTML = `
            💰 Wstępna wycena za <strong>${serviceName}</strong> (${acreage} m²) to: 
            <br><span class="text-primary font-extrabold text-2xl">${totalCost.toFixed(0)} PLN</span>.
            <br><span class="text-xs text-slate-500 font-normal">(Stawka przyjęta: ${pricePerSqMeter} PLN/m²)</span>
        `;
        resultDiv.classList.remove('hidden', 'bg-red-100', 'border-red-300');
        resultDiv.classList.add('bg-blue-50', 'border-blue-200');
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateEstimation();
        });
    }

    // 5. Animacja Liczników
    const statsSection = document.getElementById('stats-section');
    const counters = document.querySelectorAll('.counter');
    let started = false; 
    
    function handleScroll() {
        reveal();

        if(statsSection) {
            const sectionPos = statsSection.getBoundingClientRect().top;
            const screenPos = window.innerHeight / 1.2;
            
            if(sectionPos < screenPos && !started) {
                counters.forEach(counter => {
                    let current = 0;
                    const target = +counter.getAttribute('data-target');
                    const updateCount = () => {
                        if(current < target) {
                            current += Math.ceil(target / 50); 
                            if(current > target) current = target;
                            counter.innerText = current;
                            setTimeout(updateCount, 30);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
                started = true;
            }
        }

        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                scrollToTopBtn.classList.add('opacity-100', 'translate-y-0');
            } else {
                scrollToTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                scrollToTopBtn.classList.remove('opacity-100', 'translate-y-0');
            }
        }
    }

    window.addEventListener('scroll', handleScroll);

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if(scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. FAQ Accordion Logic
    const faqBtns = document.querySelectorAll('.faq-btn');
    
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('.icon');
            const iconInner = icon.querySelector('i');

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.classList.remove('bg-primary', 'text-white', 'rotate-45');
                icon.classList.add('bg-white', 'text-primary');
                iconInner.classList.remove('fa-minus');
                iconInner.classList.add('fa-plus');
            } else {
                document.querySelectorAll('.faq-content').forEach(el => el.style.maxHeight = null);
                document.querySelectorAll('.faq-btn .icon').forEach(el => {
                        el.classList.remove('bg-primary', 'text-white', 'rotate-45');
                        el.classList.add('bg-white', 'text-primary');
                        el.querySelector('i').classList.remove('fa-minus');
                        el.querySelector('i').classList.add('fa-plus');
                });

                content.style.maxHeight = content.scrollHeight + "px";
                icon.classList.remove('bg-white', 'text-primary');
                icon.classList.add('bg-primary', 'text-white', 'rotate-45');
                iconInner.classList.remove('fa-plus');
                iconInner.classList.add('fa-minus');
            }
        });
    });

    // 7. Logic for 3D Tilt Effect on Cards
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    });

    reveal();
});