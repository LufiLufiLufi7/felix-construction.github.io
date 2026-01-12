// ========================================
// CONTACT-FORM.JS
// Validacija kontakt forme sa prikazom grešaka i success poruka
// ========================================

// NAPOMENA: Deo koda za validaciju (regex pattern-i) je preuzet sa interneta i prilagođen projektu

// Export funkcije za inicijalizaciju kontakt forme
export function initContactForm() {
    // Pronađi formu u DOM-u
    const form = document.getElementById('contactForm');
    
    // Ako forma ne postoji na stranici, izađi iz funkcije
    if (!form) return;
    
    // ========== EVENT LISTENER ZA SUBMIT FORME ==========
    form.addEventListener('submit', function(e) {
        // Spreči default ponašanje forme (reload stranice)
        e.preventDefault();
        
        // jQuery - obriši sve prethodne greške i stilove
        $('.forma-input').removeClass('error success');
        $('.error-message').removeClass('show');
        $('.success-message').remove();
        
        // Flag za praćenje validnosti forme
        let isValid = true;
        
        // ========== VALIDACIJA IMENA ==========
        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim(); // Ukloni whitespace sa početka i kraja
        
        // Proveri da li je ime prazno
        if (name === '') {
            showError(nameInput, 'Ime i prezime je obavezno polje');
            isValid = false;
        } 
        // Proveri da li ima minimum 3 karaktera
        else if (name.length < 3) {
            showError(nameInput, 'Ime mora imati najmanje 3 karaktera');
            isValid = false;
        } 
        // Ako je validno, dodaj success klasu (zeleni border)
        else {
            $(nameInput).addClass('success');
        }
        
        // ========== VALIDACIJA EMAIL-A ==========
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        // Regex pattern za proveru email formata (preuzeto sa interneta)
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        // Proveri da li je email prazan
        if (email === '') {
            showError(emailInput, 'Email je obavezno polje');
            isValid = false;
        } 
        // Proveri da li email odgovara regex patternu
        else if (!emailRegex.test(email)) {
            showError(emailInput, 'Unesite validnu email adresu (npr. primer@domen.com)');
            isValid = false;
        } 
        // Ako je validan, dodaj success klasu
        else {
            $(emailInput).addClass('success');
        }
        
        // ========== VALIDACIJA TELEFONA ==========
        const phoneInput = document.getElementById('phone');
        const phone = phoneInput.value.trim();
        // Regex pattern za proveru telefon formata (preuzeto sa interneta)
        // Podržava formate: +381 11 123 4567, 011-123-4567, itd.
        const phoneRegex = /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[0-9]{2,3}[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/;
        
        // Telefon je opcioni field, ali ako je unet mora biti validan
        if (phone !== '' && !phoneRegex.test(phone)) {
            showError(phoneInput, 'Unesite validan broj telefona (npr. +381 11 123 4567)');
            isValid = false;
        } 
        // Ako je unet i validan, dodaj success klasu
        else if (phone !== '') {
            $(phoneInput).addClass('success');
        }
        
        // ========== VALIDACIJA PORUKE ==========
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();
        
        // Proveri da li je poruka prazna
        if (message === '') {
            showError(messageInput, 'Poruka je obavezno polje');
            isValid = false;
        } 
        // Proveri da li ima minimum 10 karaktera
        else if (message.length < 10) {
            showError(messageInput, 'Poruka mora imati najmanje 10 karaktera');
            isValid = false;
        } 
        // Ako je validna, dodaj success klasu
        else {
            $(messageInput).addClass('success');
        }
        
        // ========== SLANJE FORME AKO JE SVE VALIDNO ==========
        if (isValid) {
            submitForm(name, email, phone, message);
        }
    });
    
    // ========== FUNKCIJA ZA PRIKAZ GREŠKE ==========
    function showError(input, message) {
        // Dodaj error klasu input-u (crveni border)
        input.classList.add('error');
        
        // Pronađi error-message div unutar parent elementa
        const errorDiv = input.parentElement.querySelector('.error-message');
        
        // Postavi tekst greške
        errorDiv.textContent = message;
        
        // Prikaži error message sa animacijom (CSS klasa)
        errorDiv.classList.add('show');
    }
    
    // ========== FUNKCIJA ZA SLANJE FORME ==========
    function submitForm(name, email, phone, message) {
        // Pronađi submit dugme
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Onemogući dugme tokom "slanja"
        submitBtn.disabled = true;
        submitBtn.textContent = 'Šalje se...';
        
        // Simulacija slanja forme (u realnom projektu bi ovde išao AJAX/fetch poziv)
        setTimeout(() => {
            // jQuery - dinamički kreiraj success poruku
            const $success = $(`
                <div class="success-message">
                    <strong>✓ Uspešno poslato!</strong><br>
                    Hvala ${name}, vaša poruka je primljena. Kontaktiraćemo vas uskoro na ${email}.
                </div>
            `);
            
            // Dodaj poruku u DOM ispod forme
            $(form).parent().append($success);
            
            // Prikaži sa fade-in animacijom (jQuery efekat)
            $success.hide().fadeIn(300);
            
            // Console log za testiranje/debugging
            console.log('=== PODACI FORME ===');
            console.log('Ime:', name);
            console.log('Email:', email);
            console.log('Telefon:', phone || 'Nije unet');
            console.log('Poruka:', message);
            console.log('====================');
            
            // Resetuj formu
            form.reset();
            
            // Vrati dugme u normalno stanje
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Automatski ukloni success poruku nakon 7 sekundi
            setTimeout(() => {
                // Fade-out animacija pre uklanjanja
                $success.fadeOut(300, function() {
                    $(this).remove();
                });
            }, 7000);
            
        }, 1500); // 1.5 sekundi delay za simulaciju slanja
    }
}