import { API_ENDPOINTS } from './config.js';

class ChatManager {
    constructor() {
        this.messages = [];
        this.isActive = false; // Track if chat has been activated
        this.currentMemoryId = null; // Will be set by the server
        this.conversationHistory = {};

        this.chatHistory = document.getElementById('chatHistory');
        this.loadingIndicator = document.getElementById('loading');
        this.dotsElement = document.getElementById('dots');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.newConversationBtn = document.getElementById('newConversationBtn');
    
        this.recognizer = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());

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

    // Function to activate chat (change layout after first input)
    activateChat() {
        this.isActive = true;
        document.body.classList.add('active');
    }
    


    // Existing code...



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
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;

        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageContent.appendChild(timestamp);
        messageElement.appendChild(messageContent);
        this.chatHistory.appendChild(messageElement);

        // Store the message
        this.messages.push({ sender, message });

        // Save message to the current conversation's history
        if (this.currentMemoryId) {
            if (!this.conversationHistory[this.currentMemoryId]) {
                this.conversationHistory[this.currentMemoryId] = [];
            }
            this.conversationHistory[this.currentMemoryId].push({ sender, message });
            this.saveConversation();
        }

        // Activate chat if this is the first message
        if (!this.isActive && this.messages.length === 1) {
            this.activateChat();
        }

        // Scroll to the bottom
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // Function to send message with memoryId
    sendMessage() {
        const message = userInput.value.trim();
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
        fetch(`/api/chatlocal?input=${encodeURIComponent(message)}&memoryId=${this.currentMemoryId}`)
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
                this.activateChat();
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
            li.textContent = this.formatMemoryId(memoryId);
            li.dataset.memoryId = memoryId;
            li.addEventListener('click', () => {
                this.switchConversation(memoryId);
            });
            conversationList.appendChild(li);
        }
    }

    // Helper function to format memoryId for display (e.g., show date and last 4 chars)
    formatMemoryId(memoryId) {
        try {
            const uuid = memoryId.split('-');
            const timestamp = parseInt(uuid[1], 16); // Assuming UUID v1
            const date = new Date(timestamp);
            return `Conv-${date.toLocaleDateString()}-${memoryId.substring(memoryId.length - 4)}`;
        } catch (e) {
            return memoryId;
        }
    }

    // Function to switch to a selected conversation
    switchConversation(memoryId) {
        this.currentMemoryId = memoryId;
        this.messages = this.conversationHistory[memoryId] || [];
        this.renderMessages();
    }

    // Function to render messages from the current conversation
    renderMessages() {
        this.chatHistory.innerHTML = '';
        if (this.messages.length === 0 && this.currentMemoryId && this.conversationHistory[this.currentMemoryId]) {
            this.messages = this.conversationHistory[this.currentMemoryId];
        }
        this.messages.forEach(msg => {
            this.appendMessage(msg.sender, msg.message);
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