package com.foxyclan.jar;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contact")
@CrossOrigin(origins = "http://localhost:4200") // Autorise les requêtes depuis Angular
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<String> sendContactForm(@Valid @RequestBody ContactRequest contactRequest) {
        System.out.println("hey");
        try {
            emailService.sendContactEmail(contactRequest);
            return ResponseEntity.ok("Message sent successfully!");
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Error sending email: " + e.getMessage());
        }
    }
}

