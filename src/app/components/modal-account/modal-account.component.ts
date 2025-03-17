import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import axios from "axios";
import { FormsModule } from '@angular/forms';
import { CacheService } from '../../services/cache.service';
import { ModalCollection } from "../modal-collection/modal-collection.component";
import { UndiscoveredModal } from "../modal-undiscovered/modal-undiscovered.component";

interface Metadata {
  tokenId: number;
  image: string;
  DNA: string;
  name: string;
  description: string;
  attributes: Array<{
    value: string;
    trait_type: string;
  }>;
}

@Component({
  selector: 'app-modal-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ModalCollection,
    UndiscoveredModal
  ],
  templateUrl: './modal-account.component.html',
  styleUrl: './modal-account.component.css'
})

export class ModalAccount implements OnInit, OnDestroy {
  @Input() walletAddress!: string;
  @Output() close = new EventEmitter();

  owner: String = "";
  flipNumberOfTokens: number = 0;
  state: string = '';
  addresses: string[] = [];
  allowAddressesString: string = '';
  airdropAddressesString: string = '';
  allowNumberOfTokens: number = 0;
  reserve: number = 0;
  levelTokenId: number = 0;
  tokenPoints: number = 0;
  cacheVersion: string = '';

  isAnimated: boolean = false;
  public networkId: string = '';
  public selectedWallet: string = '';
  selectedOption: string = 'Token';
  showUndiscoveredModal: boolean = false;

  balances: { symbol: string, balance: string, balanceConverted: number }[] = [];
  tokenIds: number[] = [];
  tokens: { [key: number]: Metadata | null } = {};
  selectedNFT: Metadata | null = null;
  selectedNFTLevel: any = "Loading...";
  selectedNFTPoints: any = "Loading...";
  transferEvents: any[] = [];
  baseUri : string = 'https://foxyclan.s3.filebase.com/';
  isLoadingNFTs: boolean = true;

  showNFTModal: boolean = false;


  constructor(private web3Service: Web3Service, 
    private exchangeRateService: ExchangeRateService,
    private cacheService : CacheService,
    private router: Router  ) {
  }

  async ngOnInit() {
    this.cacheService.cacheVersion$.subscribe((version) => {
      this.cacheVersion = version;
    });
    this.web3Service.networkId$.subscribe((networkId) => {
      this.networkId = networkId;
    });
    this.web3Service.selectedWallet$.subscribe((selectedWallet) => {
      this.selectedWallet = selectedWallet;
    });
    await this.loadBalance();
    await this.tokenOfOwnerByIndex();
    await this.loadTransferEvents();
    await this.getOwner();
    await this.fetchMetadata();
  }

  ngOnDestroy() {
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

  closeUndiscoveredModal(isUndiscover: boolean = false) {
    this.showUndiscoveredModal = false;
    if(!isUndiscover) return
    this.router.navigate(['/profil'], { queryParams: { address: this.walletAddress } });
    this.closeModal();
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

  
  async loadBalance() {
    const balances: { symbol: string, balance: string, balanceConverted: number }[] = [];
    try {
      const symbols: Array<'ETH' | 'WETH' | 'USDT' | 'USDC'> = ['ETH', 'WETH', 'USDT', 'USDC'];
      for (const symbol of symbols) {
        const balance = await this.web3Service.getBalance(symbol);
        const balanceConverted = await this.exchangeRateService.convertToUsd(Number(balance), symbol);
        balances.push({ symbol, balance, balanceConverted });
      }
    } catch (error) {
      //console.error("Error loading balances:", error);
    } finally {
      this.balances = this.sortBalances(balances);
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

  getTotalBalanceInUsd(): number {
    return this.balances.reduce((total, balance) => total + balance.balanceConverted, 0);
  }
  


  async tokenOfOwnerByIndex() {
    try {
      const result = await this.web3Service.tokenOfOwnerByIndex(this.walletAddress);
      this.tokenIds = result;
    } catch (error) {
      console.error("Balance error:", error);
    }
  }

  async loadTransferEvents() {
    this.web3Service.getContractTransactions().then(events => {
      console.log(events)
      this.transferEvents = events;
    }).catch(error => {
      console.error('Error loading Transfer events:', error);
    });
  }

  formatTokenIds(tokenIds: number[]): string {
    return tokenIds.map(id => `#${id}`).join(", ");
  }

  

  async fetchMetadata(): Promise<void> {
    this.isLoadingNFTs = true;
    for (const tokenId of this.tokenIds) {
      try {
        const url = this.baseUri + tokenId + '.json';
        const response = await axios.get<Metadata>(url + `?t=${this.cacheVersion}`);
        this.tokens[tokenId] = response.data;
        this.tokens[tokenId].tokenId = tokenId;
      } catch (error) {
        console.error(`Failed to fetch data for token ${tokenId} : `, error);
        this.tokens[tokenId] = null;
      }
    }
    this.isLoadingNFTs = false;
  }

  /* NFT VIEW */

  async selectNFT(tokenId: number) {
    this.selectedNFT = this.tokens[tokenId] ?? null;
    this.selectedNFTLevel = await this.level(tokenId);
    this.selectedNFTPoints = await this.getTokenPoints(tokenId);
  }

  closeNFTView() {
    this.selectedNFT = null;
  }

  openNFTModal() {
    if(this.selectedNFT?.image == 'https://foxyclan.s3.filebase.com/undiscovered.png') this.showUndiscoveredModal = true;
    else this.showNFTModal = true;
  }

  closeNFTModal(closeAll?: boolean | void) {
    this.showNFTModal = false;
    if(closeAll) this.closeModal();
  }


  /* PALETTE */
  

  async flipSale(flipNumberOfTokens: number, state: boolean) {
    try {
      const result = await this.web3Service.flipPublicSaleState(flipNumberOfTokens, state);
      console.log("FlipPublicSale successful");
    } catch (error) {
      console.error("Fliping error:", error);
    }
  }

  async flipPrivateSaleState() {
    try {
      const result = await this.web3Service.flipPrivateSaleState();
      console.log("FlipPrivateSaleState successful");
    } catch (error) {
      console.error("Fliping error:", error);
    }
  }

  async flipAllowListState() {
    try {
      const result = await this.web3Service.flipAllowListState();
      console.log("FlipAllowListState successful");
    } catch (error) {
      console.error("Fliping error:", error);
    }
  }

  async balanceOf() {
    if (!this.walletAddress) {
       console.error("Wallet address not available");
       return;
    }
    try {
       const result = await this.web3Service.balanceOf(this.walletAddress);
       console.log("Balance:", Number(result));
    } catch (error) {
       console.error("Balance error:", error);
    }
  }

  async publicSaleIsActive() {
    try {
       const result = await this.web3Service.publicSaleIsActive();
       console.log("publicSaleIsActive:", Boolean(result))
    } catch (error) {
       console.error("publicSaleIsActive fail to fetch:", error);
    }
  }

  async privateSaleIsActive() {
    try {
       const result = await this.web3Service.privateSaleIsActive();
       console.log("privateSaleIsActive:", Boolean(result))
    } catch (error) {
       console.error("privateSaleIsActive fail to fetch:", error);
    }
  }

  async getOwner() {
    if(this.owner) return this.owner;
    try {
       const result = await this.web3Service.owner();
       this.owner = String(result);
       return
    } catch (error) {
       console.error("getOwner fail to fetch:", error);
       throw error;
    }
  }

  async airdrop() {
    try {
      this.addresses = JSON.parse(this.airdropAddressesString);
      const result = await this.web3Service.airdrop(this.addresses);
      console.log("airdrop success:", result)
    } catch (error) {
       console.error("airdrop fail:", error);
    }
  }

  async setAllowList(allowNumberOfTokens: number) {
    try {
      this.addresses = JSON.parse(this.allowAddressesString);
      const result = await this.web3Service.setAllowList(this.addresses, allowNumberOfTokens);
      console.log("setAllowList success:", result)
    } catch (error) {
       console.error("setAllowList fail:", error);
    }
  }

  async reserveFoxy(reserve: number) {
    try {
      const result = await this.web3Service.reserveFoxy(reserve);
      console.log("airdrop:", Boolean(result))
    } catch (error) {
       console.error("airdrop fail:", error);
    }
  }

  async setBaseUri() {
    try {
      const result = await this.web3Service.setBaseURI("https://foxyclan.s3.filebase.com/");
      console.log("setBaseUri successful:", result);
    } catch (error) {
      console.error("setBaseUri error:", error);
    }
  }

  async level(levelTokenId: number) {
    try {
       const result = await this.web3Service.level(levelTokenId);
       console.log("level:", Number(result))
       return Number(result);
    } catch (error) {
       console.error("level fail to fetch:", error);
       throw error;
    }
  }

  async getTokenPoints(tokenPoints: number) {
    try {
       const result = await this.web3Service.getTokenPoints(tokenPoints);
       console.log("FoxyPoints:", Number(result))
       return Number(result); 
    } catch (error) {
       console.error("TokenPoints fail to fetch:", error);
       throw error;
    }
  }

  async getUserPoints() {
    try {
       const result = await this.web3Service.getUserPoints();
       console.log("UserPoints:", Number(result))
    } catch (error) {
       console.error("UserPoints fail to fetch:", error);
    }
  }

  async allowListisActive() {
    try {
       const result = await this.web3Service.allowListisActive();
       console.log("allowListisActive:", Boolean(result))
    } catch (error) {
       console.error("privateSaleIsActive fail to fetch:", error);
    }
  }
  

}
