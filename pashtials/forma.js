// ========================================
// CONTACT-FORM.JS
// Validacija kontakt forme sa prikazom grešaka i success poruka
// Telefon: intl-tel-input biblioteka (zastave + prefiks po državi)
// ========================================

// Regex patterns
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // ========== INICIJALIZACIJA intl-tel-input ==========
    const phoneInput = document.getElementById('phone');

    const iti = window.intlTelInput(phoneInput, {
        // Automatski detektuj državu korisnika na osnovu IP adrese
        initialCountry: 'auto',
        geoIpLookup: function(callback) {
            fetch('https://ip2c.org/s')
                .then(res => res.text())
                .then(data => {
                    const result = (data || '').split(';');
                    if (result[0] === '1') {
                        callback(result[1]);
                    } else {
                        callback('rs');
                    }
                })
                .catch(() => callback('rs')); // Fallback: Srbija
        },
        // Učitaj utils (potrebno za validaciju po državi)
        loadUtilsOnInit: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/js/utils.js',
        // Placeholder koji odgovara formatu izabrane države
        autoPlaceholder: 'aggressive',
        // Preferred countries na vrhu liste
        preferredCountries: ['rs', 'ba', 'hr', 'me', 'si', 'de', 'at', 'ch'],
        // Korisnik kuca pun broj sa + prefiksom (npr. +381641234567)
        nationalMode: false,
    });

    // ========== POMOCNE FUNKCIJE ==========

    function showError(input, message) {
        $(input).removeClass('success').addClass('error');
        const errorDiv = input.closest('.mb-3, .mb-4').querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }

    function showSuccess(input) {
        $(input).removeClass('error').addClass('success');
        const errorDiv = input.closest('.mb-3, .mb-4').querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
        }
    }

    function clearState(input) {
        $(input).removeClass('error success');
        const errorDiv = input.closest('.mb-3, .mb-4').querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
        }
    }

    // ========== VALIDACIONE FUNKCIJE ==========

    function validateName(input) {
        const val = input.value.trim();
        if (val === '') {
            showError(input, 'Ime i prezime je obavezno polje');
            return false;
        } else if (val.length < 3) {
            showError(input, 'Ime mora imati najmanje 3 karaktera');
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    function validateEmail(input) {
        const val = input.value.trim();
        if (val === '') {
            showError(input, 'Email je obavezno polje');
            return false;
        } else if (!emailRegex.test(val)) {
            showError(input, 'Unesite validnu email adresu (npr. primer@domen.com)');
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    // iti.isValidNumber() proverava broj prema pravilima izabrane države
    // iti.getValidationError() vraća kod greške (TOO_SHORT, TOO_LONG, itd.)
    function validatePhone() {
        const val = phoneInput.value.trim();

        if (val === '') {
            clearState(phoneInput);
            return true;
        }

        if (iti.isValidNumber()) {
            showSuccess(phoneInput);
            return true;
        } else {
            const errorCode = iti.getValidationError();
            const country   = iti.getSelectedCountryData();
            const name      = country.name || 'izabrane države';
            const dial      = country.dialCode ? `+${country.dialCode}` : '';

            // ValidationError kodovi iz intl-tel-input
            const msgs = {
                1:  `Nevažeći pozivni broj`,
                2:  `Broj za ${name} (${dial}) je prekratak`,
                3:  `Broj za ${name} (${dial}) je predugačak`,
                4:  `Unesena vrednost nije broj telefona`,
            };

            showError(phoneInput, msgs[errorCode] ?? `Unesite validan broj za ${name} (${dial})`);
            return false;
        }
    }

    function validateTerms(input) {
        if (!input.checked) {
            showError(input, 'Morate prihvatiti uslove korišćenja');
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    function validateMessage(input) {
        const val = input.value.trim();
        if (val === '') {
            showError(input, 'Poruka je obavezno polje');
            return false;
        } else if (val.length < 10) {
            showError(input, 'Poruka mora imati najmanje 10 karaktera');
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    // ========== REAL-TIME VALIDACIJA SA BLOKIRANJEM ==========

    const nameInput    = document.getElementById('name');
    const emailInput   = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const termsInput   = document.getElementById('terms');

    // Onemogući sva polja osim prvog na startu
    function lockFieldsAfter(unlockedInput) {
        const order = [nameInput, emailInput, phoneInput, messageInput, termsInput];
        const idx = order.indexOf(unlockedInput);
        order.forEach((field, i) => {
            if (i > idx) {
                field.disabled = true;
                field.closest('.mb-3, .mb-4').style.opacity = '0.5';
            } else {
                field.disabled = false;
                field.closest('.mb-3, .mb-4').style.opacity = '1';
            }
        });
    }

    // Na startu zaključaj sva polja osim imena
    lockFieldsAfter(nameInput);

    // --- IME ---
    nameInput.addEventListener('input', () => validateName(nameInput));
    nameInput.addEventListener('blur', () => {
        if (validateName(nameInput)) {
            lockFieldsAfter(emailInput); // otključaj email
            emailInput.focus();
        }
    });

    // --- EMAIL ---
    emailInput.addEventListener('input', () => validateEmail(emailInput));
    emailInput.addEventListener('blur', () => {
        if (validateEmail(emailInput)) {
            lockFieldsAfter(phoneInput); // otključaj telefon
        }
    });

    // --- TELEFON ---
    // Telefon je opciono - uvek može da pređe dalje
    phoneInput.addEventListener('input', () => validatePhone());
    phoneInput.addEventListener('blur', () => {
        validatePhone();
        // Telefon je opciono - otključaj poruku bez obzira
        lockFieldsAfter(messageInput);
    });
    phoneInput.addEventListener('countrychange', () => {
        if (phoneInput.value.trim() !== '') validatePhone();
    });

    // --- PORUKA ---
    messageInput.addEventListener('input', () => validateMessage(messageInput));
    messageInput.addEventListener('blur', () => {
        if (validateMessage(messageInput)) {
            lockFieldsAfter(termsInput); // otključaj checkbox
        }
    });

    // --- USLOVI KORISCENJA ---
    // change event jer je checkbox (ne input/blur)
    termsInput.addEventListener('change', () => validateTerms(termsInput));

    // ========== SUBMIT ==========
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        $('.success-message').remove();

        const isValid =
            validateName(nameInput) &
            validateEmail(emailInput) &
            validatePhone() &
            validateMessage(messageInput) &
            validateTerms(termsInput);

        if (!isValid) {
            const firstError = form.querySelector('.forma-input.error');
            if (firstError) firstError.focus();
            return;
        }

        // iti.getNumber() vraća kompletan broj u E.164 formatu (npr. +38163123456)
        submitForm(
            nameInput.value.trim(),
            emailInput.value.trim(),
            iti.getNumber(),
            messageInput.value.trim()
        );
    });

    // ========== SLANJE FORME ==========
    function submitForm(name, email, phone, message) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Šalje se...';

        setTimeout(() => {
            const $success = $(`
                <div class="success-message">
                    <strong>✓ Uspešno poslato!</strong><br>
                    Hvala ${name}, vaša poruka je primljena. Kontaktiraćemo vas uskoro na ${email}.
                </div>
            `);

            $(form).parent().append($success);
            $success.hide().fadeIn(300);

            console.log('=== PODACI FORME ===');
            console.log('Ime:', name);
            console.log('Email:', email);
            console.log('Telefon:', phone || 'Nije unet');
            console.log('Poruka:', message);
            console.log('====================');

            form.reset();
            iti.setCountry('rs');
            clearState(termsInput); // Resetuj checkbox stanje
            $('.forma-input').removeClass('error success');
            $('.error-message').removeClass('show').text('');

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            setTimeout(() => {
                $success.fadeOut(300, function() { $(this).remove(); });
            }, 7000);

        }, 1500);
    }
}