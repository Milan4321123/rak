/***************************************************************
  kontakt.js - Minimal logic for Kontakt page
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

if(langBtn) {
  langBtn.addEventListener('click', () => {
    isGerman = !isGerman;
    germanDivs.forEach(div => div.classList.toggle('hidden', !isGerman));
    englishDivs.forEach(div => div.classList.toggle('hidden', isGerman));
    langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  });
}

// 3) TOGGLE APPOINTMENT FIELDS (IF ANY)
const radioMsgDe = document.getElementById('message');
const radioApptDe = document.getElementById('appoint');
const appointmentFields = document.getElementById('appointment-fields');

// For EN (if needed)
const radioMsgEn = document.getElementById('en-anliegen-message');
const radioApptEn = document.getElementById('en-anliegen-appointment');
const appointmentFieldsEn = document.getElementById('appointment-fields-en');

function toggleAppointmentFields() {
  // German
  if(radioMsgDe && radioApptDe && appointmentFields) {
    console.log("German radio state:", radioApptDe.checked ? "Appointment selected" : "Message only");
    appointmentFields.style.display = radioApptDe.checked ? 'block' : 'none';
  }
  // English
  if(radioMsgEn && radioApptEn && appointmentFieldsEn) {
    console.log("English radio state:", radioApptEn.checked ? "Appointment selected" : "Message only");
    appointmentFieldsEn.style.display = radioApptEn.checked ? 'block' : 'none';
  }
}

// Attach events if they exist
if(radioMsgDe) {
  radioMsgDe.addEventListener('change', toggleAppointmentFields);
  radioApptDe.addEventListener('change', toggleAppointmentFields);
}
if(radioMsgEn) {
  radioMsgEn.addEventListener('change', toggleAppointmentFields);
  radioApptEn.addEventListener('change', toggleAppointmentFields);
}

// Init on page load
toggleAppointmentFields();

// 4) IMAGE LOADING OPTIMIZATION
document.addEventListener('DOMContentLoaded', function() {
  // Get all images on the page that need optimization
  const images = document.querySelectorAll('.hero-image-block img, .why-card img, .method-icon img, .step-icon img');
  
  // Add fade-in effect when images are loaded
  images.forEach(img => {
    // Start with 0 opacity
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';
    
    // When image loads, fade it in
    img.onload = function() {
      img.style.opacity = '1';
    };
    
    // If image is already loaded (from cache)
    if (img.complete) {
      img.style.opacity = '1';
    }
    
    // Add error handling
    img.onerror = function() {
      console.log('Error loading image:', img.src);
      // Optionally set a fallback image
      // img.src = 'path/to/fallback-image.jpg';
    };
  });
});

// 5) ENHANCED FORM VALIDATION
const forms = document.querySelectorAll('form');

forms.forEach(form => {
  form.addEventListener('submit', function(event) {
    const emailInput = form.querySelector('input[type="email"]');
    const messageInput = form.querySelector('textarea');
    const nameInput = form.querySelector('input[name="name"]');
    let isValid = true;
    
    // Name validation
    if (nameInput && nameInput.value.trim().length < 2) {
      event.preventDefault();
      showError(nameInput, form.classList.contains('de-form') ? 
        'Bitte geben Sie Ihren Namen ein' : 
        'Please enter your name');
      isValid = false;
    } else if (nameInput) {
      removeError(nameInput);
    }
    
    // Email validation
    if (emailInput && !isValidEmail(emailInput.value)) {
      event.preventDefault();
      showError(emailInput, form.classList.contains('de-form') ? 
        'Bitte geben Sie eine gültige E-Mail-Adresse ein' : 
        'Please enter a valid email address');
      isValid = false;
    } else if (emailInput) {
      removeError(emailInput);
    }
    
    // Message validation
    if (messageInput && messageInput.value.trim().length < 10) {
      event.preventDefault();
      showError(messageInput, form.classList.contains('de-form') ? 
        'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein' : 
        'Please enter a message with at least 10 characters');
      isValid = false;
    } else if (messageInput) {
      removeError(messageInput);
    }
    
    return isValid;
  });
});

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(element, message) {
  // Remove any existing error
  removeError(element);
  
  // Create error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerText = message;
  errorDiv.style.color = '#ff6b6b';
  errorDiv.style.fontSize = '0.8rem';
  errorDiv.style.marginTop = '0.3rem';
  errorDiv.style.marginLeft = '0.2rem';
  
  // Insert error after element
  element.parentNode.insertBefore(errorDiv, element.nextSibling);
  
  // Highlight the input
  element.style.borderColor = '#ff6b6b';
  element.style.boxShadow = '0 0 5px rgba(255, 107, 107, 0.5)';
}

function removeError(element) {
  // Find and remove error message
  const parent = element.parentNode;
  const errorDiv = parent.querySelector('.error-message');
  if (errorDiv) {
    parent.removeChild(errorDiv);
  }
  
  // Remove highlight
  element.style.borderColor = '';
  element.style.boxShadow = '';
}