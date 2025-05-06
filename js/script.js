document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    // IMPORTANT: Replace with your actual Firebase config when you set up your project
    const firebaseConfig = {
        apiKey: "AIzaSyCdTCTqETv6Hx8Rx56pa4K2IJbCJINkGnY",
        authDomain: "pibby-rig-comments.firebaseapp.com",
        projectId: "pibby-rig-comments",
        storageBucket: "pibby-rig-comments.firebasestorage.app",
        messagingSenderId: "472256862793",
        appId: "1:472256862793:web:6ef3079097475f3fbcfd98"
    };
    
    // Initialize Firebase
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
        // Load existing comments from Firebase
        loadComments();
        
        submitCommentBtn.addEventListener('click', function() {
            const name = commenterNameInput.value.trim();
            const comment = commentInput.value.trim();
            
            if (name && comment) {
                // Disable submit button temporarily to prevent double-submission
                submitCommentBtn.disabled = true;
                submitCommentBtn.textContent = 'Submitting...';
                
                // Get current date
                const now = new Date();
                const dateStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()}`;
                
                // Add comment to Firebase
                commentsCollection.add({
                    name: name,
                    content: comment,
                    date: dateStr,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()  // For sorting
                })
                .then(() => {
                    // Clear input fields
                    commenterNameInput.value = '';
                    commentInput.value = '';
                    
                    // Re-enable submit button
                    submitCommentBtn.disabled = false;
                    submitCommentBtn.textContent = 'Submit Comment';
                    
                    // Reload comments to show the new one
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
    
    // Function to load comments from Firebase
    function loadComments() {
        if (commentsContainer) {
            // Show loading indicator
            commentsContainer.innerHTML = '<div class="loading-comments">Loading comments...</div>';
            
            // Get comments from Firebase, ordered by timestamp (newest first)
            commentsCollection.orderBy('timestamp', 'desc').get()
                .then((querySnapshot) => {
                    // Clear container
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
    
    // Helper function to create comment element
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
    
    // Helper function to escape HTML to prevent XSS
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Editable Changelog functionality for easy customization (using localStorage)
    setupEditableChangelog();
    
    function setupEditableChangelog() {
        // Load changelog from localStorage if exists
        loadChangelog();
        
        // Add Edit/Save button for the changelog
        const changelogContainer = document.querySelector('.changelog-container');
        if (changelogContainer) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-changelog-btn';
            editBtn.textContent = 'Edit Changelog';
            editBtn.style.marginLeft = '10px';
            editBtn.style.backgroundColor = '#ff9800';
            editBtn.style.color = 'white';
            editBtn.style.border = 'none';
            editBtn.style.borderRadius = '4px';
            editBtn.style.padding = '6px 12px';
            editBtn.style.fontSize = '0.9rem';
            editBtn.style.cursor = 'pointer';
            
            changelogToggle.parentNode.insertBefore(editBtn, changelogToggle.nextSibling);
            
            editBtn.addEventListener('click', function() {
                const isEditing = editBtn.getAttribute('data-editing') === 'true';
                
                if (isEditing) {
                    // Save changes
                    saveChangelog();
                    editBtn.textContent = 'Edit Changelog';
                    editBtn.style.backgroundColor = '#ff9800';
                    editBtn.setAttribute('data-editing', 'false');
                    
                    // Make content non-editable
                    const changelogItems = document.querySelectorAll('.changelog-item');
                    changelogItems.forEach(item => {
                        item.contentEditable = 'false';
                        item.style.border = 'none';
                        item.style.padding = '0';
                    });
                    
                    // Hide add version button
                    const addVersionBtn = document.querySelector('.add-version-btn');
                    if (addVersionBtn) addVersionBtn.style.display = 'none';
                    
                } else {
                    // Enter edit mode
                    editBtn.textContent = 'Save Changes';
                    editBtn.style.backgroundColor = '#4CAF50';
                    editBtn.setAttribute('data-editing', 'true');
                    
                    // Make content editable
                    const changelogItems = document.querySelectorAll('.changelog-item');
                    changelogItems.forEach(item => {
                        item.contentEditable = 'true';
                        item.style.border = '1px dashed #ccc';
                        item.style.padding = '10px';
                    });
                    
                    // Add a button to add new version
                    if (!document.querySelector('.add-version-btn')) {
                        const addBtn = document.createElement('button');
                        addBtn.className = 'add-version-btn';
                        addBtn.textContent = 'Add New Version';
                        addBtn.style.display = 'block';
                        addBtn.style.margin = '10px auto';
                        addBtn.style.backgroundColor = '#4CAF50';
                        addBtn.style.color = 'white';
                        addBtn.style.border = 'none';
                        addBtn.style.borderRadius = '4px';
                        addBtn.style.padding = '8px 15px';
                        addBtn.style.fontSize = '0.9rem';
                        addBtn.style.cursor = 'pointer';
                        
                        changelogContent.appendChild(addBtn);
                        
                        addBtn.addEventListener('click', function() {
                            addNewVersion();
                        });
                    } else {
                        document.querySelector('.add-version-btn').style.display = 'block';
                    }
                }
            });
        }
    }
    
    function addNewVersion() {
        const now = new Date();
        const dateStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()}`;
        
        const newItem = document.createElement('div');
        newItem.className = 'changelog-item';
        newItem.contentEditable = 'true';
        newItem.style.border = '1px dashed #ccc';
        newItem.style.padding = '10px';
        newItem.innerHTML = `
            <div class="changelog-version">vX.X - ${dateStr}</div>
            <ul>
                <li>New feature...</li>
                <li>Bug fix...</li>
            </ul>
        `;
        
        // Add to beginning of changelog
        const changelogContent = document.querySelector('.changelog-content');
        const firstItem = changelogContent.querySelector('.changelog-item');
        changelogContent.insertBefore(newItem, firstItem);
    }
    
    function saveChangelog() {
        const changelogContent = document.querySelector('.changelog-content');
        if (changelogContent) {
            localStorage.setItem('pibbyChangelog', changelogContent.innerHTML);
        }
    }
    
    function loadChangelog() {
        const changelogContent = document.querySelector('.changelog-content');
        if (changelogContent) {
            const savedChangelog = localStorage.getItem('pibbyChangelog');
            if (savedChangelog) {
                changelogContent.innerHTML = savedChangelog;
            }
        }
    }
});