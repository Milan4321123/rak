/***************************************************************
  dienstleistungen.js
  For the new black & silver "Dienstleistungen" layout
***************************************************************/

/* 1) MOBILE NAV TOGGLE */
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

/* 2) LANGUAGE TOGGLE */
const langBtn = document.getElementById('toggleLang');
const germanDivs = document.querySelectorAll('.german');
const englishDivs = document.querySelectorAll('.english');
let isGerman = true;

// Check URL for language preference
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('lang') === 'en') {
  isGerman = false;
  germanDivs.forEach(el => el.classList.toggle('hidden', !isGerman));
  englishDivs.forEach(el => el.classList.toggle('hidden', isGerman));
  langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  // Update language fields in forms if they exist
  document.querySelectorAll('input[name="language"]').forEach(el => {
    el.value = 'en';
  });
}

langBtn.addEventListener('click', () => {
  isGerman = !isGerman;
  germanDivs.forEach(el => el.classList.toggle('hidden', !isGerman));
  englishDivs.forEach(el => el.classList.toggle('hidden', isGerman));
  langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  
  // Update language fields in forms
  document.querySelectorAll('input[name="language"]').forEach(el => {
    el.value = isGerman ? 'de' : 'en';
  });
});

/* 3) FAQ ACCORDION */
function initFaqAccordion(containerSelector) {
  // This will match both .faq-accordion-de and .faq-accordion-en
  const accordions = document.querySelectorAll(containerSelector + ' .faq-accordion-item');

  accordions.forEach((item) => {
    const questionBtn = item.querySelector('.faq-accordion-question');
    const answerPanel = item.querySelector('.faq-accordion-answer');

    questionBtn.addEventListener('click', () => {
      // Check if it's already open
      const isOpen = questionBtn.classList.contains('active');

      // Close all accordion items first
      accordions.forEach((otherItem) => {
        const otherBtn = otherItem.querySelector('.faq-accordion-question');
        const otherAns = otherItem.querySelector('.faq-accordion-answer');
        otherBtn.classList.remove('active');
        otherAns.style.maxHeight = 0;
      });

      // Toggle this one
      if (!isOpen) {
        questionBtn.classList.add('active');
        answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
      }
    });
  });
}

// Initialize FAQ for both German and English
initFaqAccordion('.faq-accordion-de');
initFaqAccordion('.faq-accordion-en');

/* 4) APPOINTMENT CHECKBOX TOGGLE */
function initAppointmentFields() {
  const appointmentCheckboxes = document.querySelectorAll('input[name="wantsAppointment"]');
  
  appointmentCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const fieldsContainer = this.closest('.checkbox-row').querySelector('.appointment-fields');
      if (fieldsContainer) {
        fieldsContainer.style.display = this.checked ? 'flex' : 'none';
        
        // If checkbox is unchecked, clear date/time fields
        if (!this.checked) {
          const dateInput = fieldsContainer.querySelector('input[name="terminDate"]');
          const timeInput = fieldsContainer.querySelector('input[name="terminTime"]');
          if (dateInput) dateInput.value = '';
          if (timeInput) timeInput.value = '';
        }
      }
    });
  });
}

/* 5) QUICK CONTACT FORMS */
function initQuickContactForms() {
  const quickForms = document.querySelectorAll('.quick-form');
  
  quickForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = form.querySelector('input[name="email"]').value;
      const language = form.querySelector('input[name="language"]').value;
      
      // Create a temporary form to submit with all required fields
      const tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = '/send-email';
      tempForm.style.display = 'none';
      
      // Add all required fields
      const fields = [
        { name: 'email', value: email },
        { name: 'language', value: language },
        { name: 'name', value: 'Website Inquiry' },
        { name: 'message', value: 'Quick contact request from services page.' },
        { name: 'hp', value: '' }
      ];
      
      fields.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        tempForm.appendChild(input);
      });
      
      // Append to body and submit
      document.body.appendChild(tempForm);
      tempForm.submit();
    });
  });
}

// Initialize all forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initAppointmentFields();
  initQuickContactForms();
  
  // Set today as min date for appointment fields
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.min = today;
  });
  
  // Add event handler for all contact forms to validate before submission
  const contactForms = document.querySelectorAll('form[action="/send-email"]');
  contactForms.forEach(form => {
    if (!form.classList.contains('quick-form')) { // Skip quick forms as they're handled separately
      form.addEventListener('submit', function(e) {
        const appointmentCheckbox = form.querySelector('input[name="wantsAppointment"]');
        
        if (appointmentCheckbox && appointmentCheckbox.checked) {
          const dateInput = form.querySelector('input[name="terminDate"]');
          const timeInput = form.querySelector('input[name="terminTime"]');
          
          if (!dateInput.value || !timeInput.value) {
            e.preventDefault();
            alert(isGerman ? 
              'Bitte wählen Sie Datum und Uhrzeit für Ihren Termin.' : 
              'Please select both date and time for your appointment.');
          }
        }
      });
    }
  });
});

/* 4) OPTIONAL: ADVANTAGES HORIZONTAL SCROLL
   If you want to show left/right arrows for
   the .advantages-scroll-wrapper sections. 
   This code snippet sets up two arrow buttons
   to horizontally scroll the container. 
   You can adapt the class names as needed.
*/
function initAdvantagesScroll(containerSelector, leftArrowSelector, rightArrowSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const leftArrow = document.querySelector(leftArrowSelector);
  const rightArrow = document.querySelector(rightArrowSelector);

  if (leftArrow) {
    leftArrow.addEventListener('click', () => {
      container.scrollBy({
        top: 0,
        left: -300, // adjust scroll distance
        behavior: 'smooth'
      });
    });
  }
  if (rightArrow) {
    rightArrow.addEventListener('click', () => {
      container.scrollBy({
        top: 0,
        left: 300,
        behavior: 'smooth'
      });
    });
  }
}

/* Example usage:
   initAdvantagesScroll('.advantages-scroll-wrapper', '#arrowLeft', '#arrowRight');
   Make sure you have <button id="arrowLeft">Prev</button> 
   and <button id="arrowRight">Next</button> 
   around your .advantages-scroll-wrapper in the HTML
*/

/* 
  If you don't plan on using left/right arrow buttons,
  the horizontal scroll can remain purely drag or scroll-based,
  and you can ignore this optional function.
*/