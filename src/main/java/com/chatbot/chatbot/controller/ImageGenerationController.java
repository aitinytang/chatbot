package com.chatbot.chatbot.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatbot.chatbot.ChatApp;

import dev.langchain4j.data.image.Image;
import dev.langchain4j.model.azure.AzureOpenAiImageModel;
import dev.langchain4j.model.output.Response;

@RestController
@RequestMapping("/api")
public class ImageGenerationController {
    private final AzureOpenAiImageModel imgModel;

    public ImageGenerationController(ChatApp chatbotApplication) {
        this.imgModel = chatbotApplication.getImgModel();
    }
   
    @PostMapping("/generate-image")
    public ResponseEntity<Map<String, String>> generateImage(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        try {
            Response<Image> response = this.imgModel.generate(prompt);
            Image image = response.content();

            Map<String, String> result = new HashMap<>();
            result.put("imageUrl", image.url().toString());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}