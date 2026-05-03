document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const appContainer = document.querySelector('.app-container');
    
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesArea = document.getElementById('messages-area');
    
    const channels = document.querySelectorAll('.channel-list li');
    const currentChannelTitle = document.getElementById('current-channel-title');
    
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const currentUsername = document.getElementById('current-username');
    const logoutBtn = document.getElementById('logout-btn');
    
    const myMemberItem = document.getElementById('my-member-item');
    const myMemberAvatar = document.getElementById('my-member-avatar');
    const myMemberName = document.getElementById('my-member-name');

    // State
    let currentUser = null;
    let currentChannel = 'general';
    
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
        
        // Simple hash to pick consistent color for a name
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
            
            myMemberAvatar.textContent = initial;
            myMemberAvatar.style.background = gradient;
            myMemberName.textContent = username;
            myMemberItem.style.display = 'flex';

            // Hide login, show app
            loginOverlay.classList.remove('active');
            setTimeout(() => {
                appContainer.classList.add('visible');
                messageInput.focus();
                
                // Add system join message
                addMessage({
                    author: 'System',
                    text: `${username} just slid into the forum.`,
                    isSystem: true
                });
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
            currentChannelTitle.innerHTML = `<i class="fas fa-hashtag"></i> ${channelName}`;
            
            // Clear messages and add welcome
            messagesArea.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-comments"></i>
                    <h2>Welcome to #${channelName}</h2>
                    <p>This is the start of the #${channelName} community. Say hello!</p>
                </div>
            `;
            
            messageInput.placeholder = `Message #${channelName}...`;
            messageInput.focus();
        });
    });

    // Message Sending
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        
        if (text.length > 0 && currentUser) {
            addMessage({
                author: currentUser,
                text: text,
                isSystem: false
            });
            messageInput.value = '';
            
            // Simulate bot reply in some channels
            if (currentChannel === 'help' && Math.random() > 0.5) {
                setTimeout(() => {
                    addMessage({
                        author: 'System',
                        text: `Thanks for asking in #help-and-support, ${currentUser}. Someone will assist you shortly!`,
                        isAdmin: true
                    });
                }, 1000);
            }
        }
    });

    // Add Message to DOM
    function addMessage({ author, text, isSystem = false, isAdmin = false }) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isSystem ? 'system' : ''}`;
        
        const initial = getInitial(author);
        const gradient = author === 'System' 
            ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)' 
            : getAvatarGradient(author);

        const adminBadge = isAdmin || author === 'System' 
            ? '<span class="badge admin" style="margin-left: 8px;">Admin</span>' 
            : '';

        messageEl.innerHTML = `
            <div class="avatar" style="background: ${gradient}">${initial}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${author} ${adminBadge}</span>
                    <span class="message-time">${formatTime()}</span>
                </div>
                <div class="message-text">${escapeHTML(text)}</div>
            </div>
        `;
        
        messagesArea.appendChild(messageEl);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // Simple HTML escaper
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initialize
    usernameInput.focus();
});
