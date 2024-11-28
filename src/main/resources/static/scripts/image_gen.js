class ImageGen {

    async generateImage() {
        const prompt = document.getElementById('userInput').value;
        if (!prompt.trim()) {
            alert('Please enter a description for the image you want to generate');
            return;
        }

        // Show loading state
        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const data = await response.json();

            // Add the prompt and image to chat history
            appendMessage('user', prompt);
            addImageToChat('bot', data.imageUrl);

            // Clear input
            document.getElementById('userInput').value = '';

        } catch (error) {
            console.error('Error generating image:', error);
            appendMessage('bot', 'Sorry, I couldn\'t generate the image. Please try again.');
        } finally {
            loading.style.display = 'none';
        }
    }

    addImageToChat(sender, imageUrl) {
        const chatHistory = document.getElementById('chatHistory');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Generated image';
        img.loading = 'lazy';

        messageDiv.appendChild(img);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

export default ImageGen;