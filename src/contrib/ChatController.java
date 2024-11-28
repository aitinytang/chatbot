package com.chatbot.chatbot;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.chatbot.chatbot.ChatbotApplication.Assistant;

@RestController
public class ChatController {
    private final Assistant assistant;

    public ChatController(ChatbotApplication chatbotApplication) {
        this.assistant = chatbotApplication.getAssistant();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam(value = "input", defaultValue = "World") String input) {
        return assistant.chat(10010, input);
    }
}