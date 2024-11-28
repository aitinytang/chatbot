
const chatHeader = document.getElementById('chatHeader');
const chatHistory = document.getElementById('chatHistory');
const loadingIndicator = document.getElementById('loading');
const dotsElement = document.getElementById('dots');
const userInput = document.getElementById('userInput');
const inputArea = document.querySelector('.input-area');
const micButton = document.getElementById('micButton');
let messages = [];
let isActive = false; // Track if chat has been activated
let recognizer;

// Function to handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}
// Function to activate chat (change layout after first input)
function activateChat() {
    isActive = true;
    document.body.classList.add('active');
}
// Azure Speech Service Configuration
const subscriptionKey = '1EwiFdhsTQJVuVOXHyCohbT749ZsmPhavnaHViMhykiXIqF7oym6JQQJ99AKAC4f1cMXJ3w3AAAYACOG2YBh';
const serviceRegion = 'westus'; // e.g., 'westus'
// Initialize Azure Speech SDK
const speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
speechConfig.speechRecognitionLanguage = 'en-US';

// Initialize Speech Recognizer
function initializeRecognizer() {
    recognizer = new window.SpeechSDK.SpeechRecognizer(speechConfig);
    recognizer.recognizing = (s, e) => {
        console.log(`RECOGNIZING: Text=${e.result.text}`);
    };
    recognizer.recognized = (s, e) => {
        if (e.result.reason === window.SpeechSDK.ResultReason.RecognizedSpeech) {
            appendMessage('user', e.result.text);
            // Optionally, send the recognized text to your server or handle it directly
            // For example, sending to your existing sendMessage function:
            handleTranscribedText(e.result.text);
        } else {
            console.log('Speech not recognized.');
        }
    };
    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        recognizer.close();
        recognizer = undefined;
        loadingIndicator.style.display = 'none';
    };
    recognizer.sessionStopped = (s, e) => {
        console.log('Session stopped.');
        recognizer.stopContinuousRecognitionAsync();
    };
}
// Function to handle transcribed text
function handleTranscribedText(text) {
    // Display user's message
    userInput.value = text;
    sendMessage();
}
// Function to toggle recording using Azure Speech SDK
window.toggleRecording = function() { // **Attached to window object**
    if (recognizer) {
        if (recognizer.isRecognizing) {
            recognizer.stopContinuousRecognitionAsync(() => {
                console.log('Recognition stopped.');
                micButton.classList.remove('recording');
                micButton.textContent = '🎤';
            }, (err) => {
                console.error('Error stopping recognition:', err);
            });
        } else {
            startRecognition();
        }
    }
}

// Function to start recognition
function startRecognition() {
    if (!recognizer) {
        initializeRecognizer();
    }
    recognizer.startContinuousRecognitionAsync(
        () => {
            console.log('Recognition started.');
            micButton.classList.add('recording');
            micButton.textContent = '⏹️';
        },
        (err) => {
            console.error('Error starting recognition:', err);
        }
    );
}


// Existing code...

// Initialize conversation-related variables
let currentMemoryId = null; // Will be set by the server
const conversationHistory = {};

// Function to save conversation history to localStorage
function saveConversation() {
    //localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
}

// Function to load conversation history from localStorage
function loadConversationHistory() {
    const history = localStorage.getItem('conversationHistory');
    if (history) {
        Object.assign(conversationHistory, JSON.parse(history));
    }
}

// Function to append a message to the chat history
function appendMessage(sender, message) {
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
    chatHistory.appendChild(messageElement);

    // Store the message
    messages.push({ sender, message });

    // Save message to the current conversation's history
    if (currentMemoryId) {
        if (!conversationHistory[currentMemoryId]) {
            conversationHistory[currentMemoryId] = [];
        }
        conversationHistory[currentMemoryId].push({ sender, message });
        saveConversation();
    }

    // Activate chat if this is the first message
    if (!isActive && messages.length === 1) {
        activateChat();
    }

    // Scroll to the bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Function to send message with memoryId
function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    // Display user's message
    appendMessage('user', message);
    userInput.value = '';
    userInput.focus();

    // Show loading indicator
    loadingIndicator.style.display = 'block';

    // Start animating the dots
    let dotInterval = setInterval(() => {
        let currentDots = dotsElement.textContent.length;
        if (currentDots < 3) {
            dotsElement.textContent += '.';
        } else {
            dotsElement.textContent = '';
        }
    }, 500);

    // Send message to the server with memoryId
    fetch(`/api/chatlocal?input=${encodeURIComponent(message)}&memoryId=${currentMemoryId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            clearInterval(dotInterval);
            dotsElement.textContent = '...';
            appendMessage('bot', data);
        })
        .catch(error => {
            console.error('Error:', error);
            loadingIndicator.style.display = 'none';
            clearInterval(dotInterval);
            dotsElement.textContent = '...';
            appendMessage('bot', '😕 Sorry, something went wrong.');
        });
}

// Function to create a new conversation by calling the server-side API
function createNewConversation() {
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
            currentMemoryId = data.memoryId;
            // Initialize conversation history for the new memoryId
            if (!conversationHistory[currentMemoryId]) {
                conversationHistory[currentMemoryId] = [];
            }
            //console.log(currentMemoryId);
            messages = [];
            chatHistory.innerHTML = '';
            activateChat();
            renderConversationList();
        })
        .catch(error => {
            console.error('Error creating new conversation:', error);
            alert('Failed to create a new conversation. Please try again.');
        });
}

// Function to render conversation list in the sidebar
function renderConversationList() {
    const conversationList = document.getElementById('conversationList');
    conversationList.innerHTML = '';

    for (const memoryId in conversationHistory) {
        const li = document.createElement('li');
        li.textContent = formatMemoryId(memoryId);
        li.dataset.memoryId = memoryId;
        li.addEventListener('click', () => {
            switchConversation(memoryId);
        });
        conversationList.appendChild(li);
    }
}

// Helper function to format memoryId for display (e.g., show date and last 4 chars)
function formatMemoryId(memoryId) {
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
function switchConversation(memoryId) {
    currentMemoryId = memoryId;
    messages = conversationHistory[memoryId] || [];
    renderMessages();
}

// Function to render messages from the current conversation
function renderMessages() {
    chatHistory.innerHTML = '';
    if (messages.length === 0 && currentMemoryId && conversationHistory[currentMemoryId]) {
        messages = conversationHistory[currentMemoryId];
    }
    messages.forEach(msg => {
        appendMessage(msg.sender, msg.message);
    });
}

// Initialize sidebar functionalities
function initializeSidebar() {
    const newConversationBtn = document.getElementById('newConversationBtn');
    console.log('Initializing sidebar and attaching event listener');

    if (newConversationBtn) {
        newConversationBtn.addEventListener('click', () => {
            console.log('New Conversation button clicked');
            createNewConversation();
        });
    } else {
        console.error('newConversationBtn not found');
    }


    renderConversationList();
}

// ... existing code ...

// Modified initialization approach
document.addEventListener('DOMContentLoaded', () => {
    // Essential initialization for basic chat functionality
    //loadConversationHistory();
    initializeSidebar();
    
    // Defer conversation loading
    setTimeout(() => {
        const savedConversations = Object.keys(conversationHistory);
        if (savedConversations.length > 0) {
            console.log('savedConversations.length > 0');
            currentMemoryId = savedConversations[0];
            messages = conversationHistory[currentMemoryId];
            renderMessages();
        } else {
            console.log('init createNewConversation');
            createNewConversation();
        }
    }, 10);

    // Initialize speech recognition after initial render
    const initSpeechAfterRender = () => {
        initializeRecognizer();
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initSpeechAfterRender);
    } else {
        setTimeout(initSpeechAfterRender, 100);
    }
});