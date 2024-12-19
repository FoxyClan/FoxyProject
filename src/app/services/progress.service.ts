import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private stompClient: Client | null = null;

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    const socket = new SockJS('http://localhost:8080/nft-progress'); // WebSocket endpoint
    this.stompClient = new Client({
      webSocketFactory: () => socket as any, // Assurez-vous que SockJS est correctement utilisé ici
      debug: (str) => console.log(str),
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket connected');
    };

    this.stompClient.activate();
  }

  subscribeToProgress(sessionId: string, callback: (progress: number) => void): void {
    console.log(sessionId)
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe(`/topic/progress/${sessionId}`, (message: IMessage) => {
        console.log('Received message:', JSON.parse(message.body));
        const progress = JSON.parse(message.body);
        callback(progress);
      });
    }
  }
}
