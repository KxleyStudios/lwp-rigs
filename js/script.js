document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCdTCTqETv6Hx8Rx56pa4K2IJbCJINkGnY",
        authDomain: "pibby-rig-comments.firebaseapp.com",
        projectId: "pibby-rig-comments",
        storageBucket: "pibby-rig-comments.firebasestorage.app",
        messagingSenderId: "472256862793",
        appId: "1:472256862793:web:6ef3079097475f3fbcfd98"
    };
    
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const commentsCollection = db.collection('pibbyComments');
    
    // Changelog toggle functionality
    const changelogToggle = document.querySelector('.changelog-toggle');
    const changelogContent = document.querySelector('.changelog-content');
    
    if (changelogToggle && changelogContent) {
        changelogToggle.addEventListener('click', function() {
            if (changelogContent.style.display === 'block') {
                changelogContent.style.display = 'none';
                changelogToggle.textContent = 'Show Changelog';
            } else {
                changelogContent.style.display = 'block';
                changelogToggle.textContent = 'Hide Changelog';
            }
        });
    }
    
    // Comment submission functionality
    const submitCommentBtn = document.querySelector('.submit-comment');
    const commenterNameInput = document.querySelector('.commenter-name-input');
    const commentInput = document.querySelector('.comment-input');
    const commentsContainer = document.querySelector('.comments-container');
    
    if (submitCommentBtn && commenterNameInput && commentInput && commentsContainer) {
        loadComments();
        
        submitCommentBtn.addEventListener('click', function() {
            const name = commenterNameInput.value.trim();
            const comment = commentInput.value.trim();
            
            if (name && comment) {
                submitCommentBtn.disabled = true;
                submitCommentBtn.textContent = 'Submitting...';
                
                const now = new Date();
                const dateStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()}`;
                
                commentsCollection.add({
                    name: name,
                    content: comment,
                    date: dateStr,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    commenterNameInput.value = '';
                    commentInput.value = '';
                    
                    submitCommentBtn.disabled = false;
                    submitCommentBtn.textContent = 'Submit Comment';
                    
                    loadComments();
                })
                .catch(error => {
                    console.error("Error adding comment: ", error);
                    alert("Sorry, there was an error submitting your comment. Please try again.");
                    submitCommentBtn.disabled = false;
                    submitCommentBtn.textContent = 'Submit Comment';
                });
            } else {
                alert('Please enter both your name and comment!');
            }
        });
    }
    
    function loadComments() {
        if (commentsContainer) {
            commentsContainer.innerHTML = '<div class="loading-comments">Loading comments...</div>';
            
            commentsCollection.orderBy('timestamp', 'desc').get()
                .then((querySnapshot) => {
                    commentsContainer.innerHTML = '';
                    
                    if (querySnapshot.empty) {
                        commentsContainer.innerHTML = '<div class="no-comments">No comments yet! Be the first to leave feedback.</div>';
                        return;
                    }
                    
                    querySnapshot.forEach((doc) => {
                        const commentData = doc.data();
                        const commentEl = createCommentElement(
                            commentData.name,
                            commentData.date,
                            commentData.content
                        );
                        commentsContainer.appendChild(commentEl);
                    });
                })
                .catch((error) => {
                    console.error("Error getting comments: ", error);
                    commentsContainer.innerHTML = '<div class="comments-error">Error loading comments. Please refresh the page to try again.</div>';
                });
        }
    }
    
    function createCommentElement(name, date, content) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.innerHTML = `
            <div class="comment-header">
                <span class="commenter-name">${escapeHTML(name)}</span>
                <span class="comment-date">${date}</span>
            </div>
            <div class="comment-content">
                ${escapeHTML(content)}
            </div>
        `;
        return commentEl;
    }
    
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Welcome Popup Functionality
    // Create the popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'popup-container';
    
    // Create the popup content
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Welcome to Pibby Rig Pack!</h2>
            <p>Hello! Thank you for checking out the Pibby Rig. You may be wondering why there isn't a Trailer Pallet. This is mainly because the trailer colors were only a lighting choice for Pibbys world!</p>
            <p>Thank you for reading and have fun with my rigs!</p>
            <button id="popup-ok-btn" class="popup-button">OK</button>
        </div>
    `;
    
    // Append popup to overlay and overlay to body
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Add click event to the OK button
    document.getElementById('popup-ok-btn').addEventListener('click', function() {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
        }, 300); // Remove after fade animation completes
    });
    
    // Show popup with a slight delay for better user experience
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 300);
});