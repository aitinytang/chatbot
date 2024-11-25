
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

        // Function to append messages
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

            // Activate chat if this is the first message
            if (!isActive && messages.length === 1) {
                activateChat();
            }

            // Scroll to the bottom
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }

        // Function to send message
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

            // Send message to the server (replace with actual API endpoint)
            fetch(`/chat?input=${encodeURIComponent(message)}`)
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
        const subscriptionKey = '9F0btoyLQCuLMK91tOLVs8LYDQBvavuyAxtgjIQyTTA0vdDvPvwOJQQJ99AKACYeBjFXJ3w3AAAYACOGFcjb';
        const serviceRegion = 'eastus'; // e.g., 'westus'

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

        // Initialize recognizer on page load
        window.onload = () => {
            initializeRecognizer();
        };