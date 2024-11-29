import { AZURE_CONFIG } from './config.js';

class SpeechManager {
    constructor(chatManager) {
        this.recognizer = null;
        this.chatManager = chatManager;

        this.loadingIndicator = document.getElementById('loading');
        this.userInput = document.getElementById('userInput');
        this.speechStatus = document.getElementById('speechStatus');
        this.inputArea = document.querySelector('.input-area');
        this.realtimeMicButton = document.getElementById('realtimeMicButton');
        this.sendButton = document.getElementById('sendButton');
        this.imageButton = document.getElementById('imageButton');

        this.isRealtimeMode = false;
        this.isRecognizing = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.realtimeMicButton.addEventListener('click', () => this.toggleRealtimeRecording());
    }
    
    toggleRealtimeRecording() {
        if (this.recognizer) {
            if (this.isRecognizing) {
                this.stopRealtimeRecognition();
            } else {
                this.startRealtimeRecognition();
            }
        } else {
            this.initializeRealtimeRecognizer();
        }
    }

    startRealtimeRecognition() {
        this.isRealtimeMode = true;

        this.speechStatus.style.display = 'block';
        this.speechStatus.textContent = 'Listening...';
        this.userInput.style.display = 'none';
        this.sendButton.style.display = 'none';
        this.imageButton.style.display = 'none';

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
        this.speechStatus.textContent = 'Stoping...';

        this.recognizer.stopContinuousRecognitionAsync(
            () => {
                console.log('Realtime recognition stopped.');
                this.isRecognizing = false;
                this.realtimeMicButton.classList.remove('realtime');
                this.realtimeMicButton.textContent = '🎙️';
                this.isRealtimeMode = false;
                
                this.speechStatus.style.display = 'none';
                this.userInput.style.display = '';
                this.sendButton.style.display = '';
                this.imageButton.style.display = '';
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