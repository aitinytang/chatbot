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

        this.sm = 'init';
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.realtimeMicButton.addEventListener('click', () => this.toggleRealtimeRecording());
    }
    
    toggleRealtimeRecording() {
        console.log('Toggling realtime recording');
        if (this.recognizer) {
            if (this.sm === 'started') {
                console.log('Stopping realtime recognition');
                this.stopRealtimeRecognition();
            } else if (this.sm === 'init' || this.sm === 'stopped') {
                console.log('Starting realtime recognition');
                this.startRealtimeRecognition();
            } else if (this.sm === 'starting' || this.sm === 'stopping') {
                console.log('Please waitting...');
            }
        } else {
            console.log('Initializing recognizer');
            this.initializeRealtimeRecognizer();
        }
    }

    startRealtimeRecognition() {
        // Show "Preparing..." status first
        this.sm = 'starting';
        this.speechStatus.style.display = 'inline';
        this.speechStatus.textContent = 'Preparing...';
        this.speechStatus.classList.add('preparing');

        this.userInput.style.display = 'none';
        this.imageButton.style.display = 'none';

        this.recognizer.startContinuousRecognitionAsync(
            () => {
                console.log('Realtime recognition started');
                this.sm = 'started';
                this.realtimeMicButton.classList.add('realtime');
                this.realtimeMicButton.textContent = '⏺️';

                // Update to "Listening..." status with green color
                this.speechStatus.textContent = 'Listening...';
                this.speechStatus.classList.remove('preparing');
                this.speechStatus.classList.add('listening');
            },
            (err) => {
                console.error('Error starting realtime recognition:', err);
                this.sm = 'init';
            }
        );
    }

    stopRealtimeRecognition() {      
        this.sm = 'stopping';

        this.speechStatus.textContent = 'Stopping...';
        this.speechStatus.classList.remove('listening');
        this.speechStatus.classList.add('stopping');

        this.realtimeMicButton.classList.remove('realtime');
        this.realtimeMicButton.classList.add('stopping');

        this.recognizer.stopContinuousRecognitionAsync(
            () => {
                console.log('Realtime recognition stopped');
                this.sm = 'stopped';
                this.realtimeMicButton.classList.remove('stopping');
                this.realtimeMicButton.textContent = '🎙️';
                
                this.speechStatus.classList.remove('stopping');
                this.speechStatus.style.display = 'none';
                this.userInput.style.display = '';
                this.imageButton.style.display = '';
            },
            (err) => {
                console.error('Error stopping realtime recognition:', err);
                this.sm = 'init';
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