import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { Subscription, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-modal-account',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './modal-account.component.html',
  styleUrl: './modal-account.component.css'
})

export class ModalAccount implements OnInit, OnDestroy {

  @Input() walletAddress!: string;
  @Output() close = new EventEmitter();
  isAnimated: boolean = false;
  public networkId: string = '';
  public selectedWallet: string = '';
  private subscription: Subscription;
  selectedOption: string = 'Token';
  balance: string | null = null;
  wethBalance: string | null = null;

  constructor(private web3Service: Web3Service) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription = combineLatest([
      this.web3Service.networkId$,
      this.web3Service.selectedWallet$
    ]).subscribe(([networkId, selectedWallet]) => {
      this.networkId = networkId;
      this.selectedWallet = selectedWallet;
      this.loadBalance();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  async connectToEthereum() {
    await this.web3Service.connectToEthereum();
    this.loadBalance();
  }

  disconnectWallet() {
    this.web3Service.disconnectWallet();
    this.closeModal();
  }

  select(option: string) {
    this.selectedOption = option;
  }

  
  loadBalance() {
    this.web3Service.getBalance().then((balance) => {
      this.balance = balance;
    }).catch((error) => {
      console.error("Error fetching ETH balance:", error);
    });
    this.web3Service.getWethBalance().then((balance) => {
      this.wethBalance = balance;
    }).catch((error) => {
      console.error("Error fetching WETH balance:", error);
    });
  }

  convertBalance(numberStr: string | null) {
    if(!numberStr) return "Loading ...";
    console.log(this.wethBalance)
    const formattedNumber = parseFloat(numberStr).toFixed(3);
    return formattedNumber + " ETH";
  }
}
