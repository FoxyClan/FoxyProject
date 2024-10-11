import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';

interface WindowWithEthereum extends Window {
  ethereum: any;
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

  private intervalId: any;

  constructor() {
    this.checkConnection();
  }

  startCheckingConnection() {
    if(this.intervalId) return
    this.intervalId = setInterval(() => {
      if(this.isConnectedSubject) {
        this.checkConnection();
      }
    }, 1500);
  }

  async checkConnection() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        this.web3 = new Web3(window.ethereum);
        if (accounts.length > 0) {
          this.walletAddressSubject.next(accounts[0]);
          if(!this.isConnectedSubject) console.log('Connected to ', this.walletAddressSubject);
          this.isConnectedSubject.next(true);
          this.startCheckingConnection();
          this.getNetworkId();
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

  async connectWallet() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts'});
        this.web3 = new Web3(window.ethereum);
        this.connectToEthereum();
        const accounts = await this.web3.eth.getAccounts();
        this.walletAddressSubject.next(accounts[0]);
        this.isConnectedSubject.next(true);
        this.getNetworkId();
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
