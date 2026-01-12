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
            // Przesuwamy o 100% szerokości
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
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
        
        resultDiv.className = 'estimation-result'; // Reset klas
        
        if (isNaN(acreage) || acreage <= 0) {
            resultDiv.innerHTML = "🚨 Podaj poprawny metraż (m²).";
            // Możemy dodać styl inline dla błędu lub dodatkową klasę w CSS
            resultDiv.style.backgroundColor = '#fee2e2'; // red-100
            resultDiv.style.borderColor = '#fca5a5'; // red-300
            resultDiv.style.color = '#991b1b'; // red-800
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
        const mintotal = totalCost - 100;
        const maxtotal = totalCost + 100;

        resultDiv.innerHTML = `
            💰 Wstępna wycena za <strong>${serviceName}</strong> (${acreage} m²) to: 
            <br><span style="color:var(--primary); font-size:1.5rem;">${mintotal} - ${maxtotal} PLN</span>.
            <br><span style="font-size:0.75rem; color:var(--slate-500); font-weight:400;">(Stawka przyjęta: ok. ${pricePerSqMeter} PLN/m²)</span>
        `;
        resultDiv.classList.remove('hidden');
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
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
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

    // 6. FAQ Accordion Logic (Uproszczona obsługa CSS)
    const faqBtns = document.querySelectorAll('.faq-btn');
    
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const iconInner = btn.querySelector('.faq-icon i');
            
            // Sprawdzamy czy ten przycisk jest już aktywny
            const isActive = btn.classList.contains('active');

            // 1. Zamknij wszystko
            document.querySelectorAll('.faq-content').forEach(el => el.style.maxHeight = null);
            document.querySelectorAll('.faq-btn').forEach(el => {
                el.classList.remove('active');
                const i = el.querySelector('.faq-icon i');
                if(i) {
                    i.classList.remove('fa-minus');
                    i.classList.add('fa-plus');
                }
            });

            // 2. Jeśli nie był aktywny, otwórz go
            if (!isActive) {
                btn.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
                if(iconInner) {
                    iconInner.classList.remove('fa-plus');
                    iconInner.classList.add('fa-minus');
                }
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