import { Injectable } from '@angular/core';
import Web3 from 'web3';
import Coinbase from '@coinbase/wallet-sdk';
import { MetaMaskSDK } from "@metamask/sdk"
import { BehaviorSubject } from 'rxjs';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: Web3 | null = null;

  private networkIdSubject = new BehaviorSubject<string>('');
  networkId$ = this.networkIdSubject.asObservable();
  
  private walletAddressSubject = new BehaviorSubject<any>('');
  walletAddress$ = this.walletAddressSubject.asObservable();

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedSubject.asObservable();
  
  private installedWalletsSubject = new BehaviorSubject<string[]>([]);
  installedWallets$ = this.installedWalletsSubject.asObservable();

  private selectedWalletSubject = new BehaviorSubject<string>('');
  selectedWallet$ = this.selectedWalletSubject.asObservable();

  private intervalId: any;
  private provider: any = null;
  private iMetaMask: number = 0;

  private wethContractAddress: string = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  private usdtContractAddress: string = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  private usdcContractAddress: string = '0xA0b86991c6218b36c1d19D4a2e9eb0cE3606EB48';

  private ContractABI = [
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "balance",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  constructor() {
    this.checkConnection();
  }

  handleProviderAnnouncement(event: any): void {
    const provider = event.detail.provider;
    console.log('Portefeuille détecté :', provider);
  }


  async startCheckingConnection() {
    if(this.intervalId) return
    this.intervalId = setInterval(() => {
      if(this.isConnectedSubject.value) this.checkConnection()
    }, 1500);
  }


  detectInstalledWallets() {
    if (typeof window === 'undefined') return
    try {
      const currentWallets: string[] = [];
      if(window.ethereum !== undefined && window.ethereum.isMetaMask) currentWallets.push("MetaMask")
      if(window.ethereum !== undefined && window.ethereum.isTrust) currentWallets.push("TrustWallet")
      if(typeof window.coinbaseWalletExtension !== 'undefined') currentWallets.push("CoinbaseWallet")
      this.installedWalletsSubject.next(currentWallets);
    } catch(error: any) {
      console.error('Error Detecting Wallets: ', error);
    }
  }


  async checkConnection() {
    if (typeof window !== 'undefined') {
      try {
        if(this.provider) {
          const accounts = await this.provider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            this.walletAddressSubject.next(accounts[0]);
            localStorage.setItem('userAddress', this.walletAddressSubject.value);
            localStorage.setItem('connectionTime', new Date().getTime().toString());
            this.getNetworkId();
            this.startCheckingConnection();
          } else {
            this.disconnectWallet();
          }    
        } else {
          this.detectInstalledWallets();
          const savedSelectedWallet = localStorage.getItem('selectedWallet');
          const connectionTime = localStorage.getItem('connectionTime');
          if (connectionTime && savedSelectedWallet && (new Date().getTime() - parseInt(connectionTime)) <= 60000) {
            this.connectWallet(savedSelectedWallet);
          }
        }
      } catch(error: any) {
          console.error('Error checking wallet connection: ', error);
      }
    } else {
      console.log('No web wallets found');
    }
  }


  async connectWallet(selectedWallet: string) {
    if(selectedWallet === '' || typeof selectedWallet !== 'string' || !this.installedWalletsSubject.value.includes(selectedWallet)) {
      console.error('Selected wallet is not installed or null');
      this.iMetaMask = 0;
      return
    }
    else if (typeof window !== 'undefined') {
      try {
        if(selectedWallet === 'CoinbaseWallet') {     // Coinbase Wallet
          const CoinbaseWallet = new Coinbase({
            appName: 'FoxyCLan',
            appLogoUrl: 'BaseCharacter.jpeg',
            appChainIds: [1],
          });
          this.provider = CoinbaseWallet.makeWeb3Provider({
            options: 'all',
            keysUrl: 'https://mainnet.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35'
          });
          this.web3 = new Web3(this.provider);
          await this.provider.request({
            method: 'eth_requestAccounts'
          });
          const accounts = await this.web3.eth.getAccounts();
          this.walletAddressSubject.next(accounts[0]);
          this.isConnectedSubject.next(true);
          this.selectedWalletSubject.next(selectedWallet);
          this.getNetworkId();
          localStorage.setItem('connectionTime', new Date().getTime().toString());
          localStorage.setItem('selectedWallet', this.selectedWalletSubject.value);
          this.startCheckingConnection();
        }

        else if(selectedWallet === 'MetaMask') {    // MetaMask Wallet
          const MMSDK = new MetaMaskSDK({
            dappMetadata: {
              name: "FoxyCLan",
              url: window.location.href,
            },
            infuraAPIKey: '16c76dc3448e4b96a41e908703fa0b35',
          });
          setTimeout(() => {
            if(this.iMetaMask === 0) {
              if(MMSDK.isInitialized() === false) {
                this.iMetaMask++;
                this.connectWallet("MetaMask");
                return
              }
            }
            this.iMetaMask = 0;
            this.provider = MMSDK.getProvider();
            if (this.provider) {
              this.provider.request({ method: "eth_requestAccounts", params: [] })
                .then(() => { 
                  this.web3 = new Web3(this.provider);
                  return this.web3.eth.getAccounts();
                })
                .then((accounts: string[]) => {
                  if (accounts.length > 0) {
                      this.walletAddressSubject.next(accounts[0]);
                      this.isConnectedSubject.next(true);
                      this.selectedWalletSubject.next(selectedWallet);
                      this.connectToEthereum();
                      this.getNetworkId();
                      localStorage.setItem('connectionTime', new Date().getTime().toString());
                      localStorage.setItem('selectedWallet', this.selectedWalletSubject.value);
                      this.startCheckingConnection();
                  } else {
                      console.error("No accounts found");
                  }
                })
                .catch((err: any) => {
                  if (err instanceof Error) {
                    console.error("Error recovering accounts:", err.message);
                  } else {
                    console.error("Unknown error:", err);
                  }
                });
              } else {
                console.error("Provider not found");
              }
          }, 0);
        }

        else if(selectedWallet === 'TrustWallet') {     // TrustWallet
          this.provider = window.trustWallet
          await this.provider.request({ method: 'eth_requestAccounts'});
          this.web3 = new Web3(this.provider)
          const accounts = await this.web3.eth.getAccounts();
          this.walletAddressSubject.next(accounts[0]);
          this.isConnectedSubject.next(true);
          this.selectedWalletSubject.next(selectedWallet);
          this.connectToEthereum();
          this.getNetworkId();
          localStorage.setItem('connectionTime', new Date().getTime().toString());
          localStorage.setItem('selectedWallet', this.selectedWalletSubject.value);
          this.startCheckingConnection();
        }
        else {
          console.error('Unistalled Wallet');
        }
      } catch (error) {
        this.iMetaMask = 0;
        console.error('Error connecting to wallet', error);
      }
    } else {
      alert('No web wallets found');
    }
  }


  async disconnectWallet() {
    this.walletAddressSubject.next('');
    this.networkIdSubject.next('');
    this.isConnectedSubject.next(false);
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.provider = null;
  }


  async getNetworkId() {
    if (this.web3 && this.isConnectedSubject) {
      try {
        const networkId = (await this.web3.eth.net.getId()).toString();
        this.networkIdSubject.next(networkId);
      } catch (error) {
        console.error('Error getting network ID: ', error);
      }
    } else {
      console.error('Web3 instance not initialized');
    }   
  }


  async connectToEthereum() {
    if (typeof window !== 'undefined' && this.web3) {
      try {
        const networkId = (await this.web3.eth.net.getId()).toString();
        if (networkId !== "1") {
          await this.provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x1' }],
          });
          console.log('Switched to Ethereum network.');
        }
      } catch (error) {
        console.error('Network change error: ', error);
      }
    } else {
      console.error('Web3 instance not initialized');
    }  
  }

  async getBalance(): Promise<string> {
    if (!this.web3) throw new Error("Web3 not initialized");
    if (!(await this.web3.eth.net.isListening())) throw new Error("Web3 connection is not active.");
    try {
        const balanceWei = await this.web3.eth.getBalance(this.walletAddressSubject.value);
        const balanceEther = this.web3.utils.fromWei(balanceWei, "ether").toString();
        return balanceEther;
    } catch (error) {
        console.error("Error fetching ETH balance:", error);
        throw error;
    }
  }

  async getWethBalance(): Promise<string> {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.ContractABI, this.wethContractAddress);
    try {
      const balanceWei: string = await contract.methods['balanceOf'](this.walletAddressSubject.value).call();
      const balanceWeth = this.web3.utils.fromWei(balanceWei, 'ether').toString();
      return balanceWeth;
    } catch (error) {
      console.error('Error fetching WETH balance:', error);
      throw error;
    }
  }

  async getUsdtBalance(): Promise<string> {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.ContractABI, this.usdtContractAddress);
    try {
      const balanceWei: string = await contract.methods['balanceOf'](this.walletAddressSubject.value).call();
      const balanceUsdt = (parseInt(balanceWei) / Math.pow(10, 6)).toString(); // USDT uses 6 decimal places
      return balanceUsdt;
    } catch (error) {
      console.error('Error fetching USDT balance:', error);
      throw error;
    }
  }

  async getUsdcBalance(): Promise<string> {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.ContractABI, this.usdcContractAddress);
    try {
      const balanceWei: string = await contract.methods['balanceOf'](this.walletAddressSubject.value).call();
      const balanceUsdc = (parseInt(balanceWei) / Math.pow(10, 6)).toString(); // USDC uses 6 decimal places
      return balanceUsdc;
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      throw error;
    }
}




}
