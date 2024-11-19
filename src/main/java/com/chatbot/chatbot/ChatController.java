package com.chatbot.chatbot;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import dev.langchain4j.model.azure.AzureOpenAiChatModel;

@RestController
public class ChatController {

    private final AzureOpenAiChatModel model;

    public ChatController(ChatbotApplication chatbotApplication) {
        this.model = chatbotApplication.getModel();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam(value = "input", defaultValue = "World") String input) {
        return model.generate(input);
    }
}