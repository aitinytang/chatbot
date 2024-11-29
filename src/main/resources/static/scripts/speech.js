import { AZURE_CONFIG } from './config.js';

class SpeechManager {
    constructor(chatManager) {
        this.recognizer = null;
        this.chatManager = chatManager;
        this.micButton = document.getElementById('micButton');
        this.loadingIndicator = document.getElementById('loading');
        this.userInput = document.getElementById('userInput');

        this.realtimeMicButton = document.getElementById('realtimeMicButton');
        this.isRealtimeMode = false;
        this.isRecognizing = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.micButton.addEventListener('click', () => this.toggleRecording());
        this.realtimeMicButton.addEventListener('click', () => this.toggleRealtimeRecording());
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

    // Add new method for realtime recording
    toggleRealtimeRecording() {
        console.log('regognizer is:', this.recognizer);
        if (this.recognizer) {
            console.log('regognizer isRecognizing:', this.recognizer.isRecognizing);
            console.log('regognizer isRealtimeMode:', this.recognizer.isRealtimeMode);
            if (this.isRecognizing) {
                console.log('Stopping realtime recognition.');
                this.stopRealtimeRecognition();
            } else {
                console.log('Starting realtime recognition.');
                this.startRealtimeRecognition();
            }
        } else {
            this.initializeRealtimeRecognizer();
        }
    }

    // Add new method for realtime recognition
    startRealtimeRecognition() {
        this.isRealtimeMode = true;
        this.recognizer.startContinuousRecognitionAsync(
            () => {
                console.log('Realtime recognition started.');
                this.isRecognizing = true;
                this.realtimeMicButton.classList.add('realtime');
                this.realtimeMicButton.textContent = '⏺️';
            },
            (err) => {
                console.error('Error starting realtime recognition:', err);
                this.isRecognizing = false;
            }
        );
    }

    stopRealtimeRecognition() {
        this.recognizer.stopContinuousRecognitionAsync(
            () => {
                console.log('Realtime recognition stopped.');
                this.isRecognizing = false;
                this.realtimeMicButton.classList.remove('realtime');
                this.realtimeMicButton.textContent = '🎙️';
                this.isRealtimeMode = false;
            },
            (err) => {
                console.error('Error stopping realtime recognition:', err);
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
                const recognizedText = e.result.text;
                if (this.isRealtimeMode) {
                    // For realtime mode, send each recognized segment immediately
                    this.handleTranscribedText(recognizedText);
                } else {
                    // Original behavior for normal mode
                    //this.chatManager.appendMessage('user', recognizedText);
                    this.handleTranscribedText(recognizedText);
                }
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

    // Add new method for handling realtime messages
    async sendRealtimeMessage(text) {
        fetch(`/api/chat?input=${encodeURIComponent(text)}&memoryId=${this.chatManager.currentMemoryId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error sending realtime message');
                }
                return response.text();
            })
            .then(data => {
                this.chatManager.appendMessage('bot', data);
            })
            .catch(error => {
                console.error('Error in realtime message processing:', error);
                this.appendMessage('bot', 'realtime speech recognition failed');
            });
    }
}

export default SpeechManager;