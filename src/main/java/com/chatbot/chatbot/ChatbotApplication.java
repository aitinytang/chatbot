package com.chatbot.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.azure.AzureOpenAiChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.UserMessage;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class ChatbotApplication {
    Assistant assistant;

    interface Assistant  {
        String chat(@MemoryId int memoryId, @UserMessage String message);
    }

    @PostConstruct
    public void initModel() {
        AzureOpenAiChatModel model = AzureOpenAiChatModel.builder()
                .apiKey(System.getenv("AZURE_OPENAI_KEY"))
                .endpoint(System.getenv("AZURE_OPENAI_ENDPOINT"))
                .deploymentName(System.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"))
                .temperature(0.3)
                .logRequestsAndResponses(true)
                .build();
        assistant = AiServices.builder(Assistant.class)
            .chatLanguageModel(model)
            .chatMemoryProvider(memoryId -> MessageWindowChatMemory.withMaxMessages(10))
            .build();
    }

    public Assistant getAssistant() {
        return assistant;
    }

    public static void main(String[] args) {
        ChatbotApplication app = new ChatbotApplication();
        app.initModel();
        SpringApplication.run(ChatbotApplication.class, args);
    }
}