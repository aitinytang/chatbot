import { AZURE_CONFIG } from './config.js';
import * as SpeechSDK from './microsoft.cognitiveservices.speech.sdk.bundle.js';

class SpeechManager {
    constructor(chatManager) {
        this.recognizer = null;
        this.chatManager = chatManager;
        this.micButton = document.getElementById('micButton');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.micButton.addEventListener('click', () => this.toggleRecording());
    }
    
    // Function to toggle recording using Azure Speech SDK
    toggleRecording() {
        const recognizer = window.chatbot.getRecognizer(); // Get current recognizer instance

        if (recognizer) {
            console.log('Recognizer is defined:', recognizer);
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
        } else {
            console.warn('Recognizer is undefined.');
        }
    }

    // Function to start recognition
    startRecognition() {
        const recognizer = window.chatbot.getRecognizer();
        if (!recognizer) {
            initializeRecognizer();
            recognizer = window.chatbot.getRecognizer();
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

    // Initialize Speech Recognizer
    initializeRecognizer() {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
            AZURE_CONFIG.subscriptionKey,
            AZURE_CONFIG.serviceRegion);

        speechConfig.speechRecognitionLanguage = 'en-US';
        try {
            recognizer = new SpeechSDK.SpeechRecognizer(speechConfig);
            console.log('Speech recognizer initialized successfully');
        } catch (error) {
            console.error('Error creating recognizer:', error);
        }

        recognizer.recognizing = (s, e) => {
            console.log(`RECOGNIZING: Text=${e.result.text}`);
        };
        recognizer.recognized = (s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
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
    handleTranscribedText(text) {
        // Display user's message
        userInput.value = text;
        sendMessage();
    }
}

export default SpeechManager;