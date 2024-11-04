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

  balances: { symbol: string, balance: string }[] = [];

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
      
      this.loadBalance().then(balances => {
        this.balances = balances;
      }).catch((error) => {
        console.error("Error loading balances:", error);
      });
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

  
  async loadBalance(): Promise<{ symbol: string, balance: string }[]> {
    let balances: { symbol: string, balance: string }[] = [];
    return Promise.all([
      this.web3Service.getBalance().then((balance) => {
          balances.push({ symbol: "ETH", balance: balance });
      }).catch((error) => {
          console.error("Error fetching ETH balance:", error);
      }),
      
      this.web3Service.getWethBalance().then((balance) => {
          balances.push({ symbol: "WETH", balance: balance });
      }).catch((error) => {
          console.error("Error fetching WETH balance:", error);
      }),

      this.web3Service.getUsdtBalance().then((balance) => {
        balances.push({ symbol: "USDT", balance: balance });
      }).catch((error) => {
        console.error("Error fetching USDT balance:", error);
      }),

      this.web3Service.getUsdcBalance().then((balance) => {
        balances.push({ symbol: "USDC", balance: balance });
      }).catch((error) => {
        console.error("Error fetching USDT balance:", error);
      })
    ]).then(() => {
        return this.sortBalances(balances);
    });
  }


  convertBalance(balances: { symbol: string, balance: string }) {
    if(!balances) return "Loading ...";
    const numberStr = balances.balance;
    const symbole = balances.symbol;
    if(parseFloat(numberStr) > 0 && parseFloat(numberStr) < 0.001) return ["< 0.001 ", symbole];
    let formattedNumber = (Math.floor(parseFloat(numberStr) * 1000) / 1000).toString();
    if(formattedNumber === "0.000") formattedNumber = "0";
    return [formattedNumber, symbole];
  }


  sortBalances(balances: { symbol: string, balance: string }[]) {
    const sortedBalances = balances
      .map(item => ({
        ...item,
        balance: parseFloat(item.balance)
      }))
      .sort((a, b) => b.balance - a.balance)
      .map(item => ({
        ...item,
        balance: item.balance.toString()
      }));
      return sortedBalances;
  }

}
