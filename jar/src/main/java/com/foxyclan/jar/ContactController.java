package com.foxyclan.jar;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/contact")
@CrossOrigin(origins = "http://localhost:4200") // Autorise les requêtes depuis Angular
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<Map<String, Object>> sendContactForm(@Valid @RequestBody ContactRequest contactRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            emailService.sendContactEmail(contactRequest);
            response.put("success", true);
            response.put("message", "Message sent successfully!");
            return ResponseEntity.ok(response);
        } catch (MessagingException e) {
            response.put("success", false);
            response.put("message", "Error sending email: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
