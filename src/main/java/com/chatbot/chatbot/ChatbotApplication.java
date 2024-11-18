package com.chatbot.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.langchain4j.model.azure.AzureOpenAiChatModel;
import dev.langchain4j.model.chat.ChatLanguageModel;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
@RestController
public class ChatbotApplication {
	// Declare the native method
    // public native String callLangChain(String input);

    // static {
    //     // Load the C++ library
    //     System.loadLibrary("LangChainLib");
    // }

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

	public static void main(String[] args) {
		//System.out.println(System.getProperty("java.library.path"));
		// LangChainCaller caller = new LangChainCaller();
        // String result = caller.callLangChain("Hello, LangChain!");
        // System.out.println("Result from LangChain: " + result);
        ChatbotApplication app = new ChatbotApplication();
        app.initModel();
		SpringApplication.run(ChatbotApplication.class, args);
	}
	@GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
        String response = model.generate(name);
        // System.out.println(response);
        return String.format("This is from Azure OpenAI's response: %s!", response);
    }
}
