package com.foxyclan.jar;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactRequest {
    private String address; // Adresse du wallet ou "Anonymous"
    
    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String section; // Peut être null si ce n'est pas un bug
}
