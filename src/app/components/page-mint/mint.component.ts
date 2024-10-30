import { Component, OnInit } from '@angular/core';
import { NotConnectedModal } from '../modal-not-connected/not-connected.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Web3Service } from "../../services/web3.service";

@Component({
  selector: 'app-mint',
  standalone: true,
  imports: [NotConnectedModal,CommonModule],
  templateUrl: './mint.component.html',
  styleUrl: './mint.component.css'
})

export class MintComponent implements OnInit {
  private subscription: Subscription;
  private isConnected: boolean = false;

  constructor(private web3Service: Web3Service) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription = this.web3Service.isConnected$.subscribe((isConnected) => {
      this.isConnected = isConnected;
    });
  }

  getConnected() {
    return this.isConnected;
  }
}