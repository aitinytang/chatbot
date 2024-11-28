// Make sure this file is loaded after chatbot.js
(function() {
    // Reference functions from chatbot.js that we need
    const { recognizer, initializeRecognizer } = window.chatbot || {};
    
    // Function to toggle recording using Azure Speech SDK
    function toggleRecording() {
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
    function startRecognition() {
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

    // Expose functions to global scope
    window.audio = {
        toggleRecording
    };
})();