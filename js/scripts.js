3060// Tab Navigation Functionality
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
    const forumsCollection = db.collection('pibbyForums');
    
    // Owner authentication state
    let isOwnerAuthenticated = false;
    
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
    const changelogToggles = document.querySelectorAll('.changelog-toggle');
    const changelogContents = document.querySelectorAll('.changelog-content');
    
    changelogToggles.forEach((toggle, index) => {
        const content = changelogContents[index];
        if (toggle && content) {
            toggle.addEventListener('click', function() {
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                    toggle.textContent = 'Show Changelog';
                } else {
                    content.style.display = 'block';
                    toggle.textContent = 'Hide Changelog';
                }
            });
        }
    });
    
    // ========== CREATOR VERIFICATION SYSTEM ==========
    // List of reserved usernames (case insensitive)
    const reservedUsernames = [
        'kxley', 
        'kxleystudios', 
        'kxley studios', 
        'admin', 
        'administrator', 
        'mod', 
        'moderator', 
        'creator', 
        'owner'
    ];
    
    // Creator verification secret key
    const creatorSecretKey = "<Kx839175087mDfS843wj8>";
    
    // Function to check if a username is reserved
    function isReservedUsername(name) {
        const nameLower = name.toLowerCase().trim();
        return reservedUsernames.some(reserved => {
            // Check for exact match or if the reserved name appears in the user input
            return nameLower === reserved.toLowerCase() || 
                   nameLower.includes(reserved.toLowerCase());
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
            let name = commenterNameInput.value.trim();
            const comment = commentInput.value.trim();
            let isCreator = false;
            
            // Check if name is empty
            if (!name) {
                alert('Please enter your name!');
                return;
            }
            
            // Check if comment is empty
            if (!comment) {
                alert('Please enter a comment!');
                return;
            }
            
            // Check for creator verification code in the name field
            if (name.includes(creatorSecretKey)) {
                // Extract the code and set name to creator name
                name = name.replace(creatorSecretKey, '').trim();
                if (!name) name = "KxleyStudios"; // Default if no other text
                isCreator = true;
            } 
            // Check for reserved usernames if not the creator
            else if (isReservedUsername(name)) {
                alert('This username is reserved. Please choose a different name.');
                return;
            }
            
            submitCommentBtn.disabled = true;
            submitCommentBtn.textContent = 'Submitting...';
            
            const now = new Date();
            const dateStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()}`;
            
            commentsCollection.add({
                name: name,
                content: comment,
                date: dateStr,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                isCreator: isCreator // Store creator flag in database
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
                            commentData.content,
                            commentData.isCreator || false
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
    
    function createCommentElement(name, date, content, isCreator) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        
        // Apply special styling for creator comments
        if (isCreator) {
            commentEl.classList.add('creator-comment');
        }
        
        // Create the comment HTML structure
        let nameDisplay = escapeHTML(name);
        
        // Add creator badge if this is the creator
        if (isCreator) {
            nameDisplay = `<span class="creator-name">${nameDisplay}</span> <span class="creator-badge">Creator</span>`;
        }
        
        commentEl.innerHTML = `
            <div class="comment-header">
                <span class="commenter-name">${nameDisplay}</span>
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
    if (!localStorage.getItem('pibbyWelcomeSeen')) {
        // --- Create Welcome Popup ---
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';

        const popup = document.createElement('div');
        popup.className = 'popup-container';

        popup.innerHTML = `
            <div class="popup-content">
                <h2>Welcome to Pibby Rig Pack!</h2>
                <p>Hello! Thank you for checking out the Pibby Rig. You may be wondering why there isn't a Trailer Pallet. This is mainly because the trailer colors were only a lighting choice for Pibbys world!</p>

                <div class="rules-container">
                    <h3>Terms of Use:</h3>
                    <ul class="rules-list">
                        <li><strong>Mandatory Credit:</strong> You are required to give full and visible credit to <strong>Kxley</strong> in any use, post, showcase, or distribution. This is <u>not optional</u>. Failure to comply will result in a permanent ban from future use and may result in further action.</li>
                        <li><strong>No Claiming as Your Own:</strong> You are strictly prohibited from claiming, presenting, or implying that this content was created by anyone other than <strong>Kxley</strong>. This includes renaming, editing, or repackaging for the purpose of misattribution.</li>
                        <li><strong>No Re-Uploads or Re-Releases:</strong> You are not permitted to re-upload, redistribute, or re-release any part of this content on any platform, including but not limited to Discord, forums, mod sites, or file-sharing services. This applies even if credit is given.</li>
                        <li><strong>No NSFW or Inappropriate Use:</strong> Under no circumstances may this content be used in any NSFW (Not Safe for Work), explicit, or offensive context. This includes sexual, violent, or otherwise inappropriate material.</li>
                        <li><strong>No Fake Leaks or Manipulation:</strong> You may not fake leaks, create false versions, or mislead others using this content in any way. All impersonation, forgery, or attempts to confuse users will be met with severe action.</li>
                        <li><strong>No Disrespect Towards Kxley:</strong> You are expected to treat <strong>Kxley</strong> with full respect. Harassment, hate, slander, or defamation against the creator will result in being blacklisted from all future content and reported if necessary.</li>
                        <li><strong>No Monetization:</strong> You may not use this content in any commercial capacity, including paywalled content, NFTs, or any monetized service, without explicit written permission from <strong>Kxley</strong>.</li>
                        <li><strong>Legal Enforcement:</strong> Violation of any of the above terms may result in legal action, DMCA takedowns, blacklisting, or community bans. These rules are binding and enforced.</li>
                        <li><strong>Subject to Change:</strong> These Terms of Use may be updated at any time by <strong>Kxley</strong>. Continued use of the content implies agreement to the most recent version.</li>
                    </ul>
                </div>

                <p>Thank you for reading and have fun with my rigs!</p>

                <div class="timer-container">
                    <p>Please read the rules carefully.</p>
                    <p>You can continue in: <span id="timer-countdown">120</span> seconds</p>
                    <div class="timer-bar-container">
                        <div id="timer-bar" class="timer-bar"></div>
                    </div>
                </div>

                <button id="popup-ok-btn" class="popup-button" disabled>OK</button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Disable page scroll during popup
        document.body.style.overflow = 'hidden';

        // Fade in popup
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 300);

        // --- Timer Logic ---
        const timerEl = document.getElementById('timer-countdown');
        const timerBar = document.getElementById('timer-bar');
        const okButton = document.getElementById('popup-ok-btn');
        let timeLeft = 120; // 2 minutes

        const timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;

            // Update bar width
            const percentLeft = (timeLeft / 120) * 100;
            timerBar.style.width = `${percentLeft}%`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerEl.textContent = '0';

                const continueMsg = document.createElement('p');
                continueMsg.textContent = 'You can continue now!';
                const container = timerEl.closest('.timer-container');
                container.insertBefore(continueMsg, container.firstChild);

                okButton.disabled = false;
                okButton.classList.add('active');
            }
        }, 1000);

        // --- Button Action ---
        okButton.addEventListener('click', function () {
            if (okButton.disabled) return;

            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = ''; // Re-enable scroll
                localStorage.setItem('pibbyWelcomeSeen', 'yes'); // Remember user has seen popup
            }, 300);
        });
    }
});

// Function to download the darkness.png image
window.downloadDarknessImage = function() {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = 'images/darkness.png';
    link.download = 'darkness.png'; // This will be the downloaded file name

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optional: Show a brief confirmation message
    const button = document.querySelector('.download-darkness-btn');
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✅</span> Downloaded!';
        button.style.background = 'linear-gradient(135deg, #28a745, #1e7e34)';

        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
        }, 2000);
    }
};