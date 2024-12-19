package com.foxyclan.jar;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import io.micrometer.common.lang.NonNull;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Préfixe des messages envoyés au client
        config.setApplicationDestinationPrefixes("/app"); // Préfixe des messages envoyés au serveur
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/nft-progress")
            .setAllowedOrigins("http://localhost:4200") // Remplacez "*" par le domaine spécifique
            .withSockJS(); // Active le fallback SockJS pour les connexions WebSocket
}

    
}
