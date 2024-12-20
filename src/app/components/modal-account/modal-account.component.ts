import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { Subscription, catchError, combineLatest, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { HttpClient } from '@angular/common/http';
import { log } from 'console';

@Component({
  selector: 'app-modal-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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

  balances: { symbol: string, balance: string, balanceConverted: number }[] = [];
  tokens: number[] = [];
  adnData: { [key: number]: string } = {}; // Stockage des ADN
  transferEvents: any[] = [];

  constructor(private web3Service: Web3Service, private exchangeRateService: ExchangeRateService, private http: HttpClient) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription = combineLatest([
      this.web3Service.networkId$,
      this.web3Service.selectedWallet$
    ]).subscribe(([networkId, selectedWallet, ]) => {
      this.networkId = networkId;
      this.selectedWallet = selectedWallet;
      
      this.loadBalance().then(balances => {
        this.balances = balances;
      }).catch((error) => {
        console.error("Error loading balances:", error);
      });
      this.tokenOfOwnerByIndex();
      this.loadTransferEvents();
      //this.fetchAllAdn();
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

  
  async loadBalance(): Promise<{ symbol: string, balance: string, balanceConverted: number }[]> {
    const balances: { symbol: string, balance: string, balanceConverted: number }[] = [];
  
    try {
      const symbols: Array<'ETH' | 'WETH' | 'USDT' | 'USDC'> = ['ETH', 'WETH', 'USDT', 'USDC'];
      for (const symbol of symbols) {
        const balance = await this.web3Service.getBalance(symbol);
        const balanceConverted = await this.exchangeRateService.convertToUsd(Number(balance), symbol);
        balances.push({ symbol, balance, balanceConverted });
      }
      return this.sortBalances(balances);
    } catch (error) {
      //console.error("Error loading balances:", error);
      return this.sortBalances(balances);
      throw error;
    }
  }
  

  convertBalance(balances: { symbol: string, balance: string, balanceConverted: number }) {
    if(!balances) return ["Loading ..."];
    const balanceStr = balances.balance;
    const balanceConverted = balances.balanceConverted;

    let formattedNumber = (Math.floor(parseFloat(balanceStr) * 1000) / 1000).toString();
    if(parseFloat(balanceStr) > 0 && parseFloat(balanceStr) < 0.001) formattedNumber = "< 0.001 ";
    if(formattedNumber === "0.000") formattedNumber = "0";

    let formattedBalanceConvertedStr = (Math.floor(balanceConverted * 100) / 100).toString();
    if(balanceConverted > 0 && balanceConverted < 0.01) formattedBalanceConvertedStr = "< 0.01";
    if(formattedBalanceConvertedStr === "0.000") formattedBalanceConvertedStr = "0";

    return [formattedNumber, balances.symbol, formattedBalanceConvertedStr + " $"];
  }


  sortBalances(balances: { symbol: string, balance: string, balanceConverted: number }[]) {
    const sortedBalances = balances
      .map(item => ({
        ...item,
        balanceConverted: item.balanceConverted
      }))
      .sort((a, b) => b.balanceConverted - a.balanceConverted)
      .map(item => ({
        ...item,
        balance: item.balance.toString()
      }));
  
    return sortedBalances;
  }


  async tokenOfOwnerByIndex() {
    try {
      const result = await this.web3Service.tokenOfOwnerByIndex(this.walletAddress);
      this.tokens = result;
    } catch (error) {
      console.error("Balance error:", error);
    }
  }

  loadTransferEvents(): void {
    this.web3Service.getContractTransactions().then(events => {
      this.transferEvents = events;
    }).catch(error => {
      console.error('Error loading Transfer events:', error);
    });
  }

  async fetchAdn(tokenId: number): Promise<string> {
    console.log('yo')
    const url = `https://foxyclan.s3.filebase.com/${tokenId}.json`;
    console.log("1")
    try {
      const data: any = await firstValueFrom(this.http.get<any>(url)); // Récupère les données
      console.log("2")
      return data.DNA; // Accès direct au champ "DNA"
    } catch (error) {
      console.error(`Failed to fetch data for token ${tokenId}`, error);
      return 'Error'; // Retourne une valeur par défaut en cas d'erreur
    }
  }
  

  async fetchAllAdn(): Promise<void> {
    console.log("hey")
    for (const tokenId of this.tokens) {
      try {
        const dna = await this.fetchAdn(tokenId);
        dna ? this.adnData[tokenId] = dna : this.adnData[tokenId] = "0";
      } catch (error) {
        console.error(`Error fetching DNA for token ${tokenId}:`, error);
        this.adnData[tokenId] = 'Error';
      }
    }
  }
  
  

}
