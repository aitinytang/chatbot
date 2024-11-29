class ImageGen {
    constructor(chatManager) {
        this.chatManager = chatManager;
        this.imgButton = document.getElementById('imageButton');
        this.dotsElement = document.getElementById('dots');
        this.userInput = document.getElementById('userInput');
        this.loadingIndicator = document.getElementById('loading');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.imgButton.addEventListener('click', () => this.generateImage());
    }

    async generateImage() {
        console.log('Generating image...');
        const prompt = this.userInput.value;
        if (!prompt.trim()) {
            alert('Please enter a description for the image you want to generate');
            return;
        }

        this.chatManager.appendMessage('user', prompt);
        this.userInput.value = '';
        this.userInput.focus();

        // Show loading state
        this.loadingIndicator.style.display = 'block';
        
        // Start animating the dots
        let dotInterval = setInterval(() => {
            let currentDots = this.dotsElement.textContent.length;
            if (currentDots < 3) {
                this.dotsElement.textContent += '.';
            } else {
                this.dotsElement.textContent = '';
            }
        }, 500);

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
            this.addImageToChat('bot', data.imageUrl);
        } catch (error) {
            console.error('Error generating image:', error);
            this.chatManager.appendMessage('bot', 'Sorry, I couldn\'t generate the image. Please try again.');
        } finally {
            // Hide loading indicator
            this.loadingIndicator.style.display = 'none';
            clearInterval(dotInterval);
            this.dotsElement.textContent = '...';            
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