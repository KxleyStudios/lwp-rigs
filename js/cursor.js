// Custom Cursor Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Create cursor element
    const cursor = document.createElement('div');
    cursor.classList.add('cursor', 'cursor-default');
    document.body.appendChild(cursor);
    
    // Add the custom-cursor-area class to the body to disable default cursor
    document.body.classList.add('custom-cursor-area');
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Handle cursor over clickable elements
    const clickableElements = 'a, button, .download-btn, .tab-button, .changelog-toggle, .popup-button, .submit-comment';
    
    document.addEventListener('mouseover', (e) => {
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
        cursor.classList.add('cursor-clicking');
    });
    
    // Handle mouseup state
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor-clicking');
    });
    
    // Make sure the cursor is visible when mouse enters the window
    document.addEventListener('mouseenter', () => {
        cursor.style.display = 'block';
    });
    
    // Hide cursor when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        cursor.style.display = 'none';
    });
    
    // Add clickable class to existing elements
    document.querySelectorAll(clickableElements).forEach(element => {
        if (!element.disabled && !element.classList.contains('coming-soon')) {
            element.classList.add('clickable');
        }
    });
});
