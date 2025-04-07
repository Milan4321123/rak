document.addEventListener('DOMContentLoaded', () => {
    // =====================================================
    // 1) MOBILE NAVBAR TOGGLE
    // =====================================================
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
  
    // =====================================================
    // 2) DETECT ?lang=de OR ?lang=en FROM URL
    // =====================================================
    const urlParams = new URLSearchParams(window.location.search);
    let currentLang = urlParams.get('lang');
    if (!currentLang) {
      currentLang = 'de'; // fallback if ?lang not found
    }
  
    // Grab references to your .german and .english sections
    const germanDivs = document.querySelectorAll('.german');
    const englishDivs = document.querySelectorAll('.english');
  
    // If currentLang is 'en', hide German and show English
    let isGerman = (currentLang !== 'en');
    germanDivs.forEach(el => el.classList.toggle('hidden', !isGerman));
    englishDivs.forEach(el => el.classList.toggle('hidden', isGerman));
  
    // =====================================================
    // 3) RESTORE PREVIOUS SCROLL RATIO (IF ANY)
    // =====================================================
    // We'll see if there's a ?scrollRatio= param; if so, we'll apply that.
    // (Because we might pass the scroll ratio through the URL on reload)
    if (urlParams.has('scrollRatio')) {
      const ratio = parseFloat(urlParams.get('scrollRatio'));
      // Wait a short moment so the document size is calculated
      setTimeout(() => {
        const newDocHeight = document.body.scrollHeight;
        // The user's original scroll was ratio * docHeight
        const newScrollY = Math.round(newDocHeight * ratio);
        window.scrollTo(0, newScrollY);
      }, 50);
    }
  
    // =====================================================
    // 4) LANGUAGE TOGGLE BUTTON (WITH SCROLL PRESERVATION)
    // =====================================================
    const langBtn = document.getElementById('toggleLang');
    if (langBtn) {
      // Initial button text
      langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  
      langBtn.addEventListener('click', () => {
        // 4A) First, store the user's current scroll ratio
        const currentScrollY = window.pageYOffset;
        const docHeight = document.body.scrollHeight || 1;
        const ratio = currentScrollY / docHeight;
  
        // 4B) Flip the language
        isGerman = !isGerman;
        const newLang = isGerman ? 'de' : 'en';
  
        // 4C) Update ?lang= param and also store ?scrollRatio= param
        urlParams.set('lang', newLang);
        urlParams.set('scrollRatio', ratio.toFixed(4)); 
        // toFixed(4) is just to avoid super long decimals
  
        // 4D) Reload with updated search params
        window.location.search = urlParams.toString();
      });
    }
  });