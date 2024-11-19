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

    @GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
        String response = model.generate(name);
        return String.format("This is from Azure OpenAI's response: %s!", response);
    }
}