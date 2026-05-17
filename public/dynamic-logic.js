/**
 * DYNAMIC SCROLL PATH ANIMATION
 * Creates a reinforcement-style line that draws as you scroll
 */
document.addEventListener('DOMContentLoaded', () => {
    const path = document.getElementById('dynamic-services-path');
    if (path) {
        // Initialize path
        const length = path.getTotalLength() || 6000;
        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = length;

        // Position tracking
        const container = document.querySelector('.services-section');
        
        window.addEventListener('scroll', () => {
            if (!container) return;
            
            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Calculate how far into the services section we are
            // 0 at top of viewport, 1 at bottom of section
            const startOffset = 300; // Delay start
            const totalToScroll = rect.height + viewportHeight;
            const scrolled = Math.max(0, viewportHeight - rect.top - startOffset);
            
            const progress = Math.min(scrolled / (rect.height), 1);
            
            // Dash offset decreases as progress increases
            path.style.strokeDashoffset = length - (length * progress);
        });
    }
});
