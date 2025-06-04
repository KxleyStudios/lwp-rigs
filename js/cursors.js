// Custom Cursor Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Check if device supports hover (desktop/laptop) and has a pointer device
    // This will exclude mobile devices, tablets, and touch-only devices
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    
    if (!isDesktop) {
        console.log('Mobile/touch device detected. Custom cursor disabled.');
        return; // Exit early for mobile devices
    }
    
    // Create cursor element
    const cursor = document.createElement('div');
    cursor.classList.add('cursor', 'cursor-default');
    document.body.appendChild(cursor);
    
    // IMPORTANT FIX: Check if cursor images are properly loaded before activating custom cursor
    const cursorImages = [
        'images/cursor-default.png',
        'images/cursor-pointer.png',
        'images/cursor-text.png',
        'images/cursor-clicking.png'
    ];
    
    let allImagesLoaded = true;
    
    // Function to check if an image exists and is loaded
    function checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    // Check if all cursor images exist and are loaded
    Promise.all(cursorImages.map(checkImageExists)).then(results => {
        allImagesLoaded = results.every(result => result === true);
        
        // Only activate custom cursor if all images are loaded
        if (allImagesLoaded) {
            // Add the custom-cursor-area class to the body to disable default cursor
            document.body.classList.add('custom-cursor-area');
        } else {
            // If images aren't loaded, log an error and don't activate custom cursor
            console.error('Some cursor images failed to load. Using default cursor instead.');
            cursor.style.display = 'none';
        }
    });
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Handle cursor over clickable elements
    const clickableElements = 'a, button, .download-btn, .tab-button, .changelog-toggle, .popup-button, .submit-comment';
    
    document.addEventListener('mouseover', (e) => {
        // Only apply if custom cursor is active
        if (!allImagesLoaded) return;
        
        // Check if cursor is over clickable element
        if (e.target.matches(clickableElements) && !e.target.disabled && !e.target.classList.contains('coming-soon')) {
            cursor.classList.remove('cursor-default', 'cursor-text');
            cursor.classList.add('cursor-pointer');
            e.target.classList.add('clickable');
        } 
        // Check if cursor is over text input element
        else if (e.target.matches('input[type="text"], textarea, [contenteditable="true"]')) {
            cursor.classList.remove('cursor-default', 'cursor-pointer');
            cursor.classList.add('cursor-text');
            e.target.classList.add('clickable');
        } 
        // Default cursor for other elements
        else if (!e.target.closest(clickableElements)) {
            cursor.classList.remove('cursor-pointer', 'cursor-text');
            cursor.classList.add('cursor-default');
        }
    });
    
    // Handle mousedown (clicking) state
    document.addEventListener('mousedown', () => {
        if (!allImagesLoaded) return;
        cursor.classList.add('cursor-clicking');
    });
    
    // Handle mouseup state
    document.addEventListener('mouseup', () => {
        if (!allImagesLoaded) return;
        cursor.classList.remove('cursor-clicking');
    });
    
    // Make sure the cursor is visible when mouse enters the window
    document.addEventListener('mouseenter', () => {
        if (!allImagesLoaded) return;
        cursor.style.display = 'block';
    });
    
    // Hide cursor when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        if (!allImagesLoaded) return;
        cursor.style.display = 'none';
    });
    
    // Add clickable class to existing elements
    document.querySelectorAll(clickableElements).forEach(element => {
        if (!element.disabled && !element.classList.contains('coming-soon')) {
            element.classList.add('clickable');
        }
    });
    
    // IMPORTANT: Emergency button to restore default cursor in case of issues
    // Press 'Escape' key to restore default cursor
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.body.classList.remove('custom-cursor-area');
            cursor.style.display = 'none';
            console.log('Custom cursor disabled. Default cursor restored.');
        }
    });
});