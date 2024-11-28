// Make sure this file is loaded after chatbot.js
(function() {
    // Reference functions from chatbot.js that we need
    const { recognizer, initializeRecognizer } = window.chatbot || {};
    
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

    // Expose functions to global scope
    window.audio = {
        toggleRecording
    };
})();