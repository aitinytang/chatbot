package com.chatbot.chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.nio.file.Files;
import java.io.IOException;

@RestController
@RequestMapping("/api")
public class AudioController {

    // Inject the upload directory from application.properties
    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping(value = "/audio", consumes = "multipart/form-data", produces = "application/json")
    public ResponseEntity<?> handleAudioUpload(@RequestParam("audio") MultipartFile audioFile) {
        // Validate file
        if (audioFile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No file uploaded.");
        }
        // Validate file type (e.g., allow only webm and mp3)
        String contentType = audioFile.getContentType();
        if (!("audio/webm".equals(contentType) || "audio/mpeg".equals(contentType))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unsupported file type.");
        }
        try {
            // Define the upload path
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

            // Create directories if they do not exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory at: " + uploadPath.toString());
            }

            // Sanitize and generate a unique file name
            String originalFilename = Paths.get(audioFile.getOriginalFilename()).getFileName().toString();
            String fileExtension = "";

            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                fileExtension = originalFilename.substring(dotIndex);
            }

            String sanitizedFilename = UUID.randomUUID().toString() + fileExtension;

            Path filePath = uploadPath.resolve(sanitizedFilename);

            // Save the file
            Files.write(filePath, audioFile.getBytes());

            // Log the saved file path
            //System.out.println("Audio file saved at: " + filePath.toString());

            // Respond with the file URL
            String fileUrl = "/uploads/" + sanitizedFilename;

            return ResponseEntity.ok().body(new AudioResponse("File uploaded successfully.", fileUrl));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error saving the file.");
        }
    }

       // Updated AudioResponse with two parameters
   static class AudioResponse {
    private String message;
    private String fileUrl;

    // Constructor accepting both message and fileUrl
    public AudioResponse(String message, String fileUrl) {
        this.message = message;
        this.fileUrl = fileUrl;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}
}