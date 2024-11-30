package com.chatbot.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.azure.AzureOpenAiChatModel;
import dev.langchain4j.model.azure.AzureOpenAiImageModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.UserMessage;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class ChatApp {
    Assistant assistant;
    AzureOpenAiImageModel imgModel;

    interface Assistant  {
        String chat(@MemoryId int memoryId, @UserMessage String message);
    }

    @PostConstruct
    public void initModel() {
        AzureOpenAiChatModel chatModel = AzureOpenAiChatModel.builder()
                .apiKey(System.getenv("AZURE_OPENAI_KEY"))
                .endpoint(System.getenv("AZURE_OPENAI_ENDPOINT"))
                .deploymentName(System.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"))
                .temperature(0.3)
                .logRequestsAndResponses(true)
                .build();
        assistant = AiServices.builder(Assistant.class)
            .chatLanguageModel(chatModel)
            .chatMemoryProvider(memoryId -> MessageWindowChatMemory.withMaxMessages(10))
            .build();

        imgModel = AzureOpenAiImageModel.builder()
                    .apiKey(System.getenv("AZURE_OPENAI_DALLE_KEY"))
                    .endpoint(System.getenv("AZURE_OPENAI_DALLE_ENDPOINT"))
                    .deploymentName(System.getenv("AZURE_OPENAI_DALLE_DEPLOYMENT_NAME"))
                    .logRequestsAndResponses(true)
                    .build();
    }

    public Assistant getAssistant() {
        return assistant;
    }

    public AzureOpenAiImageModel getImgModel() {
        return imgModel;
    }

    public static void main(String[] args) {
        ChatApp app = new ChatApp();
        app.initModel();
        SpringApplication.run(ChatApp.class, args);
    }
}