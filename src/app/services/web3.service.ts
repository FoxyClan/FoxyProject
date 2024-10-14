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
  
  private walletAddressSubject = new BehaviorSubject<string>('');
  walletAddress$ = this.walletAddressSubject.asObservable();

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedSubject.asObservable();
  
  private installedWalletsSubject = new BehaviorSubject<string[]>([]);
  installedWallets$ = this.installedWalletsSubject.asObservable();

  public selectedWallet: string = "";
  private intervalId: any;

  private sdk: any;
  private ethereumProvider: any;


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
      if(this.isConnectedSubject.value) {console.log(this.isConnectedSubject.value); this.checkConnection();} //value ?
    }, 1500);
  }


  detectInstalledWallets() {
    if (typeof window !== 'undefined') {
      try {
        const currentWallets = this.installedWalletsSubject.value;
        if(window.ethereum !== undefined && window.ethereum.isMetaMask) currentWallets.push("MetaMask")
        if(window.ethereum !== undefined && window.ethereum.isTrust) currentWallets.push("TrustWallet")
        if(typeof window.coinbaseWalletExtension !== 'undefined') currentWallets.push("CoinbaseWallet")
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
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        if(selectedWallet === 'CoinbaseWallet') {
          const CoinbaseWallet = new Coinbase({
            appName: 'FoxyCLan',
            appLogoUrl: 'BaseCharacter.jpeg',
            appChainIds: [1],
          });

          const ethereumCoinbase = CoinbaseWallet.makeWeb3Provider({
            options: 'all',
            keysUrl: 'https://mainnet.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35' //optionnel
          });

          this.web3 = new Web3(ethereumCoinbase);

          const accounts = await ethereumCoinbase.request({
            method: 'eth_requestAccounts'
          });
        }

        else if(selectedWallet === 'MetaMask') {
          const MMSDK = new MetaMaskSDK({
            dappMetadata: {
              name: "FoxyCLan",
              url: window.location.href,
            },
            infuraAPIKey: 'https://mainnet.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35',
          });
          setTimeout(() => {
            const ethereumMetamask = MMSDK.getProvider();
            if(ethereumMetamask) ethereumMetamask.request({ method: "eth_requestAccounts", params: [] })
          }, 0);
        }

        else if(selectedWallet === 'TrustWallet') {
          await window.trustWallet.request({ method: 'eth_requestAccounts'});
        }
        

        //
        /*
        await window.ethereum.request({ method: 'eth_requestAccounts'});
        this.web3 = new Web3(window.CoinbaseWalletProvider);
        const provider = await window.CoinbaseWalletProvider.request({
          method: 'eth_requestAccounts',
        });
        console.log(provider)
        this.connectToEthereum();
        const accounts = await this.web3.eth.getAccounts();
        this.walletAddressSubject.next(accounts[0]);
        this.isConnectedSubject.next(true);
        //this.getNetworkId();
        console.log('Connected to wallet', this.walletAddressSubject.value);
        this.startCheckingConnection();
        */
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
