document.addEventListener('DOMContentLoaded', () => {
    // Fade-in animation for sections
    const sections = document.querySelectorAll('section');
    const options = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Hover effect for items
    const items = document.querySelectorAll('.advantage-item, .credibility-item, .success-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = '#ffebee';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = item.classList.contains('credibility-item') ? '#f5f5f5' : '#ffffff';
        });
    });
});

// Fade-in animation
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);