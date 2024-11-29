package com.chatbot.chatbot;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chatbot.chatbot.ChatbotApplication.Assistant;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class ConversationController {
    private final Assistant assistant;

    public ConversationController(ChatbotApplication chatbotApplication) {
        this.assistant = chatbotApplication.getAssistant();
    }

    // In-memory storage for conversations. Replace with a database or persistent storage in production.
    private Map<String, List<Message>> conversations = new ConcurrentHashMap<>();

    // Endpoint to create a new conversation
    @PostMapping("/createConversation")
    public ResponseEntity<CreateConversationResponse> createConversation() {
        Random random = new Random();
        int memId = random.nextInt();
        String memoryId = Integer.toString(memId);
        conversations.put(memoryId, new ArrayList<>());
        return ResponseEntity.ok(new CreateConversationResponse(memoryId));
    }

    // Endpoint to handle chat messages
    @GetMapping("/chat")
    public ResponseEntity<String> chat(@RequestParam String input, @RequestParam String memoryId) {
        // Validate memoryId
        if (!conversations.containsKey(memoryId)) {
            return ResponseEntity.badRequest().body("Invalid memoryId.");
        }

        // Add user message to conversation history
        Message userMessage = new Message("user", input);
        conversations.get(memoryId).add(userMessage);

        // Generate bot response (implement your actual logic here)
        String botResponse = processInput(input, memoryId);

        // Add bot response to conversation history
        Message botMessage = new Message("bot", botResponse);
        conversations.get(memoryId).add(botMessage);

        return ResponseEntity.ok(botResponse);
    }

    // Sample method to process input and generate a response
    private String processInput(String input, String memoryId) {
        // Implement your chatbot logic here. For demonstration, echoing the input.
        int memid = Integer.parseInt(memoryId);
        return assistant.chat(memid, input);
    }

    // Inner class to represent a message
    private static class Message {
        private String sender;
        private String message;

        public Message(String sender, String message) {
            this.sender = sender;
            this.message = message;
        }

        // Getters (optional)
        public String getSender() {
            return sender;
        }

        public String getMessage() {
            return message;
        }
    }

    // Inner class for the createConversation response
    private static class CreateConversationResponse {
        private String memoryId;

        public CreateConversationResponse(String memoryId) {
            this.memoryId = memoryId;
        }

        public String getMemoryId() {
            return memoryId;
        }

        public void setMemoryId(String memoryId) {
            this.memoryId = memoryId;
        }
    }
}