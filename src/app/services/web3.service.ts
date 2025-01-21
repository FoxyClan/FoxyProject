import { Injectable } from '@angular/core';
import Web3, { EventLog } from 'web3';
import Coinbase from '@coinbase/wallet-sdk';
import { MetaMaskSDK } from "@metamask/sdk"
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

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

  private creatingNftLoadingSubject = new BehaviorSubject<boolean>(false);
  creatingNftLoading$ = this.creatingNftLoadingSubject.asObservable();

  private intervalId: any;
  private provider: any = null;
  private iMetaMask: number = 0;

  private wethContractAddress: string = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  private usdtContractAddress: string = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  private usdcContractAddress: string = '0xA0b86991c6218b36c1d19D4a2e9eb0cE3606EB48';

  private StableCoinContractABI = [
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

  private FoxyClanContractAddress = '0x33F9117e5775bAA696C647d50eaC8CCecbFA1795';

  private FoxyClanABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ERC721EnumerableForbiddenBatchMint",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC721IncorrectOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ERC721InsufficientApproval",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidOperator",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ERC721NonexistentToken",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "ERC721OutOfBoundsIndex",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_SUPPLY",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "allowListisActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "burnedTokenIds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "currentSaleMinted",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "level",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "maxPublicFoxyMint",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "privateFoxyPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "privateSaleIsActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "publicFoxyPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "publicSaleIsActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "saleMintLimit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "tokenByIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "tokenOfOwnerByIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "addresses",
          "type": "address[]"
        }
      ],
      "name": "airdrop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getTokenPoints",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getUserPoints",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "tokenIds",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "pointsToAdd",
          "type": "uint256"
        }
      ],
      "name": "addFoxyPointsToTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "maxMintAmount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "flipPublicSaleState",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "flipPrivateSaleState",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "setBaseURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "flipAllowListState",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "addresses",
          "type": "address[]"
        },
        {
          "internalType": "uint8",
          "name": "numAllowedToMint",
          "type": "uint8"
        }
      ],
      "name": "setAllowList",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        }
      ],
      "name": "numAvailableToMint",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "numberOfTokens",
          "type": "uint8"
        }
      ],
      "name": "mintAllowList",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "numberOfTokens",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "tokenId2",
          "type": "uint256"
        }
      ],
      "name": "merge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "n",
          "type": "uint256"
        }
      ],
      "name": "reserveFoxy",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
  private FoxyPrice = 0.0125;
  private PrivateSaleFoxyPrice = 0.0075;

  
  constructor() {
    this.checkConnection();
    this.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35'));
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
            appLogoUrl: 'FoxyLogo.jpeg',
            appChainIds: [1],
          });
          this.provider = CoinbaseWallet.makeWeb3Provider({
            options: 'all',
            //keysUrl: 'https://mainnet.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35'
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
                      //this.connectToEthereum();
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
    if (this.intervalId) clearInterval(this.intervalId);
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.provider = null;
    const connectionTime = localStorage.removeItem('connectionTime');
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

  async getBalance(symbol: 'ETH' | 'WETH' | 'USDT' | 'USDC'): Promise<string> {
    if (!this.web3) throw new Error("Web3 not initialized");
    if (symbol === 'ETH') {
      if (!(await this.web3.eth.net.isListening())) throw new Error("Web3 connection is not active.");
      try {
        const balanceWei = await this.web3.eth.getBalance(this.walletAddressSubject.value);
        return this.web3.utils.fromWei(balanceWei, "ether").toString();
      } catch (error) {
        console.error("Error fetching ETH balance:", error);
        throw error;
      }
    } else {
      let contractAddress: string;
  
      switch (symbol) {
        case 'WETH':
          contractAddress = this.wethContractAddress;
          break;
        case 'USDT':
          contractAddress = this.usdtContractAddress;
          break;
        case 'USDC':
          contractAddress = this.usdcContractAddress;
          break;
        default:
          throw new Error("Invalid symbol");
      }
  
      try {
        const contract = new this.web3.eth.Contract(this.StableCoinContractABI, contractAddress);
        const balanceWei: string = await contract.methods['balanceOf'](this.walletAddressSubject.value).call();
        let balance;
        if(symbol == 'USDT' || symbol == 'USDC') balance = (parseInt(balanceWei) / Math.pow(10, 6)).toString();
        else balance = this.web3.utils.fromWei(balanceWei, 'ether').toString();
        return balance;
      } catch (error) {
        //console.error('Error fetching ${symbol} balance:', error);
        throw error;
      }
    }
  }

  

  public async clearTmpDirectory() {
    const response = await axios.delete(`http://localhost:8080/clear-tmp`);
    return response;
  }


  // FUNCTION SMART CONTRACT


  public async Supply() {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const supply = await contract.methods['totalSupply']().call();
      return supply;
    } catch (error) {
      console.error("Minting failed:", error);
      throw error;
    }
  }

  public async airdrop(addresses: String[]) {
    if (!this.web3) throw new Error("Web3 not initialized");
    console.log(addresses)
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const result = await contract.methods['airdrop'](addresses).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async setAllowList(addresses: String[], numberOfTokens: number) {
    if (!this.web3) throw new Error("Web3 not initialized");
    console.log(addresses)
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const result = await contract.methods['setAllowList'](addresses, numberOfTokens).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async reserveFoxy(numberOfTokens: number) {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const result = await contract.methods['reserveFoxy'](numberOfTokens).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async publicSaleIsActive() {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const state = await contract.methods['publicSaleIsActive']().call();
      return state;
    } catch (error) {
      console.error("publicSaleIsActive fail to fetch:", error);
      throw error;
    }
  }

  public async privateSaleIsActive() {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const state = await contract.methods['privateSaleIsActive']().call();
      return state;
    } catch (error) {
      console.error("privateSaleIsActive fail to fetch:", error);
      throw error;
    }
  }

  public async level(tokenId: number) {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const result = await contract.methods['level'](tokenId).call();
      return result;
    } catch (error) {
      console.error("level fail to fetch:", error);
      throw error;
    }
  }

  public async getUserPoints() {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const result = await contract.methods['getUserPoints'](this.walletAddressSubject.value).call();
      return result;
    } catch (error) {
      console.error("getUserPoints fail to fetch:", error);
      throw error;
    }
  }

  public async getTokenPoints(tokenId: number) {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const result = await contract.methods['getTokenPoints'](tokenId).call();
      return result;
    } catch (error) {
      console.error("getTokenPoints fail to fetch:", error);
      throw error;
    }
  }

  public async mint(numberOfTokens: number): Promise<any> {
    if (!this.web3) throw new Error("Web3 not initialized");
    try {
      const tokenIdsBefore: number[] = await this.tokenOfOwnerByIndex(this.walletAddressSubject.value);
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const totalPrice = (numberOfTokens * this.FoxyPrice).toString();
  
      const result = await contract.methods['mint'](numberOfTokens).send({
        from: this.walletAddressSubject.value,
        value: this.web3.utils.toWei(totalPrice, 'ether'),
      });
      this.creatingNftLoadingSubject.next(true);
      return this._createNFT(tokenIdsBefore, this.walletAddressSubject.value);
    } catch (error) {
      this.creatingNftLoadingSubject.next(false);
      console.error(error);
      throw new Error("Transaction failed. Please try again.");
    }
  }

  public async mintAllowList(numberOfTokens: number): Promise<any> {
    if (!this.web3) throw new Error("Web3 not initialized");
    if(numberOfTokens > Number(await this.numAvailableToMint())) throw new Error("Exceeded max available to purchase"); 
    try {
      const tokenIdsBefore: number[] = await this.tokenOfOwnerByIndex(this.walletAddressSubject.value);
      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const privaleSaleIsActive = await this.privateSaleIsActive();
      const totalPrice = (numberOfTokens * (privaleSaleIsActive ? this.PrivateSaleFoxyPrice : this.FoxyPrice)).toString();
  
      const result = await contract.methods['mintAllowList'](numberOfTokens).send({
        from: this.walletAddressSubject.value,
        value: this.web3.utils.toWei(totalPrice, 'ether'),
      });
      this.creatingNftLoadingSubject.next(true);
      return this._createNFT(tokenIdsBefore, this.walletAddressSubject.value);
    } catch (error) {
      this.creatingNftLoadingSubject.next(false);
      console.error(error);
      throw new Error("Transaction failed. Please try again.");
    }
  }

  private async _createNFT(tokenIdsBefore: number[], fromAddress: string) {
    // Attendre que les nouveaux jetons soient disponibles
    let tokenIdsAfter: number[] = [];
    try {
      do {
          tokenIdsAfter = await this.tokenOfOwnerByIndex(fromAddress);
      } while (tokenIdsAfter.length === tokenIdsBefore.length);
      // Identifier les nouveaux jetons mintés
      const newTokenIds: number[] = tokenIdsAfter.filter(
          (id) => !tokenIdsBefore.includes(id)
      );
      const nftData = await Promise.all(
        newTokenIds.map(async (tokenId) => {
          try {
            const response = await axios.get(`http://localhost:8080/adn?tokenId=${tokenId}`);
            return {
                tokenId,
                image: response.data.image, // Image en base64
                metadata: response.data.metadata, // Métadonnées
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération de l'ADN pour le Token ID ${tokenId}:`, error);
            return null;
          }
        })
      )
      this.creatingNftLoadingSubject.next(false);
      return nftData.filter((data) => data !== null);
    } catch (error) {
      console.error("Error while creating NFT:", error);
      throw error;
    }
  }
    

  public async flipPublicSaleState(maxMintAmount: number, state: boolean): Promise<any> {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    try {
      const result = await contract.methods['flipPublicSaleState'](maxMintAmount, state).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      console.error("Fliping Sale failed:", error);
      throw error;
    }
  }

  public async flipPrivateSaleState(): Promise<any> {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    try {
      const result = await contract.methods['flipPrivateSaleState']().send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      console.error("Fliping Sale failed:", error);
      throw error;
    }
  }

  public async merge(tokenId1: number, tokenId2: number): Promise<any> {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    try {
      const result = await contract.methods['merge'](tokenId1, tokenId2).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      console.error("Merge failed:", error);
      throw error;
    }
  }

  public async owner() {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    const owner = await contract.methods['owner']().call();
    return owner;
  }

  public async balanceOf(owner: String) {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    const balance = await contract.methods['balanceOf'](owner).call();
    return balance;
  }

  public async currentSaleMinted() {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    const currentSaleMinted = await contract.methods['currentSaleMinted']().call();
    return currentSaleMinted;
  }

  public async saleMintLimit() {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    const saleMintLimit = await contract.methods['saleMintLimit']().call();
    return saleMintLimit;
  }

  public async numAvailableToMint() {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    const numAvailableToMint = await contract.methods['numAvailableToMint'](this.walletAddressSubject.value).call();
    return numAvailableToMint;
  }


  public async setBaseURI(uri: String) {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    const result = await contract.methods['setBaseURI'](uri).send({
      from: this.walletAddressSubject.value
    });
    return result;
  }

  public async tokenOfOwnerByIndex(owner: String) {
    if (!this.web3) throw new Error("Web3 not initialized");
    const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
    const numberOfTokens = await this.balanceOf(owner);
    const balance = Number(numberOfTokens);
    let result = [];
    for(let i = 0; i < balance; i++) {
      const tokenId = await contract.methods['tokenOfOwnerByIndex'](owner, i).call();
      result.push(Number(tokenId));
    }
    return result;
  }

  async getContractTransactions() {
    try {
      if (!this.web3) throw new Error("Web3 not initialized");

      const contract = new this.web3.eth.Contract(this.FoxyClanABI, this.FoxyClanContractAddress);
      const events = await contract.getPastEvents("allEvents", {
        fromBlock: 0,
        toBlock: 'latest'
      });

      const filteredEvents = events.filter((event): event is EventLog => typeof event !== 'string');

      const transactions = await Promise.all(filteredEvents.map(async (event) => {
        if (!event.transactionHash) return null;

        const transaction = {
          functionName: '',
          from: event.returnValues?.['from'] || null,
          to: event.returnValues?.['to'] || null,
          tokenId: event.returnValues?.['tokenId'] || null,
          parameters: [] as { name: string; value: any }[]
        };

        const tx = await this.web3!.eth.getTransaction(event.transactionHash);
        if (tx && tx.input && tx.input.length > 10) {
          const functionSignature = tx.input.slice(0, 10);
          transaction.functionName = this.getFunctionName(functionSignature);

          try {  // @ToDo
            let paramTypes: string[] = [];
            switch (functionSignature) {
              case '0xa0712d68': // transfer(address,uint256)
                paramTypes = ['uint256'];
                break;
              case '0x42842e0e': // safeTransferFrom(address,address,uint256)
                paramTypes = ['address', 'address', 'uint256'];
                break;
              case '0x23b872dd': // transferFrom(address,address,uint256)
                paramTypes = ['address', 'address', 'uint256'];
                break;
              case '0x095ea7b3': // approve(address,uint256)
                paramTypes = ['address', 'uint256'];
                break;
              case '0x42843c37': // merge (exemple fictif, adapter selon votre cas)
                paramTypes = ['address', 'uint256'];
                break;
              default:
                paramTypes = [];
            }

            if (paramTypes.length > 0) {
              const decodedParameters = this.web3!.eth.abi.decodeParameters(paramTypes, tx.input.slice(10));
              transaction.parameters = Object.keys(decodedParameters)
                .filter(key => isNaN(Number(key)))
                .map(key => ({ name: key, value: decodedParameters[key] }));
            }
          } catch (decodeError) {
            console.error('Error decoding parameters:', decodeError);
          }
        }
        return transaction;
      }));
      return transactions.filter((tx) => tx !== null);
    } catch (error) {
      console.error('Error fetching contract events:', error);
      return [];
    }
  }

  private getFunctionName(signature: string): string {
    const functionSignatures: { [key: string]: string } = {
      '0xddff5b1c': 'Mint',
      '0xd1c2babb': 'Merge',
      '0xa0712d68': 'Mint',
    };
    return functionSignatures[signature] || 'Transfer';
  }








}

