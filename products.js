document.addEventListener('DOMContentLoaded', function() {
    // Initialize product videos
    const productContainers = document.querySelectorAll('.product-container');
    
    productContainers.forEach(container => {
        const video = container.querySelector('.product-video');
        
        // Only start video playing when mouse enters the container
        container.addEventListener('mouseenter', () => {
            if (video.paused) {
                video.play();
                
                // Add animation classes to product content items
                const contentItems = container.querySelectorAll('.product-content > *');
                contentItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.transition = 'all 0.5s ease';
                        item.style.transform = 'translateY(0)';
                        item.style.opacity = '1';
                    }, 300 + (index * 100));
                });
            }
        });
        
        // Reset content items animation when mouse leaves
        container.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        
        // Set initial states for content items
        const contentItems = container.querySelectorAll('.product-content > *');
        contentItems.forEach(item => {
            item.style.transform = 'translateY(20px)';
            item.style.opacity = '0';
        });
    });
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // Observe all product containers
    productContainers.forEach(container => {
        observer.observe(container);
    });
    
    // Function to handle background video loading
    function setupBackgroundVideos() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Add loading class
            video.parentElement.classList.add('loading');
            
            // Remove loading class when video can play
            video.addEventListener('canplay', () => {
                video.parentElement.classList.remove('loading');
            });
            
            // Error handling
            video.addEventListener('error', () => {
                console.error('Video failed to load:', video.src);
                video.parentElement.classList.remove('loading');
                video.parentElement.classList.add('video-error');
            });
        });
    }
    
    setupBackgroundVideos();
});