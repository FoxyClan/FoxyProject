package com.foxyclan.jar;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactRequest {
    @NotBlank(message = "Address is required")
    private String address; // Adresse du wallet ou "Anonymous"
    
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    private String section; // Peut être null si ce n'est pas un bug
}
