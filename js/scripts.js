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
    const replyingToElement = document.getElementById('replying-to');
    let replyingToId = null;
    
    // Function to handle the reply button click
    function handleReplyClick(commentId, commenterName) {
        replyingToId = commentId;
        replyingToElement.textContent = commenterName;
        replyingToElement.parentElement.style.display = 'flex';
        commentInput.focus();
        
        // Scroll to comment form
        document.querySelector('.comment-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Cancel reply button
    document.getElementById('cancel-reply').addEventListener('click', function() {
        replyingToId = null;
        replyingToElement.parentElement.style.display = 'none';
    });
    
    if (submitCommentBtn && commenterNameInput && commentInput && commentsContainer) {
        // Only load comments if we're on the comments tab initially
        if (!document.getElementById('comments-tab').classList.contains('hidden')) {
            loadComments();
        }
        
        submitCommentBtn.addEventListener('click', function() {
            let name = commenterNameInput.value.trim();
            const comment = commentInput.value.trim();
            
            // Special code for rig maker authentication
            const rigMakerCode = "Kx839175087mDfS843wj8";
            let isRigMaker = false;
            
            // Check if the name contains the special code
            if (name.includes(rigMakerCode)) {
                name = "KxleyStudios"; // Set the display name
                isRigMaker = true;
            }
            
            // Block impersonation attempts
            if (!isRigMaker && (
                name.toLowerCase() === "kxley" || 
                name.toLowerCase() === "kxley1991" || 
                name.toLowerCase() === "kxleystudios" ||
                name.toLowerCase().includes("kxley")
            )) {
                alert("This username is reserved. Please choose a different name.");
                return;
            }
            
            if (name && comment) {
                submitCommentBtn.disabled = true;
                submitCommentBtn.textContent = 'Submitting...';
                
                const now = new Date();
                const dateStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()}`;
                
                commentsCollection.add({
                    name: name,
                    content: comment,
                    date: dateStr,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    isRigMaker: isRigMaker,
                    parentId: replyingToId, // Will be null for top-level comments
                    replies: []
                })
                .then((docRef) => {
                    // If this is a reply, update the parent comment's replies array
                    if (replyingToId) {
                        commentsCollection.doc(replyingToId).update({
                            replies: firebase.firestore.FieldValue.arrayUnion(docRef.id)
                        }).then(() => {
                            // Reset reply status
                            replyingToId = null;
                            replyingToElement.parentElement.style.display = 'none';
                        });
                    }
                    
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
            
            // First get all top-level comments (those without a parentId)
            commentsCollection.where('parentId', '==', null).orderBy('timestamp', 'desc').get()
                .then((querySnapshot) => {
                    commentsContainer.innerHTML = '';
                    
                    if (querySnapshot.empty) {
                        commentsContainer.innerHTML = '<div class="no-comments">No comments yet! Be the first to leave feedback.</div>';
                        return;
                    }
                    
                    // Process all top-level comments
                    let promises = [];
                    querySnapshot.forEach((doc) => {
                        const commentData = doc.data();
                        const commentId = doc.id;
                        
                        // If the comment has replies, fetch them
                        if (commentData.replies && commentData.replies.length > 0) {
                            const promise = getCommentReplies(commentData.replies)
                                .then(replies => {
                                    const commentEl = createCommentElement(
                                        commentData.name,
                                        commentData.date,
                                        commentData.content,
                                        commentId,
                                        commentData.isRigMaker,
                                        replies
                                    );
                                    commentsContainer.appendChild(commentEl);
                                });
                            promises.push(promise);
                        } else {
                            const commentEl = createCommentElement(
                                commentData.name,
                                commentData.date,
                                commentData.content,
                                commentId,
                                commentData.isRigMaker,
                                []
                            );
                            commentsContainer.appendChild(commentEl);
                        }
                    });
                    
                    // Wait for all reply fetches to complete
                    return Promise.all(promises);
                })
                .catch((error) => {
                    console.error("Error getting comments: ", error);
                    commentsContainer.innerHTML = '<div class="comments-error">Error loading comments. Please refresh the page to try again.</div>';
                });
        }
    }
    
    // Helper function to fetch replies for a comment
    function getCommentReplies(replyIds) {
        if (!replyIds || replyIds.length === 0) {
            return Promise.resolve([]);
        }
        
        const promises = replyIds.map(id => {
            return commentsCollection.doc(id).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            name: data.name,
                            date: data.date,
                            content: data.content,
                            isRigMaker: data.isRigMaker
                        };
                    }
                    return null;
                });
        });
        
        return Promise.all(promises).then(replies => replies.filter(reply => reply !== null));
    }
    
    function createCommentElement(name, date, content, commentId, isRigMaker, replies) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        if (isRigMaker) {
            commentEl.classList.add('rig-maker-comment');
        }
        
        let nameHtml = isRigMaker 
            ? `<span class="commenter-name rig-maker-name">${escapeHTML(name)} <span class="verified-badge">Creator</span></span>`
            : `<span class="commenter-name">${escapeHTML(name)}</span>`;
            
        commentEl.innerHTML = `
            <div class="comment-header">
                ${nameHtml}
                <span class="comment-date">${date}</span>
            </div>
            <div class="comment-content">
                ${escapeHTML(content)}
            </div>
            <div class="comment-actions">
                <button class="reply-btn" data-comment-id="${commentId}" data-commenter-name="${escapeHTML(name)}">Reply</button>
            </div>
        `;
        
        // Add replies if they exist
        if (replies && replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            
            replies.forEach(reply => {
                const replyElement = document.createElement('div');
                replyElement.className = 'reply-comment';
                if (reply.isRigMaker) {
                    replyElement.classList.add('rig-maker-comment');
                }
                
                let replyNameHtml = reply.isRigMaker 
                    ? `<span class="commenter-name rig-maker-name">${escapeHTML(reply.name)} <span class="verified-badge">Creator</span></span>`
                    : `<span class="commenter-name">${escapeHTML(reply.name)}</span>`;
                
                replyElement.innerHTML = `
                    <div class="comment-header">
                        ${replyNameHtml}
                        <span class="comment-date">${reply.date}</span>
                    </div>
                    <div class="comment-content">
                        ${escapeHTML(reply.content)}
                    </div>
                `;
                
                repliesContainer.appendChild(replyElement);
            });
            
            commentEl.appendChild(repliesContainer);
        }
        
        // Add event listener for reply button
        setTimeout(() => {
            const replyBtn = commentEl.querySelector('.reply-btn');
            if (replyBtn) {
                replyBtn.addEventListener('click', function() {
                    const commentId = this.getAttribute('data-comment-id');
                    const commenterName = this.getAttribute('data-commenter-name');
                    handleReplyClick(commentId, commenterName);
                });
            }
        }, 0);
        
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