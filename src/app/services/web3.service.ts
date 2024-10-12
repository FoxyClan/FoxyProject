import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';

interface WindowWithEthereum extends Window {
  ethereum: any;
  solana: any;
}

declare const window: WindowWithEthereum;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: Web3 | null = null;

  private networkIdSubject = new BehaviorSubject<string>('');
  networkId$ = this.networkIdSubject.asObservable();
  
  private walletAddressSubject = new BehaviorSubject<string>('');
  walletAddress$ = this.walletAddressSubject.asObservable();

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedSubject.asObservable();
  
  private installedWalletsSubject = new BehaviorSubject<string[]>([]);
  installedWallets$ = this.installedWalletsSubject.asObservable();

  public selectedWallet: string = "";
  private intervalId: any;


  constructor() {
    this.checkConnection();
  }


  async startCheckingConnection() {
    if(this.intervalId) return
    this.intervalId = setInterval(() => {
      if(!this.isConnectedSubject.value) this.detectInstalledWallets();
      if(this.isConnectedSubject.value) {console.log(this.isConnectedSubject.value); this.checkConnection();} //value ?
    }, 1500);
  }


  async detectInstalledWallets() {
    if (typeof window !== 'undefined') {
      try {
        const currentWallets = this.installedWalletsSubject.value;
        if(window.ethereum !== undefined && window.ethereum.isMetaMask) currentWallets.push("MetaMask")
        if(window.ethereum !== undefined && window.ethereum.isTrustWallet) currentWallets.push("TrustWallet")
        if(window.ethereum !== undefined && window.ethereum.providerMap !== undefined && typeof window.ethereum.providerMap.has("CoinbaseWallet")) currentWallets.push("CoinbaseWallet")
          this.installedWalletsSubject.next(currentWallets);
      } catch(error: any) {
        console.error('Error Detecting Wallets: ', error);
      }
      console.log('Portefeuilles Web3 installés:', this.installedWalletsSubject.value);
    }
  }

  async selectWallet(selectedWallet: string) {
    if(!this.installedWalletsSubject.value.includes(selectedWallet)) return
    this.connectWallet(selectedWallet);
  }


  async checkConnection() {
    this.detectInstalledWallets();
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && this.selectedWallet !== '') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        this.web3 = new Web3(window.ethereum);
        
        if (accounts.length > 0) {
          this.walletAddressSubject.next(accounts[0]);
          if(!this.isConnectedSubject) console.log('Connected to ', this.walletAddressSubject);
          this.isConnectedSubject.next(true);
          this.getNetworkId();
          this.startCheckingConnection();
        } else {
          this.walletAddressSubject.next('');
          this.isConnectedSubject.next(false);
        }
      } catch (error: any) {
        if (error.code === -32002) {
          console.error('Too many requests, please try again later');
        } else {
          console.error('Error checking wallet connection: ', error);
        }
      }
    } else {
      console.log('No web wallets found');
    }
  }


  async connectWallet(selectedWallet: string | null) {
    if (typeof window !== undefined && window.ethereum !== undefined) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts'});
        this.web3 = new Web3(window.ethereum);
        const provider = await window.ethereum.request({
          method: 'wallet_getProviders',
        });
        this.connectToEthereum();
        const accounts = await this.web3.eth.getAccounts();
        this.walletAddressSubject.next(accounts[0]);
        this.isConnectedSubject.next(true);
        //this.getNetworkId();
        console.log('Connected to wallet', this.walletAddressSubject.value);
        this.startCheckingConnection();
      } catch (error) {
        console.error('Error connecting to wallet', error);
      }
    } else {
      alert('No web wallets found');
    }
  }


  async disconnectWallet() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      this.walletAddressSubject.next('');
      this.networkIdSubject.next('');
      this.isConnectedSubject.next(false);
      clearInterval(this.intervalId);
      this.intervalId = null;
    } else {
      console.log('No web wallets found');
    }
  }


  async getNetworkId() {
    if (this.web3 && this.isConnectedSubject) {
      try {
        const networkId = (await this.web3.eth.net.getId()).toString();
        console.log(networkId)
        this.networkIdSubject.next(networkId);
      } catch (error) {
        console.error('Error getting network ID: ', error);
      }
    } else {
      console.error('Web3 instance not initialized');
    }   
  }


  async connectToEthereum() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && this.web3) {
      try {
        const networkId = (await this.web3.eth.net.getId()).toString();
        if (networkId !== "1") {
          await window.ethereum.request({
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

}
