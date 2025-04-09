package com.foxyclan.jar;

import jakarta.validation.constraints.NotBlank;

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

    public String getAddress() { return address; }
    public String getEmail() { return email; }
    public String getSubject() { return subject; }
    public String getDescription() { return description; }
    public String getSection() { return section; }

    public void setAddress(String address) { this.address = address; }
    public void setEmail(String email) { this.email = email; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setDescription(String description) { this.description = description; }
    public void setSection(String section) { this.section = section; }
}
