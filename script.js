document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const appContainer = document.querySelector('.app-container');
    
    const createPostForm = document.getElementById('create-post-form');
    const postContent = document.getElementById('post-content');
    const postTag = document.getElementById('post-tag');
    const postsList = document.getElementById('posts-list');
    
    const channels = document.querySelectorAll('.channel-list li');
    const currentChannelTitle = document.getElementById('current-channel-title');
    
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const currentUsername = document.getElementById('current-username');
    const postAvatar = document.getElementById('post-avatar');
    const logoutBtn = document.getElementById('logout-btn');
    
    const myMemberItem = document.getElementById('my-member-item');
    const myMemberAvatar = document.getElementById('my-member-avatar');
    const myMemberName = document.getElementById('my-member-name');

    // State
    let currentUser = null;
    let currentChannel = 'Community Section';
    
    // Generate random avatar gradient
    const getAvatarGradient = (name) => {
        const colors = [
            ['#FF6B6B', '#FF8E53'],
            ['#4FACFE', '#00F2FE'],
            ['#43E97B', '#38F9D7'],
            ['#FA709A', '#FEE140'],
            ['#667EEA', '#764BA2'],
            ['#F77062', '#FE5196']
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        const [color1, color2] = colors[index];
        return `linear-gradient(135deg, ${color1}, ${color2})`;
    };

    // Get initial
    const getInitial = (name) => name.charAt(0).toUpperCase();

    // Format Time
    const formatTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Simple HTML escaper
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Login Handle
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        
        if (username.length > 0) {
            currentUser = username;
            
            // Setup User UI
            const initial = getInitial(username);
            const gradient = getAvatarGradient(username);
            
            currentUserAvatar.textContent = initial;
            currentUserAvatar.style.background = gradient;
            currentUsername.textContent = username;
            
            postAvatar.textContent = initial;
            postAvatar.style.background = gradient;

            myMemberAvatar.textContent = initial;
            myMemberAvatar.style.background = gradient;
            myMemberName.textContent = username;
            myMemberItem.style.display = 'flex';

            // Hide login, show app
            loginOverlay.classList.remove('active');
            setTimeout(() => {
                appContainer.classList.add('visible');
            }, 300);
        }
    });

    // Logout Handle
    logoutBtn.addEventListener('click', () => {
        appContainer.classList.remove('visible');
        setTimeout(() => {
            loginOverlay.classList.add('active');
            usernameInput.value = '';
            usernameInput.focus();
            currentUser = null;
            myMemberItem.style.display = 'none';
        }, 500);
    });

    // Channel Switching
    channels.forEach(channel => {
        channel.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            channels.forEach(c => c.classList.remove('active'));
            channel.classList.add('active');
            
            // Update header
            const channelName = channel.getAttribute('data-channel');
            currentChannel = channelName;
            currentChannelTitle.innerHTML = `<i class="fas fa-users"></i> ${channelName}`;
            
            // If we are filtering by channel, we could filter posts here
        });
    });

    // Post Creation
    createPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = postContent.value.trim();
        const tag = postTag.value.trim();
        
        if (text.length > 0 && tag.length > 0 && currentUser) {
            addPost(currentUser, text, tag);
            postContent.value = '';
            postTag.value = '';
        }
    });

    // Add Post to DOM
    function addPost(author, content, tag) {
        const postEl = document.createElement('div');
        postEl.className = `post-card glass-panel`;
        
        const initial = getInitial(author);
        const gradient = getAvatarGradient(author);

        postEl.innerHTML = `
            <div class="post-author-info">
                <div class="avatar" style="background: ${gradient}">${initial}</div>
                <div class="author-details">
                    <span class="author-name">${author}</span>
                    <span class="post-time">${formatTime()}</span>
                </div>
            </div>
            <div class="post-tag-badge"><i class="fas fa-tag"></i> ${escapeHTML(tag)}</div>
            <div class="post-content">
                ${escapeHTML(content)}
            </div>
            <div class="post-interact-bar">
                <button class="interact-btn like-btn"><i class="far fa-thumbs-up"></i> <span class="count">0</span></button>
                <button class="interact-btn dislike-btn"><i class="far fa-thumbs-down"></i> <span class="count">0</span></button>
                <button class="interact-btn reply-btn"><i class="far fa-comment"></i> Reply</button>
            </div>
            
            <div class="replies-section">
                <div class="replies-list"></div>
                <div class="reply-input-wrapper">
                    <input type="text" class="reply-input" placeholder="Write a reply..." autocomplete="off">
                    <button class="btn-icon send-reply-btn" style="background: var(--primary); color: white;"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        
        // Add at the top
        postsList.prepend(postEl);
        
        // Bind Interactions
        bindPostInteractions(postEl);
    }

    // Function to handle interactions for any post (existing or new)
    function bindPostInteractions(postEl) {
        const likeBtn = postEl.querySelector('.like-btn');
        const dislikeBtn = postEl.querySelector('.dislike-btn');
        const replyBtn = postEl.querySelector('.reply-btn');
        const repliesSection = postEl.querySelector('.replies-section');
        const repliesList = postEl.querySelector('.replies-list');
        const replyInput = postEl.querySelector('.reply-input');
        const sendReplyBtn = postEl.querySelector('.send-reply-btn');

        // Like Handle
        likeBtn.addEventListener('click', () => {
            const countSpan = likeBtn.querySelector('.count');
            if (likeBtn.classList.contains('active')) {
                likeBtn.classList.remove('active');
                countSpan.textContent = parseInt(countSpan.textContent) - 1;
            } else {
                likeBtn.classList.add('active');
                countSpan.textContent = parseInt(countSpan.textContent) + 1;
                // remove dislike if active
                if (dislikeBtn.classList.contains('active')) {
                    dislikeBtn.classList.remove('active');
                    dislikeBtn.querySelector('.count').textContent = parseInt(dislikeBtn.querySelector('.count').textContent) - 1;
                }
            }
        });

        // Dislike Handle
        dislikeBtn.addEventListener('click', () => {
            const countSpan = dislikeBtn.querySelector('.count');
            if (dislikeBtn.classList.contains('active')) {
                dislikeBtn.classList.remove('active');
                countSpan.textContent = parseInt(countSpan.textContent) - 1;
            } else {
                dislikeBtn.classList.add('active');
                countSpan.textContent = parseInt(countSpan.textContent) + 1;
                // remove like if active
                if (likeBtn.classList.contains('active')) {
                    likeBtn.classList.remove('active');
                    likeBtn.querySelector('.count').textContent = parseInt(likeBtn.querySelector('.count').textContent) - 1;
                }
            }
        });

        // Reply Toggle
        replyBtn.addEventListener('click', () => {
            repliesSection.classList.toggle('visible');
            if(repliesSection.classList.contains('visible')) {
                replyInput.focus();
            }
        });

        // Send Reply
        const handleSendReply = () => {
            const text = replyInput.value.trim();
            if(text.length > 0 && currentUser) {
                const replyEl = document.createElement('div');
                replyEl.className = 'reply-item';
                
                const initial = getInitial(currentUser);
                const gradient = getAvatarGradient(currentUser);

                replyEl.innerHTML = `
                    <div class="avatar" style="background: ${gradient}">${initial}</div>
                    <div class="reply-content">
                        <div class="reply-header">
                            <span class="reply-author">${currentUser}</span>
                            <span class="reply-time">${formatTime()}</span>
                        </div>
                        <div class="reply-text">${escapeHTML(text)}</div>
                    </div>
                `;
                
                repliesList.appendChild(replyEl);
                replyInput.value = '';
            }
        };

        sendReplyBtn.addEventListener('click', handleSendReply);
        replyInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') handleSendReply();
        });
    }

    // Bind interactions for default post
    const existingPosts = document.querySelectorAll('.post-card');
    existingPosts.forEach(bindPostInteractions);

    // Initialize
    usernameInput.focus();
});
