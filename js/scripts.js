// Tab Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Previous Firebase initialization code
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
    
    // Tab Navigation functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the tab to activate
            const tabToActivate = button.getAttribute('data-tab');
            
            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Activate the selected tab
            button.classList.add('active');
            document.getElementById(`${tabToActivate}-tab`).classList.remove('hidden');
            
            // If comments tab is selected, load comments
            if(tabToActivate === 'comments') {
                loadComments();
            }
        });
    });
    
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
        // Only load comments if we're on the comments tab initially
        if (!document.getElementById('comments-tab').classList.contains('hidden')) {
            loadComments();
        }
        
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
    
    // Welcome Popup (without Pibby animation)
    // Create the popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'popup-container';
    
    // Create the popup content with rules and original message
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Welcome to Pibby Rig Pack!</h2>
            <p>Hello! Thank you for checking out the Pibby Rig. You may be wondering why there isn't a Trailer Pallet. This is mainly because the trailer colors were only a lighting choice for Pibbys world!</p>
            
            <div class="rules-container">
                <h3>Terms of Use:</h3>
                <ul class="rules-list">
                    <li>Credit Kxley</li>
                    <li>Don't claim as your own</li>
                    <li>No re-releases</li>
                    <li>No NSFW</li>
                    <li>No fake leaks</li>
                </ul>
            </div>
            
            <p>Thank you for reading and have fun with my rigs!</p>
            
            <div class="timer-container">
                <p>Please read the rules carefully.</p>
                <p>You can continue in: <span id="timer-countdown">30</span> seconds</p>
                <div class="timer-bar-container">
                    <div id="timer-bar" class="timer-bar"></div>
                </div>
            </div>
            
            <button id="popup-ok-btn" class="popup-button" disabled>OK</button>
        </div>
    `;
    
    // Append popup to overlay and overlay to body
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Disable page interaction while popup is active
    document.body.style.overflow = 'hidden';
    
    // Make popup visible with animation
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 300);
    
    // Timer functionality
    const timerEl = document.getElementById('timer-countdown');
    const timerBar = document.getElementById('timer-bar');
    const okButton = document.getElementById('popup-ok-btn');
    let timeLeft = 30;
    
    // Update timer every second
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        // Update timer bar width
        const percentLeft = (timeLeft / 30) * 100;
        timerBar.style.width = `${percentLeft}%`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerEl.parentElement.textContent = 'You can continue now!';
            okButton.disabled = false;
            okButton.classList.add('active');
        }
    }, 1000);
    
    // Add click event to the OK button
    okButton.addEventListener('click', function() {
        if (okButton.disabled) return;
        
        // Fade out popup
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            // Enable page interaction
            document.body.style.overflow = '';
        }, 300); // Remove after fade animation completes
    });
});