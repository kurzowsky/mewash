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

    // 0. Dynamic Promo Bar & Navbar Adjustment
    const promoBar = document.getElementById('promo-bar');
    const navbar = document.getElementById('navbar');

    function adjustNavbarPosition() {
        if (promoBar && navbar) {
            const height = promoBar.offsetHeight;
            navbar.style.top = `${height}px`;
            // Add padding to body to prevent content from being hidden under fixed nav
            // document.body.style.paddingTop = `${height + navbar.offsetHeight}px`; 
            // Commented out body padding adjustment because hero likely handles it, 
            // but we want to ensure nav doesn't overlap text if hero has text at top.
            // For now just moving nav is enough as hero is usually large.
        }
    }

    if (promoBar) {
        window.addEventListener('resize', adjustNavbarPosition);
        // Call initially and after a slight delay for font loading
        adjustNavbarPosition();
        setTimeout(adjustNavbarPosition, 100);
    }

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

    // 4. Formularz Wyceny
    const form = document.getElementById('estimation-form');
    const serviceTypeSelect = document.getElementById('serviceType');
    const acreageInput = document.getElementById('acreageInput');
    const resultDiv = document.getElementById('estimationResult');

    // --- KONFIGURACJA KODU RABATOWEGO ---
    const DISCOUNT_CONFIG = {
        prefix: 'MEWASH',
        validityMs: 60 * 6 * 10000, // 1 godzina w milisekundach
        storageKey: 'mewash_discount_data'
    };

    // Generowanie losowego kodu rabatowego
    function generateDiscountCode() {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 losowe cyfry
        return `${DISCOUNT_CONFIG.prefix}${randomNum}`;
    }

    // Pobieranie IP użytkownika
    async function getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.log('Nie udało się pobrać IP:', error);
            return 'nieznane';
        }
    }

    // Sprawdzanie czy kod był już pokazany
    function wasDiscountShown() {
        const data = localStorage.getItem(DISCOUNT_CONFIG.storageKey);
        if (!data) return false;

        try {
            const parsed = JSON.parse(data);
            return parsed.shown === true;
        } catch {
            return false;
        }
    }

    // Zapisywanie że kod został pokazany
    function markDiscountAsShown(ip, code, expiryTime) {
        const data = {
            shown: true,
            ip: ip,
            code: code,
            expiryTime: expiryTime,
            timestamp: Date.now()
        };
        localStorage.setItem(DISCOUNT_CONFIG.storageKey, JSON.stringify(data));
    }

    // Formatowanie czasu pozostałego
    function formatTimeRemaining(ms) {
        if (ms <= 0) return '00:00:00';
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Uruchomienie timera
    let discountTimerInterval = null;
    function startDiscountTimer(expiryTime) {
        const modalTimerElement = document.getElementById('modal-timer');
        const stickyTimerElement = document.getElementById('sticky-timer');
        const stickyBar = document.getElementById('sticky-discount-bar');

        if (discountTimerInterval) clearInterval(discountTimerInterval);

        function updateTimers() {
            const remaining = expiryTime - Date.now();
            if (remaining <= 0) {
                clearInterval(discountTimerInterval);
                if (stickyBar) stickyBar.classList.add('hidden');
                document.getElementById('discount-modal').classList.add('hidden'); // Zamknij modal jeśli czas minął
                if (modalTimerElement) modalTimerElement.textContent = '00:00:00';
                if (stickyTimerElement) stickyTimerElement.textContent = '00:00';
            } else {
                const formatted = formatTimeRemaining(remaining);
                if (modalTimerElement) modalTimerElement.textContent = formatted.substring(3); // Bez godzin jeśli < 1h, ale formatTimeRemaining zwraca HH:MM:SS
                if (stickyTimerElement) stickyTimerElement.textContent = formatted.substring(3, 8); // MM:SS
            }
        }

        discountTimerInterval = setInterval(updateTimers, 1000);
        updateTimers(); // Natychmiastowa aktualizacja
    }

    // Wyświetlanie kodu rabatowego - MODAL
    function showDiscountCode(code, expiryTime) {
        const modal = document.getElementById('discount-modal');
        const modalCode = document.getElementById('modal-code');
        const stickyCode = document.getElementById('sticky-code');
        const stickyBar = document.getElementById('sticky-discount-bar');

        // Ustaw kod
        if (modalCode) modalCode.textContent = code;
        if (stickyCode) stickyCode.textContent = code;

        // Pokaż modal
        if (modal) {
            modal.classList.remove('hidden');
        }

        // Obsługa zamykania modala
        const closeModal = () => {
            if (modal) modal.classList.add('hidden');
            // Pokaż sticky bar po zamknięciu modala
            if (stickyBar) stickyBar.classList.remove('hidden');
        };

        document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
        document.getElementById('claim-discount-btn')?.addEventListener('click', closeModal);
        document.getElementById('modal-overlay')?.addEventListener('click', closeModal);

        // Kopiowanie kodu
        document.getElementById('copy-discount-btn')?.addEventListener('click', () => {
            const codeText = document.getElementById('modal-code').innerText;
            navigator.clipboard.writeText(codeText).then(() => {
                alert('Skopiowano kod do schowka: ' + codeText);
            }).catch(err => {
                console.error('Błąd kopiowania:', err);
            });
        });

        startDiscountTimer(expiryTime);
    }

    // Wysyłanie powiadomienia o kodzie rabatowym na Discord
    function wyslijKodRabatowyDoDiscorda(ip, kod, usluga, metraz, koszt) {
        const discordURL = "https://discord.com/api/webhooks/1461300903226376222/7oJs6rxLL3u-Lhhlio304Hayx6IwaLDEZ4MXSlFBv5ABZjYGDyJ73xobCpPx1plGpSQe";

        const wiadomosc = {
            content: null,
            embeds: [
                {
                    title: "🎁 Nowy kod rabatowy wygenerowany!",
                    color: 16750848, // Pomarańczowy kolor
                    fields: [
                        {
                            name: "🎟️ Kod rabatowy",
                            value: `**\`${kod}\`**`,
                            inline: true
                        },
                        {
                            name: "🌐 IP użytkownika",
                            value: ip,
                            inline: true
                        },
                        {
                            name: "⏰ Ważny do",
                            value: new Date(Date.now() + DISCOUNT_CONFIG.validityMs).toLocaleString(),
                            inline: false
                        },
                        {
                            name: "🛠 Usługa",
                            value: usluga,
                            inline: true
                        },
                        {
                            name: "📏 Metraż",
                            value: `${metraz} m²`,
                            inline: true
                        },
                        {
                            name: "💰 Szacowany koszt",
                            value: `**${koszt}**`,
                            inline: false
                        }
                    ],
                    footer: {
                        text: "Kod ważny przez 1 godzinę od wygenerowania"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        fetch(discordURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(wiadomosc),
        })
            .then(response => {
                if (response.ok) console.log('Wysłano kod rabatowy!');
                else console.log('Błąd wysyłania kodu: ' + response.status);
            })
            .catch((error) => console.error('Błąd:', error));
    }

    // Główna funkcja obsługi kodu rabatowego
    async function handleDiscountCode(usluga, metraz, koszt) {
        // Sprawdź czy kod był już pokazany
        if (wasDiscountShown()) {
            console.log('Kod rabatowy był już pokazany temu użytkownikowi');
            return;
        }

        // Pobierz IP użytkownika
        const ip = await getUserIP();

        // Wygeneruj unikalny kod
        const code = generateDiscountCode();
        const expiryTime = Date.now() + DISCOUNT_CONFIG.validityMs;

        // Zapisz w localStorage
        markDiscountAsShown(ip, code, expiryTime);

        // Pokaż kod użytkownikowi
        showDiscountCode(code, expiryTime);

        // Wyślij powiadomienie na Discord
        wyslijKodRabatowyDoDiscorda(ip, code, usluga, metraz, koszt);
    }

    // Przywracanie kodu rabatowego przy ładowaniu strony
    function restoreDiscountCodeOnLoad() {
        const data = localStorage.getItem(DISCOUNT_CONFIG.storageKey);
        if (!data) return;

        try {
            const parsed = JSON.parse(data);

            // Sprawdź czy kod jest jeszcze ważny
            if (parsed.expiryTime && parsed.expiryTime > Date.now()) {
                // Kod jest jeszcze ważny - wyświetl go
                showDiscountCode(parsed.code, parsed.expiryTime);
                console.log('Przywrócono kod rabatowy:', parsed.code);
            } else if (parsed.expiryTime && parsed.expiryTime <= Date.now()) {
                // Kod wygasł - ukryj kontener
                const container = document.getElementById('discountCodeContainer');
                if (container) container.classList.add('hidden');
                console.log('Kod rabatowy wygasł');
            }
        } catch (e) {
            console.log('Błąd przywracania kodu:', e);
        }
    }

    // Wywołaj przy ładowaniu strony
    restoreDiscountCodeOnLoad();

    // --- FUNKCJA WYSYŁAJĄCA DO DISCORDA ---
    function wyslijDoDiscorda(dane) {
        const discordURL = "https://discord.com/api/webhooks/1461137812689518636/dBiQLaOEeoN3dejOVbb-_I7L52mr4h32DgMry3ASOqvtbAzMe77HnzBcBTlu30ULOuCT";

        // Ładnie sformatowana wiadomość
        const wiadomosc = {
            content: null,
            embeds: [
                {
                    title: "🔔 Nowa wycena ze strony!",
                    color: 5814783, // Kolor zielony paska
                    fields: [
                        {
                            name: "🛠 Usługa",
                            value: dane.usluga,
                            inline: true
                        },
                        {
                            name: "📏 Metraż",
                            value: `${dane.metraz} m²`,
                            inline: true
                        },
                        {
                            name: "💰 Szacowany koszt",
                            value: `**${dane.szacowany_koszt}**`
                        },
                        {
                            name: "🌍 Źródło",
                            value: dane.zrodlo || "Strona WWW",
                            inline: true
                        },
                        {
                            name: "📅 Data",
                            value: new Date().toLocaleString(),
                            inline: true
                        }
                    ]
                }
            ]
        };

        fetch(discordURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(wiadomosc),
        })
            .then(response => {
                if (response.ok) console.log('Wysłano wycenę!');
                else console.log('Błąd wysyłania: ' + response.status);
            })
            .catch((error) => console.error('Błąd:', error));
    }

    // --- FORMULARZ KONTAKTOWY ---
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const contactFormStatus = document.getElementById('contactFormStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !phone || !message) {
                showContactStatus('Wypełnij wszystkie pola!', false);
                return;
            }

            // Zmień przycisk na loading
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Wysyłanie...';

            // Wyślij na Discord
            try {
                await wyslijFormularzKontaktowy(name, phone, message);
                showContactStatus('✅ Wiadomość wysłana! Odezwiemy się wkrótce.', true);
                contactForm.reset();
            } catch (error) {
                showContactStatus('❌ Błąd wysyłania. Spróbuj ponownie.', false);
            }

            // Przywróć przycisk
            contactSubmitBtn.disabled = false;
            contactSubmitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Wyślij wiadomość';
        });
    }

    function showContactStatus(message, success) {
        if (contactFormStatus) {
            contactFormStatus.textContent = message;
            contactFormStatus.classList.remove('hidden', 'bg-green-500/20', 'text-green-400', 'bg-red-500/20', 'text-red-400');
            if (success) {
                contactFormStatus.classList.add('bg-green-500/20', 'text-green-400');
            } else {
                contactFormStatus.classList.add('bg-red-500/20', 'text-red-400');
            }
            // Ukryj po 5 sekundach
            setTimeout(() => {
                contactFormStatus.classList.add('hidden');
            }, 5000);
        }
    }

    async function wyslijFormularzKontaktowy(imie, kontakt, wiadomosc) {
        const discordURL = "https://discord.com/api/webhooks/1461324759600992268/Z2sbR_iBtdtB1YHbj57x9B7aLjPn5C1WGZ9cdQyVTmkP9U23z18J6yiniYtgnTrqVmo5";

        const payload = {
            content: null,
            embeds: [
                {
                    title: "📬 Nowa wiadomość ze strony!",
                    color: 3447003, // Niebieski kolor
                    fields: [
                        {
                            name: "👤 Imię",
                            value: imie,
                            inline: true
                        },
                        {
                            name: "📞 Kontakt",
                            value: kontakt,
                            inline: true
                        },
                        {
                            name: "💬 Wiadomość",
                            value: wiadomosc
                        },
                        {
                            name: "📅 Data",
                            value: new Date().toLocaleString('pl-PL'),
                            inline: true
                        }
                    ]
                }
            ]
        };

        const response = await fetch(discordURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Discord error: ' + response.status);
        }

        console.log('Formularz kontaktowy wysłany!');
    }
    // ---------------------------------------

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
        let minpricePerSqMeter = 0;
        let maxpricePerSqMeter = 0;

        // Cennik
        if (serviceKey === 'pakiet_podstawowy') {
            pricePerSqMeter = 15;
        } else if (serviceKey === 'pakiet_standard') {
            pricePerSqMeter = 32;
        } else if (serviceKey === 'pakiet_premium') {
            pricePerSqMeter = 40;
        } else if (serviceKey === 'mycie_kostki') {
            if (acreage <= 100) pricePerSqMeter = 18;
            else if (acreage <= 200) pricePerSqMeter = 15;
            else pricePerSqMeter = 12;
        } else if (serviceKey === 'impregnacja_1') {
            pricePerSqMeter = 15;
        } else if (serviceKey === 'impregnacja_2') {
            pricePerSqMeter = 25;
        } else if (serviceKey === 'plamy') {
            minpricePerSqMeter = 30;
            maxpricePerSqMeter = 100;
        } else if (serviceKey === 'impregnacja_3') {
            pricePerSqMeter = 15;
        } else if (serviceKey === 'mycie_elewacji') {
            pricePerSqMeter = 15;
        }

        const serviceName = serviceTypeSelect.options[serviceTypeSelect.selectedIndex].text;

        // Dane do wysyłki
        let daneDoWyslania = {
            usluga: serviceName,
            metraz: acreage,
            szacowany_koszt: "",
            zrodlo: "mewash.pl"
        };

        let resultHTML = "";

        if (serviceKey === 'plamy') {
            const mintotal = acreage * minpricePerSqMeter;
            const maxtotal = acreage * maxpricePerSqMeter;
            daneDoWyslania.szacowany_koszt = `${mintotal} - ${maxtotal} PLN`;

            resultHTML = `
                💰 Wstępna wycena za <strong>${serviceName}</strong> (${acreage} m²) to: 
                <br><span class="text-primary font-extrabold text-2xl">${mintotal} - ${maxtotal} PLN</span>.
                <br><span class="text-xs text-slate-500 font-normal">(Stawka: ${minpricePerSqMeter}-${maxpricePerSqMeter} PLN/m²)</span>
            `;
        } else {
            const totalCost = acreage * pricePerSqMeter;
            daneDoWyslania.szacowany_koszt = `${totalCost} PLN`;

            resultHTML = `
                💰 Wstępna wycena za <strong>${serviceName}</strong> (${acreage} m²) to: 
                <br><span class="text-primary font-extrabold text-2xl">${totalCost} PLN</span>.
                <br><span class="text-xs text-slate-500 font-normal">(Stawka: ${pricePerSqMeter} PLN/m²)</span>
            `;
        }

        resultDiv.innerHTML = resultHTML;
        resultDiv.classList.remove('hidden', 'bg-red-100', 'border-red-300');
        resultDiv.classList.add('bg-blue-50', 'border-blue-200');

        // Wywołanie wysyłki na Discorda
        wyslijDoDiscorda(daneDoWyslania);

        // Obsługa kodu rabatowego (tylko za pierwszym razem)
        handleDiscountCode(serviceName, acreage, daneDoWyslania.szacowany_koszt);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateEstimation();
        });
    }

    // 4.1 Obsługa przycisków wyboru pakietu
    const packageButtons = document.querySelectorAll('.package-select-btn');
    packageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const packageValue = btn.getAttribute('data-package');
            if (serviceTypeSelect && packageValue) {
                // Usuń zaznaczenie ze wszystkich przycisków
                packageButtons.forEach(b => {
                    b.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'scale-105');
                    const icon = b.querySelector('i');
                    if (icon && icon.classList.contains('fa-check')) {
                        icon.classList.remove('fa-check');
                        // Przywróć oryginalną ikonę
                        if (b.getAttribute('data-package') === 'pakiet_podstawowy') {
                            icon.classList.add('fa-check-circle');
                        } else if (b.getAttribute('data-package') === 'pakiet_standard') {
                            icon.classList.add('fa-star');
                        } else if (b.getAttribute('data-package') === 'pakiet_premium') {
                            icon.classList.add('fa-crown');
                        }
                    }
                    // Przywróć oryginalny tekst
                    b.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'Wybrano pakiet') {
                            node.textContent = '\n                        Wybierz pakiet\n                    ';
                        }
                    });
                });

                // Dodaj zaznaczenie do klikniętego przycisku
                btn.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'scale-105');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-check-circle', 'fa-star', 'fa-crown');
                    icon.classList.add('fa-check');
                }
                // Zmień tekst przycisku
                btn.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'Wybierz pakiet') {
                        node.textContent = '\n                        Wybrano pakiet\n                    ';
                    }
                });

                // Ustaw wybrany pakiet w dropdownie
                serviceTypeSelect.value = packageValue;

                // Przewiń do kalkulatora
                const calculator = document.getElementById('kalkulator');
                if (calculator) {
                    calculator.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });

    // 4.2 Synchronizacja przycisków pakietów z dropdownem
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener('change', () => {
            const selectedValue = serviceTypeSelect.value;

            // Najpierw odznacz wszystkie przyciski
            packageButtons.forEach(b => {
                b.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'scale-105');
                const icon = b.querySelector('i');
                if (icon && icon.classList.contains('fa-check')) {
                    icon.classList.remove('fa-check');
                    // Przywróć oryginalną ikonę
                    if (b.getAttribute('data-package') === 'pakiet_podstawowy') {
                        icon.classList.add('fa-check-circle');
                    } else if (b.getAttribute('data-package') === 'pakiet_standard') {
                        icon.classList.add('fa-star');
                    } else if (b.getAttribute('data-package') === 'pakiet_premium') {
                        icon.classList.add('fa-crown');
                    }
                }
                // Przywróć oryginalny tekst
                b.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'Wybrano pakiet') {
                        node.textContent = '\n                        Wybierz pakiet\n                    ';
                    }
                });
            });

            // Jeśli wybrano pakiet, zaznacz odpowiedni przycisk
            if (selectedValue.startsWith('pakiet_')) {
                const targetBtn = document.querySelector(`.package-select-btn[data-package="${selectedValue}"]`);
                if (targetBtn) {
                    targetBtn.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'scale-105');
                    const icon = targetBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-check-circle', 'fa-star', 'fa-crown');
                        icon.classList.add('fa-check');
                    }
                    // Zmień tekst przycisku
                    targetBtn.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'Wybierz pakiet') {
                            node.textContent = '\n                        Wybrano pakiet\n                    ';
                        }
                    });
                }
            }
        });
    }

    // 5. Animacja Liczników
    const statsSection = document.getElementById('stats-section');
    const counters = document.querySelectorAll('.counter');
    let started = false;

    function handleScroll() {
        reveal();

        if (statsSection) {
            const sectionPos = statsSection.getBoundingClientRect().top;
            const screenPos = window.innerHeight / 1.2;

            if (sectionPos < screenPos && !started) {
                counters.forEach(counter => {
                    let current = 0;
                    const target = +counter.getAttribute('data-target');
                    const updateCount = () => {
                        if (current < target) {
                            current += Math.ceil(target / 50);
                            if (current > target) current = target;
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
    if (scrollToTopBtn) {
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

    // 6. Scroll do pakietu Standard na mobile
    const pakietyContainer = document.getElementById('pakiety-container');
    const standardCard = document.getElementById('pakiet-standard-card');

    function scrollToStandardPackage() {
        if (pakietyContainer && standardCard && window.innerWidth < 1024) {
            // Sprawdź czy kontener jest przewijalny
            if (pakietyContainer.scrollWidth > pakietyContainer.clientWidth) {
                // Oblicz pozycję do wycentrowania karty standard wewnątrz kontenera
                const cardLeft = standardCard.offsetLeft;
                const cardWidth = standardCard.offsetWidth;
                const containerWidth = pakietyContainer.clientWidth;

                const scrollPos = cardLeft - (containerWidth / 2) + (cardWidth / 2);

                pakietyContainer.scrollTo({
                    left: scrollPos,
                    behavior: 'smooth'
                });
            }
        }
    }

    // Wywołaj po załadowaniu z lekkim opóźnieniem, aby upewnić się że layout jest gotowy
    setTimeout(scrollToStandardPackage, 500);

    // Wywołaj przy zmianie orientacji/rozmiaru
    window.addEventListener('resize', () => {
        setTimeout(scrollToStandardPackage, 100);
    });

    reveal();
});

// --- GOOGLE MAPS - Mapa zasięgu z kołem 50km ---
function initCoverageMap() {
    const mapElement = document.getElementById('coverage-map');
    if (!mapElement) return;

    // Współrzędne Turku
    const turekLocation = { lat: 52.0157, lng: 18.5014 };

    // Inicjalizacja mapy
    const map = new google.maps.Map(mapElement, {
        center: turekLocation,
        zoom: 9,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
    });

    // Koło 50km - strefa darmowego dojazdu
    const freeDeliveryZone = new google.maps.Circle({
        strokeColor: "#22c55e",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: "#22c55e",
        fillOpacity: 0.15,
        map: map,
        center: turekLocation,
        radius: 50000 // 50km w metrach
    });

    // Marker Turku
    const marker = new google.maps.Marker({
        position: turekLocation,
        map: map,
        title: "MeWash - Turek",
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#0ea5e9",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3
        }
    });

    // InfoWindow dla markera
    const infoWindow = new google.maps.InfoWindow({
        headerContent: document.createRange().createContextualFragment(`
            <img src="mewashicon.png" alt="MeWash" style="height: 32px; width: auto;">
        `).firstElementChild,
        content: `
            <div style="padding: 8px; font-family: Inter, sans-serif; min-width: 130px;">
                <div style="color: #64748b; font-size: 13px; margin-bottom: 4px;">Turek - nasza baza</div>
                <div style="color: #22c55e; font-weight: bold; font-size: 13px;">✓ Darmowy dojazd!</div>
            </div>
        `
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}

// Wywołanie po załadowaniu Google Maps API
window.initCoverageMap = initCoverageMap;