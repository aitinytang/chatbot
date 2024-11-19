package com.chatbot.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import dev.langchain4j.model.azure.AzureOpenAiChatModel;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class ChatbotApplication {
    private AzureOpenAiChatModel model;

    @PostConstruct
    public void initModel() {
        model = AzureOpenAiChatModel.builder()
                .apiKey(System.getenv("AZURE_OPENAI_KEY"))
                .endpoint(System.getenv("AZURE_OPENAI_ENDPOINT"))
                .deploymentName(System.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"))
                .temperature(0.3)
                .logRequestsAndResponses(true)
                .build();
    }

    public AzureOpenAiChatModel getModel() {
        return model;
    }

    public static void main(String[] args) {
        ChatbotApplication app = new ChatbotApplication();
        app.initModel();
        SpringApplication.run(ChatbotApplication.class, args);
    }
}