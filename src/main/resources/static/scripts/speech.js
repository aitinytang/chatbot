import { AZURE_CONFIG } from './config.js';

class SpeechManager {
    constructor(chatManager) {
        this.recognizer = null;
        this.chatManager = chatManager;
        this.micButton = document.getElementById('micButton');
        this.loadingIndicator = document.getElementById('loading');
        this.userInput = document.getElementById('userInput');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.micButton.addEventListener('click', () => this.toggleRecording());
    }
    
    // Function to toggle recording using Azure Speech SDK
    toggleRecording() {
        if (this.recognizer) {
            console.log('Recognizer is defined:', this.recognizer);
            if (this.recognizer.isRecognizing) {
                this.recognizer.stopContinuousRecognitionAsync(() => {
                    console.log('Recognition stopped.');
                    this.micButton.classList.remove('recording');
                    this.micButton.textContent = '🎤';
                }, (err) => {
                    console.error('Error stopping recognition:', err);
                });
            } else {
                this.startRecognition();
            }
        } else {
            console.warn('Recognizer is undefined.');
        }
    }

    // Function to start recognition
    startRecognition() {
        if (!this.recognizer) {
            this.initializeRecognizer();
        }
        this.recognizer.startContinuousRecognitionAsync(
            () => {
                console.log('Recognition started.');
                this.micButton.classList.add('recording');
                this.micButton.textContent = '⏹️';
            },
            (err) => {
                console.error('Error starting recognition:', err);
            }
        );
    }

    // Initialize Speech Recognizer
    initializeRecognizer() {
        const speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(
            AZURE_CONFIG.speechKey,
            AZURE_CONFIG.region);

        speechConfig.speechRecognitionLanguage = 'en-US';
        try {
            this.recognizer = new window.SpeechSDK.SpeechRecognizer(speechConfig);
            console.log('Speech recognizer initialized successfully');
        } catch (error) {
            console.error('Error creating recognizer:', error);
        }

        this.recognizer.recognizing = (s, e) => {
            console.log(`RECOGNIZING: Text=${e.result.text}`);
        };
        this.recognizer.recognized = (s, e) => {
            if (e.result.reason === window.SpeechSDK.ResultReason.RecognizedSpeech) {
                this.chatManager.appendMessage('user', e.result.text);
                // Optionally, send the recognized text to your server or handle it directly
                // For example, sending to your existing sendMessage function:
                this.handleTranscribedText(e.result.text);
            } else {
                console.log('Speech not recognized.');
            }
        };
        this.recognizer.canceled = (s, e) => {
            console.log(`CANCELED: Reason=${e.reason}`);
            this.recognizer.close();
            this.recognizer = undefined;
            this.loadingIndicator.style.display = 'none';
        };
        this.recognizer.sessionStopped = (s, e) => {
            console.log('Session stopped.');
            this.recognizer.stopContinuousRecognitionAsync();
        };
    }

    // Function to handle transcribed text
    handleTranscribedText(text) {
        // Display user's message
        this.userInput.value = text;
        this.chatManager.sendMessage();
    }
}

export default SpeechManager;