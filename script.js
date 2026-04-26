document.addEventListener('DOMContentLoaded', () => {

    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 50);
        });

        const hoverElements = document.querySelectorAll('a, button, .gallery-item, input, select, label');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const icon = menuToggle.querySelector('i');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if(navLinks.classList.contains('active')) {
            icon.classList.remove('ri-menu-line');
            icon.classList.add('ri-close-line');
        } else {
            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-line');
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-line');
        });
    });

    // --- Animations on Scroll ---
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Initial hero animation
    setTimeout(() => {
        fadeElements.forEach((el, index) => {
            if(el.closest('.hero')) {
                el.classList.add('appear');
            }
        });
    }, 100);

    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        if(!el.closest('.hero')) {
            observer.observe(el);
        }
    });

    // --- Parallax Effect for Gallery ---
    if (window.innerWidth > 992) {
        window.addEventListener('scroll', () => {
            const galleryItems = document.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                const speed = item.getAttribute('data-speed');
                // Calculate position based on scroll and element's offset to keep it reasonable
                const rect = item.getBoundingClientRect();
                // Only parallax if element is roughly in view
                if(rect.top < window.innerHeight && rect.bottom > 0) {
                     const yPos = (window.innerHeight - rect.top) * speed * 0.05;
                     // We use a gentle approach for performance
                     item.style.transform = `translateY(${-yPos}px)`;
                }
            });
        });
    }

    // --- Booking & Payment Logic ---
    const packagePrices = {
        'Essential': 45000,
        'Signature': 85000,
        'Grandeur': 150000,
        'Custom': 0
    };

    const selectButtons = document.querySelectorAll('.select-package');
    const packageSelect = document.getElementById('packageSelect');
    const bookingSection = document.getElementById('booking');

    // Pre-select package from pricing table
    selectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pkg = e.target.getAttribute('data-package');
            packageSelect.value = pkg;
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Form Navigation
    const nextBtn = document.querySelector('.next-step');
    const prevBtn = document.querySelector('.prev-step');
    const step1 = document.querySelector('.step-1');
    const step2 = document.querySelector('.step-2');
    const step3 = document.querySelector('.step-3');

    // Summary Elements
    const summaryPackage = document.getElementById('summaryPackage');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryAdvance = document.getElementById('summaryAdvance');
    const btnAmount = document.getElementById('btnAmount');

    // Data formatter
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    nextBtn.addEventListener('click', () => {
        // Basic validation
        const inputs = step1.querySelectorAll('input[required], select[required]');
        let valid = true;
        inputs.forEach(input => {
            if (!input.value) {
                valid = false;
                input.style.borderColor = 'var(--error)';
            } else {
                input.style.borderColor = 'var(--surface-border)';
            }
        });

        if (!valid) return;

        // Update Summary
        const selectedPkg = packageSelect.value;
        const price = packagePrices[selectedPkg] || 0;
        const advance = price * 0.25;

        summaryPackage.textContent = selectedPkg;
        summaryTotal.textContent = price === 0 ? 'TBD' : formatCurrency(price);
        summaryAdvance.textContent = price === 0 ? '₹10,000 (Booking Base)' : formatCurrency(advance);
        btnAmount.textContent = price === 0 ? '10,000' : new Intl.NumberFormat('en-IN', {maximumFractionDigits: 0}).format(advance);

        // Switch to Step 2
        step1.classList.remove('active');
        step2.classList.add('active');
    });

    prevBtn.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
    });

    // Payment Method Toggle
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cardDetails = document.querySelector('.card-details');

    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
            
            const type = method.querySelector('input').value;
            if (type === 'upi') {
                cardDetails.classList.add('d-none');
            } else {
                cardDetails.classList.remove('d-none');
            }
        });
    });

    // Form Submission / Mock Payment
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner');

        // Loading state
        btnText.classList.add('d-none');
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;

        const bookingData = {
            names: document.getElementById('names').value,
            date: document.getElementById('date').value,
            location: document.getElementById('location').value,
            package: document.getElementById('packageSelect').value,
            amount: document.getElementById('summaryAdvance').textContent,
            payment_method: document.querySelector('input[name="payment"]:checked').value
        };

        fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        })
        .then(response => response.json())
        .then(data => {
            step2.classList.remove('active');
            step3.classList.add('active');
            step3.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Server error. Please ensure the Python backend is running.');
            submitBtn.disabled = false;
            btnText.classList.remove('d-none');
            spinner.classList.add('d-none');
        });
    });

    // Card Input Formatting (Mock)
    const cardInputs = document.querySelectorAll('.card-input');
    cardInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            // Just basic numeric formatting allowed for mock
            e.target.value = e.target.value.replace(/[^0-9\s/]/g, '');
        });
    });

});
