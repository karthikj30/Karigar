// static/js/chat.js
// Handles chat UI and API calls for user-to-user chat

// Get current user and chat partner from URL
const currentUser = localStorage.getItem('karigar_user_email');
const urlParams = new URLSearchParams(window.location.search);
const chatWith = urlParams.get('user'); // email of the user to chat with

const chatWithDisplay = document.getElementById('chatWith');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

// Set chat header
if (chatWithDisplay && chatWith) {
    chatWithDisplay.innerHTML = `<i class="fas fa-comments me-2"></i>Chat with <span class="text-gradient">${chatWith}</span>`;
}

// Fetch and display chat history
async function loadChatHistory() {
    if (!currentUser || !chatWith) return;
    try {
        const res = await fetch(`/api/chat/messages?user1=${encodeURIComponent(currentUser)}&user2=${encodeURIComponent(chatWith)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
            chatMessages.innerHTML = '';
            data.messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = 'chat-bubble ' + (msg.sender === currentUser ? 'me ms-auto mb-2' : 'them me-0 mb-2');
                bubble.textContent = msg.text;
                chatMessages.appendChild(bubble);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            chatMessages.innerHTML = '<div class="text-center text-muted">No messages yet.</div>';
        }
    } catch (err) {
        chatMessages.innerHTML = '<div class="alert alert-danger">Failed to load chat.</div>';
    }
}

// Send message
if (chatForm) {
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        if (!chatWith) {
            alert('Cannot send message: chat partner not found. Please return to the profile and try again.');
            return;
        }
        // Debug log to check all fields before sending
        console.log('Sending chat message:', {
            sender: currentUser,
            receiver: chatWith,
            text
        });
        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: currentUser, receiver: chatWith, text })
            });
            const data = await res.json();
            if (data.success) {
                chatInput.value = '';
                loadChatHistory();
            }
        } catch (err) {
            alert('Failed to send message.');
        }
    });
}

// Poll for new messages every 3 seconds
setInterval(loadChatHistory, 3000);

// Initial load
loadChatHistory();
