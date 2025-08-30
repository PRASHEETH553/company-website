document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for navigation links and scroll-down box
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Dropdown click functionality
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const dropbtn = dropdown.querySelector('.dropbtn');
    const closeBtn = dropdown.querySelector('.close-dropdown');

    dropbtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isActive = dropdown.classList.contains('active');
      dropdowns.forEach(d => d.classList.remove('active')); // Close all other dropdowns
      if (!isActive) {
        dropdown.classList.add('active'); // Open current dropdown
      }
    });

    // Close dropdown when clicking the close button
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        dropdown.classList.remove('active');
      });
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
  });

  // Image Slider Functionality
  const slider = document.querySelector('.slides');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const images = document.querySelectorAll('.slide-image');
  const totalImages = images.length / 2; // Account for duplicated images
  let currentIndex = 0;
  const imagesPerView = 4;

  const updateSlider = () => {
    const imageWidth = images[0].offsetWidth + 80;
    const translateX = -(currentIndex * imageWidth);
    slider.style.transition = 'transform 0.5s ease';
    slider.style.transform = `translateX(${translateX}px)`;

    // Seamless infinite loop
    if (currentIndex >= totalImages) {
      setTimeout(() => {
        slider.style.transition = 'none';
        currentIndex = 0;
        slider.style.transform = `translateX(0px)`;
      }, 500);
    }
    if (currentIndex < 0) {
      setTimeout(() => {
        slider.style.transition = 'none';
        currentIndex = totalImages - imagesPerView;
        const resetTranslateX = -(currentIndex * imageWidth);
        slider.style.transform = `translateX(${resetTranslateX}px)`;
      }, 500);
    }
  };

  const moveToNextImage = () => {
    currentIndex++;
    updateSlider();
  };

  const moveToPrevImage = () => {
    currentIndex--;
    updateSlider();
  };

  let autoScrollInterval = setInterval(moveToNextImage, 2000);

  slider.parentElement.addEventListener('mouseover', () => {
    clearInterval(autoScrollInterval);
  });

  slider.parentElement.addEventListener('mouseout', () => {
    autoScrollInterval = setInterval(moveToNextImage, 2000);
  });

  nextBtn.addEventListener('click', () => {
    moveToNextImage();
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(moveToNextImage, 2000);
  });

  prevBtn.addEventListener('click', () => {
    moveToPrevImage();
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(moveToNextImage, 2000);
  });

  updateSlider();

  // Tab Functionality for Mission, Vision, Values
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const missionVisionImage = document.getElementById('mission-vision-image');

  // Set default GIF to Rocket-unscreen.gif on page load
  missionVisionImage.src = missionVisionImage.getAttribute('data-mission');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');

      // Update GIF based on active tab
      const src = missionVisionImage.getAttribute(`data-${tabId}`);
      if (src) {
        missionVisionImage.src = src;
      }
    });
  });

  // Newsletter Popup Functionality
  const subscribeBtn = document.getElementById('subscribe-btn');
  const newsletterEmail = document.getElementById('newsletter-email');
  const popup = document.getElementById('newsletter-popup');
  const closePopup = document.querySelector('.close-popup');

  subscribeBtn.addEventListener('click', () => {
    if (newsletterEmail.value.trim() !== '') {
      popup.style.display = 'flex';
    }
  });

  closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
    newsletterEmail.value = '';
  });

  // Close popup when clicking outside
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.style.display = 'none';
      newsletterEmail.value = '';
    }
  });

  // Gradient Animation with Scroll (Fueled-style)
  const gradientSection = document.querySelector('.gradient-animation-section');
  let lastScroll = 0;

  const updateGradient = () => {
    const sectionTop = gradientSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    if (sectionTop < windowHeight && sectionTop > -gradientSection.offsetHeight) {
      const scrollProgress = 1 - (sectionTop / windowHeight); // 0 to 1 as section enters view
      const translateY = scrollProgress * 100 - 50; // -50% to 50% range
      gradientSection.style.backgroundPosition = `50% ${translateY}%`;
    }
  };

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateGradient);
  });

  // Initial call to set gradient on load
  updateGradient();
});