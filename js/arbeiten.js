/***************************************************************
  arbeiten.js
  - Mobile navbar toggle
  - Language toggle
  - FAQ accordion
***************************************************************/

// 1) MOBILE NAV TOGGLE
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

// 2) LANGUAGE TOGGLE
const langBtn = document.getElementById('toggleLang');
const germanDivs = document.querySelectorAll('.german');
const englishDivs = document.querySelectorAll('.english');
let isGerman = true;

langBtn.addEventListener('click', () => {
  isGerman = !isGerman;
  germanDivs.forEach(div => div.classList.toggle('hidden', !isGerman));
  englishDivs.forEach(div => div.classList.toggle('hidden', isGerman));
  langBtn.textContent = isGerman ? 'English' : 'Deutsch';
});

/***************************************************************
  3) FAQ ACCORDION
***************************************************************/
function initFaqAccordion() {
  // We have .faq-section or .faq-accordion-de / .faq-accordion-en
  // but let's unify with .faq-accordion-wrapper
  const allFaqWrappers = document.querySelectorAll('.faq-accordion-wrapper');

  allFaqWrappers.forEach(wrapper => {
    const items = wrapper.querySelectorAll('.faq-accordion-item');
    items.forEach(item => {
      const questionBtn = item.querySelector('.faq-accordion-question');
      const answerPanel = item.querySelector('.faq-accordion-answer');
      
      questionBtn.addEventListener('click', () => {
        // Check if it's already open
        const isOpen = questionBtn.classList.contains('active');
        
        // Close all items in this wrapper
        items.forEach(i => {
          const qBtn = i.querySelector('.faq-accordion-question');
          const ans = i.querySelector('.faq-accordion-answer');
          qBtn.classList.remove('active');
          ans.style.maxHeight = '0';
        });
        
        // Toggle current one
        if(!isOpen) {
          questionBtn.classList.add('active');
          answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
        }
      });
    });
  });
}
initFaqAccordion();