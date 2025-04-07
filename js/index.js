/***************************************************************************
  improved-home.js (example for your Home page or similar page)
  - Preserves scroll ratio on language toggle
  - Toggles .german / .english sections
  - Manages nav toggles & sliders
***************************************************************************/

document.addEventListener('DOMContentLoaded', () => {
    // ======================================================================
    // 1) MOBILE MENU TOGGLE
    // ======================================================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Optional: Toggle animation for hamburger icon
        const spans = menuToggle.querySelectorAll('span');
        spans.forEach(span => {
          span.classList.toggle('active');
        });
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans.forEach(span => {
              span.classList.remove('active');
            });
          }
        }
      });
    }
    
    // ======================================================================
    // 2) FADE-IN OBSERVER
    // ======================================================================
    const fadeElems = document.querySelectorAll('.fade-in');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: 0.2});
    fadeElems.forEach(el => io.observe(el));
  
      // 2) TABBED SERVICES
  const tabButtons = document.querySelectorAll('.svc-tab-btn');
  const panels = document.querySelectorAll('.services-panel');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Clear active states
      tabButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Set this button active
      btn.classList.add('active');
      // Show the panel
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if(targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
  
  // 2b) TABBED SERVICES (English)
  const tabButtonsEn = document.querySelectorAll('#servicesEn .svc-tab-btn');
  const panelsEn = document.querySelectorAll('#servicesEn .services-panel');
  
  if (tabButtonsEn.length > 0) {
    // Ensure first panel is active initially
    if (panelsEn.length > 0) {
      panelsEn[0].classList.add('active');
    }
    
    tabButtonsEn.forEach(btn => {
      btn.addEventListener('click', () => {
        // Clear active states
        tabButtonsEn.forEach(b => b.classList.remove('active'));
        panelsEn.forEach(p => p.classList.remove('active'));

        // Set this button active
        btn.classList.add('active');
        // Show the panel
        const targetId = btn.getAttribute('data-tab');
        const targetPanel = document.getElementById(targetId);
        if(targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }
  // 2) TESTIMONIALS SLIDER (German)
  const slidesDe = document.querySelectorAll('#testimonialSliderDe .testimonial-slide');
  const arrowLeftDe = document.getElementById('arrowLeftDe');
  const arrowRightDe = document.getElementById('arrowRightDe');
  const dotsDe = document.querySelectorAll('#dotsDe .dot');
  let currentSlideDe = 0;

  function showSlideDe(index) {
    slidesDe.forEach(s => s.classList.remove('active'));
    dotsDe.forEach(d => d.classList.remove('active'));
    slidesDe[index].classList.add('active');
    dotsDe[index].classList.add('active');
  }
  showSlideDe(currentSlideDe);

  arrowLeftDe.addEventListener('click', () => {
    currentSlideDe = (currentSlideDe - 1 + slidesDe.length) % slidesDe.length;
    showSlideDe(currentSlideDe);
  });
  arrowRightDe.addEventListener('click', () => {
    currentSlideDe = (currentSlideDe + 1) % slidesDe.length;
    showSlideDe(currentSlideDe);
  });
  dotsDe.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentSlideDe = idx;
      showSlideDe(idx);
    });
  });
  
  // 2b) TESTIMONIALS SLIDER (English)
  const slidesEn = document.querySelectorAll('#testimonialSliderEn .testimonial-slide');
  const arrowLeftEn = document.getElementById('arrowLeftEn');
  const arrowRightEn = document.getElementById('arrowRightEn');
  const dotsEn = document.querySelectorAll('#dotsEn .dot');
  let currentSlideEn = 0;

  function showSlideEn(index) {
    slidesEn.forEach(s => s.classList.remove('active'));
    dotsEn.forEach(d => d.classList.remove('active'));
    slidesEn[index].classList.add('active');
    dotsEn[index].classList.add('active');
  }
  
  if (slidesEn.length > 0) {
    showSlideEn(currentSlideEn);

    arrowLeftEn.addEventListener('click', () => {
      currentSlideEn = (currentSlideEn - 1 + slidesEn.length) % slidesEn.length;
      showSlideEn(currentSlideEn);
    });
    arrowRightEn.addEventListener('click', () => {
      currentSlideEn = (currentSlideEn + 1) % slidesEn.length;
      showSlideEn(currentSlideEn);
    });
    dotsEn.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        currentSlideEn = idx;
        showSlideEn(idx);
      });
    });
  }
  // ===========================
  // 2) TIMELINE PROGRESS BAR
  // ===========================
  const progressIndicator = document.getElementById('progressIndicator');
  const progressBar = document.querySelector('.progress-indicator .progress-bar');
  
  // If you want to show the sticky bar, remove "display: none" from CSS:
  // progressIndicator.style.display = 'block'; // optionally

  const timeline = document.querySelector('.timeline-steps');
  if(progressIndicator && timeline) {
    window.addEventListener('scroll', () => {
      const rect = timeline.getBoundingClientRect();
      const start = rect.top + window.pageYOffset;
      const end = rect.bottom + window.pageYOffset - window.innerHeight;
      const scrollY = window.pageYOffset;

      if(scrollY < start) {
        // Before timeline
        progressBar.style.height = `0%`;
      } else if(scrollY > end) {
        // Past the end of timeline
        progressBar.style.height = `100%`;
      } else {
        // In the timeline range
        const ratio = ((scrollY - start) / (end - start)) * 100;
        progressBar.style.height = `${ratio}%`;
      }
    });
  }
    // ======================================================================
    // 6) LANGUAGE TOGGLE WITH SCROLL PRESERVATION
    // ======================================================================
    const params = new URLSearchParams(window.location.search);
    let currentLang = params.get('lang') || 'de'; // default to German
  
    // If there's a scrollRatio param, restore it
    if (params.has('scrollRatio')) {
      const ratio = parseFloat(params.get('scrollRatio'));
      setTimeout(() => {
        const docHeight = Math.max(document.body.scrollHeight, 1);
        const scrollY = Math.round(ratio * docHeight);
        window.scrollTo(0, scrollY);
      }, 50);
    }
  
    // Show/hide .german / .english
    const germanDivs = document.querySelectorAll('.german');
    const englishDivs = document.querySelectorAll('.english');
    let isGerman = (currentLang !== 'en');
  
    if (isGerman) {
      germanDivs.forEach(el => el.classList.remove('hidden'));
      englishDivs.forEach(el => el.classList.add('hidden'));
    } else {
      germanDivs.forEach(el => el.classList.add('hidden'));
      englishDivs.forEach(el => el.classList.remove('hidden'));
    }
  
    // Grab the toggle button
    const langBtn = document.getElementById('toggleLang');
    if (langBtn) {
      // Initial text
      langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  
      langBtn.addEventListener('click', () => {
        // 1) store current scroll ratio
        const currentScrollY = window.pageYOffset;
        const docHeight = Math.max(document.body.scrollHeight, 1);
        const scrollRatio = currentScrollY / docHeight;
  
        // 2) flip language
        isGerman = !isGerman;
        const newLang = isGerman ? 'de' : 'en';
  
        // 3) update params
        params.set('lang', newLang);
        params.set('scrollRatio', scrollRatio.toFixed(4));
  
        // 4) reload with updated URL
        window.location.search = params.toString();
      });
    }
   
    
  
  });
 