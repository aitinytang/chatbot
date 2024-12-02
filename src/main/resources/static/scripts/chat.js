import { API_ENDPOINTS } from './config.js';

class ChatManager {
    constructor() {
        this.messages = [];
        this.currentMemoryId = null; // Will be set by the server
        this.conversationHistory = {};

        this.chatHistory = document.getElementById('chatHistory');
        this.loadingIndicator = document.getElementById('loading');
        this.dotsElement = document.getElementById('dots');
        this.userInput = document.getElementById('userInput');
        this.newConversationBtn = document.getElementById('newConversationBtn');
    
        this.recognizer = null;

        this.initializeEventListeners();

        // Configure marked options for better list handling
        marked.setOptions({
            gfm: true,
            breaks: true,
            headerIds: false,
            mangle: false,
            sanitize: false,
            smartLists: true,
            smartypants: true
        });
    }

    initializeEventListeners() {
        // Enter key press
        this.userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        });

        // New conversation button
        this.newConversationBtn.addEventListener('click', () => {
            this.createNewConversation();
        });
    }

    // Function to save conversation history to localStorage
    saveConversation() {
        //localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    }

    // Function to load conversation history from localStorage
    loadConversationHistory() {
        const history = localStorage.getItem('conversationHistory');
        if (history) {
            Object.assign(this.conversationHistory, JSON.parse(history));
        }
    }

    // Function to append a message to the chat history
    async appendMessage(sender, message) {
        this.renderMessage(sender, message);
        this.storeMessage(sender, message);        
    }

    renderMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const htmlContent = marked.parse(message); // Convert Markdown to HTML
        messageContent.innerHTML = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: [
                'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'code', 'pre',
                'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'blockquote', 'hr', 'del', 'input', 'details', 'summary'
            ],
            ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'checked', 'type']
        });

        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageContent.appendChild(timestamp);
        messageElement.appendChild(messageContent);
        this.chatHistory.appendChild(messageElement);

        // Scroll to the bottom
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    storeMessage(sender, message) {
         // Store the message
         const timestamp = new Date().toISOString();
         this.messages.push({ sender, message, timestamp });

         // Save message to the current conversation's history
         if (this.currentMemoryId) {
             if (!this.conversationHistory[this.currentMemoryId]) {
                 this.conversationHistory[this.currentMemoryId] = [];
             }
             this.conversationHistory[this.currentMemoryId].push({ sender, message, timestamp });
             this.saveConversation();
         }
    }

    // Function to send message with memoryId
    sendMessage() {
        const message = this.userInput.value.trim();
        if (message === '') return;

        // Display user's message
        this.appendMessage('user', message);
        this.userInput.value = '';
        this.userInput.focus();

        // Show loading indicator
        this.loadingIndicator.style.display = 'block';

        // Start animating the dots
        let dotInterval = setInterval(() => {
            let currentDots = this.dotsElement.textContent.length;
            if (currentDots < 3) {
                this.dotsElement.textContent += '.';
            } else {
                this.dotsElement.textContent = '';
            }
        }, 500);

        // Send message to the server with memoryId
        fetch(`/api/chat?input=${encodeURIComponent(message)}&memoryId=${this.currentMemoryId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                // Hide loading indicator
                this.loadingIndicator.style.display = 'none';
                clearInterval(dotInterval);
                this.dotsElement.textContent = '...';
                this.appendMessage('bot', data);
            })
            .catch(error => {
                console.error('Error:', error);
                this.loadingIndicator.style.display = 'none';
                clearInterval(dotInterval);
                this.dotsElement.textContent = '...';
                this.appendMessage('bot', '😕 Sorry, something went wrong.');
            });
    }

    // Function to create a new conversation by calling the server-side API
    createNewConversation() {
        fetch('/api/createConversation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create a new conversation.');
                }
                return response.json();
            })
            .then(data => {
                this.currentMemoryId = data.memoryId;
                // Initialize conversation history for the new memoryId
                if (!this.conversationHistory[this.currentMemoryId]) {
                    this.conversationHistory[this.currentMemoryId] = [];
                }
                //console.log(currentMemoryId);
                this.messages = [];
                this.chatHistory.innerHTML = '';
                //this.activateChat();
                this.renderConversationList();
            })
            .catch(error => {
                console.error('Error creating new conversation:', error);
                alert('Failed to create a new conversation. Please try again.');
            });
    }

    // Function to render conversation list in the sidebar
    renderConversationList() {
        const conversationList = document.getElementById('conversationList');
        conversationList.innerHTML = '';

        for (const memoryId in this.conversationHistory) {
            const li = document.createElement('li');
            li.textContent = this.getConversationPreview(memoryId);
            li.dataset.memoryId = memoryId;
            li.addEventListener('click', () => {
                this.switchConversation(memoryId);
            });
            conversationList.appendChild(li);
        }
    }

    // Helper function to format memoryId for display (e.g., show date and last 4 chars)
    getConversationPreview(memoryId) {
        const conversation = this.conversationHistory[memoryId];
        if (!conversation || conversation.length === 0) {
            return 'New chat';
        }

        // Find first user message, or use first message if no user message exists
        const firstMessage = conversation.find(msg => msg.sender === 'user') || conversation[0];
        const preview = firstMessage.message.trim();

        // Truncate to 30 characters and add ellipsis if needed
        const truncateMsg = preview.length > 30 ? preview.substring(0, 30) + '...' : preview;

        const timestamp = new Date(firstMessage.timestamp);
        const optionsDate = { month: '2-digit', day: '2-digit' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

        const formattedDate = timestamp.toLocaleDateString('en-US', optionsDate);
        const formattedTime = timestamp.toLocaleTimeString('en-US', optionsTime);

        const formattedDateTime = `${formattedDate} ${formattedTime}`;
        return `${formattedDateTime} - ${truncateMsg}`;
    }

    // Function to switch to a selected conversation
    switchConversation(memoryId) {
        this.currentMemoryId = memoryId;
        this.messages = [...this.conversationHistory[memoryId] || []];
        this.renderMessages();
    }

    // Function to render messages from the current conversation
    renderMessages() {
        this.chatHistory.innerHTML = '';
        
        this.messages.forEach(msg => {
            this.renderMessage(msg.sender, msg.message);
        });
    }

    // Initialize sidebar functionalities
    initializeSidebar() {
        /* const newConversationBtn = document.getElementById('newConversationBtn');
        console.log('Initializing sidebar and attaching event listener');

        if (newConversationBtn) {
            newConversationBtn.addEventListener('click', () => {
                console.log('New Conversation button clicked');
                createNewConversation();
            });
        } else {
            console.error('newConversationBtn not found');
        }*/


        this.renderConversationList();
    }

    

}

export default ChatManager;