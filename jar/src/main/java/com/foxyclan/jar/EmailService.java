package com.foxyclan.jar;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private final String toEmail = "foxyclan.contact@gmail.com"; // Adresse e-mail du support
    private final String fromEmail = "foxyclan.contact@gmail.com";

    public void sendContactEmail(ContactRequest contactRequest) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("New Contact Request - " + contactRequest.getSubject());
        helper.setText(buildEmailContent(contactRequest), true); // HTML content

        mailSender.send(message);
    }

    private String buildEmailContent(ContactRequest contactRequest) {
        return "<h2>New Contact Request</h2>" +
                "<p><strong>Wallet Address:</strong> " + contactRequest.getAddress() + "</p>" +
                "<p><strong>E-mail:</strong> " + contactRequest.getEmail() + "</p>" +
                "<p><strong>Subject:</strong> " + contactRequest.getSubject() + "</p>" +
                "<p><strong>Bug Section:</strong> " + (contactRequest.getSection() != null ? contactRequest.getSection() : "N/A") + "</p>" +
                "<p><strong>Description:</strong></p>" +
                "<p>" + contactRequest.getDescription() + "</p>";
    }
}

