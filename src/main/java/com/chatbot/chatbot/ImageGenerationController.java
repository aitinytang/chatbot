package com.chatbot.chatbot;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.langchain4j.data.image.Image;
import dev.langchain4j.model.azure.AzureOpenAiImageModel;
import dev.langchain4j.model.output.Response;

@RestController
@RequestMapping("/api")
public class ImageGenerationController {
    @PostMapping("/generate-image")
    public ResponseEntity<Map<String, String>> generateImage(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        System.out.println(prompt);
        try {
            AzureOpenAiImageModel model = AzureOpenAiImageModel.builder()
                    .apiKey(System.getenv("AZURE_OPENAI_DALLE_KEY"))
                    .endpoint(System.getenv("AZURE_OPENAI_DALLE_ENDPOINT"))
                    .deploymentName(System.getenv("AZURE_OPENAI_DALLE_DEPLOYMENT_NAME"))
                    .logRequestsAndResponses(true)
                    .build();

            Response<Image> response = model.generate(prompt);

            System.out.println(response.toString());

            Image image = response.content();

            System.out.println("The remote image is here:" + image.url());

            Map<String, String> result = new HashMap<>();
            result.put("imageUrl", image.url().toString());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // TODO: handle exception
            e.printStackTrace();
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}