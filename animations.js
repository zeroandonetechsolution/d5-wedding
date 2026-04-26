
/**
 * Python-Driven Super Graphics Engine for D5 Weddings
 * Brings graphical animations to EVERY INCH of the website.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INJECT SUPER CANVAS FOR PARTICLES & SPARKS
    const canvas = document.createElement('canvas');
    canvas.id = 'py-super-canvas';
    Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: '0'
    });
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    let w, h;
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    // Bokeh Orbs & Sparks Arrays
    const orbs = [];
    const sparks = [];
    
    // Create initial Bokeh Orbs
    for(let i=0; i<70; i++) {
        orbs.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 4 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.2,
            baseAlpha: Math.random() * 0.5 + 0.1,
            angle: Math.random() * Math.PI * 2,
            pulse: Math.random() * 0.05
        });
    }

    function createSparks(x, y, count=3) {
        for(let i=0; i<count; i++) {
            sparks.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                r: Math.random() * 3 + 1,
                decay: Math.random() * 0.02 + 0.015
            });
        }
    }

    // Interactive Mouse Effects
    window.addEventListener('mousemove', e => {
        // Emit sparks on mouse move occasionally
        if (Math.random() > 0.7) createSparks(e.clientX, e.clientY, 1);
        
        // Repel orbs slightly
        orbs.forEach(o => {
            const dx = e.clientX - o.x;
            const dy = e.clientY - o.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 120) {
                o.x -= (dx/dist) * 2;
                o.y -= (dy/dist) * 2;
            }
        });
    });

    window.addEventListener('click', e => {
        // Explosion of sparks on click
        createSparks(e.clientX, e.clientY, 25);
    });

    function drawCanvas() {
        ctx.clearRect(0, 0, w, h);

        // Draw Orbs
        orbs.forEach(o => {
            o.x += o.vx; 
            o.y += o.vy;
            o.angle += o.pulse;
            o.alpha = o.baseAlpha + Math.sin(o.angle) * 0.2;
            
            if(o.x < -10) o.x = w+10; if(o.x > w+10) o.x = -10;
            if(o.y < -10) o.y = h+10; if(o.y > h+10) o.y = -10;

            ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0, o.alpha)})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, Math.PI*2);
            ctx.fill();
        });

        // Draw Sparks
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fff';
        for(let i=sparks.length-1; i>=0; i--) {
            let s = sparks[i];
            s.x += s.vx; s.y += s.vy;
            s.vy += 0.05; // gravity
            s.life -= s.decay;
            
            if(s.life <= 0) { sparks.splice(i, 1); continue; }
            
            ctx.fillStyle = `rgba(255, 240, 180, ${s.life})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        requestAnimationFrame(drawCanvas);
    }
    drawCanvas();

    // 2. 3D PARALLAX TILT ON ALL CARDS & IMAGES
    const tiltElements = document.querySelectorAll('.card, .gallery-item, .booking-info');
    tiltElements.forEach(el => {
        el.style.transformStyle = 'preserve-3d';
        
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPct = (x / rect.width - 0.5) * 2;
            const yPct = (y / rect.height - 0.5) * 2;
            
            // Apply 3D rotation
            el.style.transform = `perspective(1000px) rotateX(${-yPct * 15}deg) rotateY(${xPct * 15}deg) scale3d(1.03, 1.03, 1.03)`;
            el.style.transition = 'transform 0.1s ease-out';
            el.style.zIndex = '10';
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            el.style.zIndex = '1';
        });
    });

    // 3. MAGNETIC PULL ON BUTTONS
    const magButtons = document.querySelectorAll('.btn-primary, .btn-outline, .social-links a');
    magButtons.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width/2) * 0.4;
            const y = (e.clientY - rect.top - rect.height/2) * 0.4;
            btn.style.transform = `translate(${x}px, ${y}px)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
            btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        });
    });

    // 4. FLOATING ANIMATION ON TEXT AND ICONS
    const floatingElements = document.querySelectorAll('.reveal-text, .features i, .detail-item i');
    floatingElements.forEach((el, i) => {
        el.style.animation = `floatElement ${2 + (i%3)}s ease-in-out infinite alternate`;
        el.style.display = 'inline-block';
    });

    // 5. INJECT SUPER CSS ANIMATIONS
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes floatElement {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-8px); }
        }
        
        /* Shimmering Button Effect */
        .btn-primary, .btn-outline {
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        .btn-primary::before, .btn-outline::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 50%; height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
            transform: skewX(-20deg);
            animation: shimmer 3s infinite;
            z-index: -1;
        }
        @keyframes shimmer {
            0% { left: -100%; }
            20% { left: 200%; }
            100% { left: 200%; }
        }

        /* Pulsing Glow on Images */
        .gallery-item {
            box-shadow: 0 0 0 rgba(212, 175, 55, 0);
            animation: pulseGlow 4s infinite alternate;
        }
        @keyframes pulseGlow {
            0% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.1); }
            100% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.3); }
        }

        /* Smooth continuous gradient background animation - applied only to specific elements to avoid hiding the hero picture */
        .packages {
            background: linear-gradient(-45deg, rgba(5,5,5,0.8), rgba(17,17,17,0.9), rgba(10,10,10,0.85), rgba(0,0,0,0.9));
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
        }
        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Glowing Titles */
        h1 span, .subtitle {
            animation: textGlow 2s ease-in-out infinite alternate;
        }
        @keyframes textGlow {
            0% { text-shadow: 0 0 10px rgba(212, 175, 55, 0.2); }
            100% { text-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
        }
    `;
    document.head.appendChild(style);
    
    console.log("Super Animations injected successfully!");
});
