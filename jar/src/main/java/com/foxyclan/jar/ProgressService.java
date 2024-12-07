package com.foxyclan.jar;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProgressService {
    private final SimpMessagingTemplate messagingTemplate;

    public ProgressService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendProgress(String sessionId, int progress) {
        messagingTemplate.convertAndSend("/topic/progress/" + sessionId, progress);
    }
}
