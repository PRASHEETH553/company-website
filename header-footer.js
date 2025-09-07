document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Dropdown menu toggle with animation
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const closeButton = document.querySelector('.close-dropdown');

    if (dropbtn && dropdownContent && closeButton) {
        dropbtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = dropdownContent.classList.contains('active');
            if (isActive) {
                dropdownContent.classList.remove('active');
            } else {
                dropdownContent.classList.add('active');
            }
            dropbtn.classList.toggle('active', !isActive);
        });

        closeButton.addEventListener('click', () => {
            dropdownContent.classList.remove('active');
            dropbtn.classList.remove('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.classList.remove('active');
                dropbtn.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate glow-effect and footer columns on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                if (entry.target.classList.contains('footer-column')) {
                    entry.target.classList.add('visible');
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glow-effect, .footer-column').forEach(element => {
        observer.observe(element);
    });
});



document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
  }
});