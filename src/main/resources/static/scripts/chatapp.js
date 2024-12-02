import ChatManager from './chat.js';
import SpeechManager from './speech.js';
import ImageGen from './image_gen.js';

class App {
    constructor() {
        this.chatManager = new ChatManager();
        this.speechManager = new SpeechManager(this.chatManager);
        this.ImageGen = new ImageGen(this.chatManager);
    }

    initialize() {
        // Initialize any global app state
        
        // Modified initialization approach
        document.addEventListener('DOMContentLoaded', () => {
            // Essential initialization for basic chat functionality
            this.chatManager.loadConversationHistory();
            this.chatManager.initializeSidebar();

            // Defer conversation loading
            setTimeout(() => {
                const savedConversations = Object.keys(this.chatManager.conversationHistory);
                if (savedConversations.length > 0) {
                    console.log('savedConversations.length > 0');
                    currentMemoryId = savedConversations[0];
                    messages = this.chatManager.conversationHistory[this.chatManager.currentMemoryId];
                    this.chatManager.renderMessages();
                } else {
                    console.log('init createNewConversation');
                    this.chatManager.createNewConversation();
                }
            }, 10);

            // Initialize speech recognition after initial render
            const initSpeechAfterRender = () => {
                this.speechManager.initializeRecognizer();
            };

            // Use requestIdleCallback if available, otherwise setTimeout
            if ('requestIdleCallback' in window) {
                requestIdleCallback(initSpeechAfterRender);
            } else {
                setTimeout(initSpeechAfterRender, 100);
            }
        });

        document.getElementById('sidebarToggle').addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('unfold');
            document.querySelector('.new-chat-btn').classList.toggle('unfold');
            document.querySelector('.chat-container').classList.toggle('unfold');
        });
    }
}

// Initialize the application
const app = new App();
app.initialize();

// Expose necessary functions to global scope if needed
window.app = app;