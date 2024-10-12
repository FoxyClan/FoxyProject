import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-account.component.html',
  styleUrl: './modal-account.component.css'
})

export class ModalAccount implements OnInit {

  @Input() walletAddress!: string;
  @Output() close = new EventEmitter();
  isAnimated: boolean = false;
  public networkId: string = '';
  private subscription: Subscription;

  constructor(private web3Service: Web3Service) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription = this.web3Service.networkId$.subscribe((networkId) => {
      this.networkId = networkId;
    });
  }

  showModal() {
    this.isAnimated = true;
  }

  closeModal() {
    this.isAnimated = false;
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }

  copyText(): void {
    navigator.clipboard.writeText(this.walletAddress).catch(() => {
      console.error("Unable to copy text");
    });
  }

  connectToEthereum() {
    this.web3Service.connectToEthereum();
  }

  disconnectWallet() {
    this.web3Service.disconnectWallet();
    this.closeModal();
  }

}
