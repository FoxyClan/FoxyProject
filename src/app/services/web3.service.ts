import { Injectable } from '@angular/core';
import Web3, { EventLog } from 'web3';
import Coinbase from '@coinbase/wallet-sdk';
import { MetaMaskSDK } from "@metamask/sdk"
import { BehaviorSubject } from 'rxjs';
import axios from 'axios';
import{ wethContractAddress, usdtContractAddress, usdcContractAddress, FoxyClanContractAddress, FoxyPrice, PrivateSaleFoxyPrice, FoxyClanABI, StableCoinContractABI } from './smart-contract.service';

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

  private selectedWalletSubject = new BehaviorSubject<string>('');
  selectedWallet$ = this.selectedWalletSubject.asObservable();

  private creatingNftLoadingSubject = new BehaviorSubject<boolean>(false);
  creatingNftLoading$ = this.creatingNftLoadingSubject.asObservable();

  private isWalletCheckedSubject = new BehaviorSubject<boolean>(false);
  isWalletCheckedSubject$ = this.isWalletCheckedSubject.asObservable();

  private intervalId: any;
  private provider: any = null;
  private iMetaMask: number = 0;
  
  constructor() {
    this.checkConnection();
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
            const checksumAddress = Web3.utils.toChecksumAddress(accounts[0]);
            if(this.walletAddressSubject.value !== checksumAddress) this.walletAddressSubject.next(checksumAddress);
            localStorage.setItem('userAddress', this.walletAddressSubject.value);
            localStorage.setItem('connectionTime', new Date().getTime().toString());
            await this.getNetworkId();
            this.startCheckingConnection();
          } else {
            await this.disconnectWallet();
          }    
        } else {
          this.detectInstalledWallets();
          const savedSelectedWallet = localStorage.getItem('selectedWallet');
          const connectionTime = localStorage.getItem('connectionTime');
          if (connectionTime && savedSelectedWallet && (new Date().getTime() - parseInt(connectionTime)) <= 60000) {
            await this.connectWallet(savedSelectedWallet);
          }
        }
      } catch(error: any) {
        console.error('Error checking wallet connection: ', error);
      } finally {
        this.isWalletCheckedSubject.next(true)
      }
    }
  }


  async connectWallet(selectedWallet: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
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
            });
            this.web3 = new Web3(this.provider);
            await this.provider.request({
              method: 'eth_requestAccounts'
            });
            const accounts = await this.web3.eth.getAccounts();
            const checksumAddress = Web3.utils.toChecksumAddress(accounts[0]);
            this.walletAddressSubject.next(checksumAddress);
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
                      const checksumAddress = Web3.utils.toChecksumAddress(accounts[0]);
                      this.walletAddressSubject.next(checksumAddress);
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
            const checksumAddress = Web3.utils.toChecksumAddress(accounts[0]);
            this.walletAddressSubject.next(checksumAddress);
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
    });
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
          console.info('Switched to Ethereum network.');
        }
      } catch (error) {
        console.error('Network change error: ', error);
      }
    } else {
      console.error('Web3 instance not initialized');
    }  
  }

  async getBalance(symbol: 'ETH' | 'WETH' | 'USDT' | 'USDC'): Promise<string> {
    const contract = this.web3Modifier();
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
          contractAddress = wethContractAddress;
          break;
        case 'USDT':
          contractAddress = usdtContractAddress;
          break;
        case 'USDC':
          contractAddress = usdcContractAddress;
          break;
        default:
          throw new Error("Invalid symbol");
      }
  
      try {
        const contract = new this.web3.eth.Contract(StableCoinContractABI, contractAddress);
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

  public web3Modifier() {
    try {
      if (!this.web3) {
        this.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35'));
        console.log("infura key")
      }
      const contract = new this.web3.eth.Contract(FoxyClanABI, FoxyClanContractAddress);
      return contract;
    }catch(error){
      throw error;
    } 
  }


  // FUNCTION SMART CONTRACT


  public async Supply() {
    const contract = this.web3Modifier();
    try {
      const supply = await contract.methods['totalSupply']().call();
      return supply;
    } catch (error) {
      console.error("Fail to fetch supply:", error);
      throw error;
    }
  }

  public async airdrop(addresses: String[]) {
    const contract = this.web3Modifier();
    console.log(addresses)
    try {
      
      const result = await contract.methods['airdrop'](addresses).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async setAllowList(addresses: String[], numberOfTokens: number) {
    const contract = this.web3Modifier();
    console.log(addresses)
    try {
      
      const result = await contract.methods['setAllowList'](addresses, numberOfTokens).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async reserveFoxy(numberOfTokens: number) {
    const contract = this.web3Modifier();
    try {
      
      const result = await contract.methods['reserveFoxy'](numberOfTokens).send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async publicSaleIsActive() {
    const contract = this.web3Modifier();
    try {
      
      const state = await contract.methods['publicSaleIsActive']().call();
      return state;
    } catch (error) {
      console.error("publicSaleIsActive fail to fetch:", error);
      throw error;
    }
  }

  public async privateSaleIsActive() {
    const contract = this.web3Modifier();
    try {
      
      const state = await contract.methods['privateSaleIsActive']().call();
      return state;
    } catch (error) {
      console.error("privateSaleIsActive fail to fetch:", error);
      throw error;
    }
  }

  public async allowListisActive() {
    const contract = this.web3Modifier();
    try {
      
      const state = await contract.methods['allowListisActive']().call();
      return state;
    } catch (error) {
      console.error("allowListisActive fail to fetch:", error);
      throw error;
    }
  }

  public async ownerOf(tokenId: number): Promise<string> {
    try {
      const contract = this.web3Modifier();
      const result = await contract.methods['ownerOf'](tokenId).call();
      console.log(result, this.walletAddressSubject.value)
      return String(result);
    } catch (error) {
      console.error("Fail to fetch owner of " + "tokenId", error);
      throw error;
    }
  }

  public async level(tokenId: number) {
    const contract = this.web3Modifier();
    try {
      
      const result = await contract.methods['level'](tokenId).call();
      return result;
    } catch (error) {
      console.error("level fail to fetch:", error);
      throw error;
    }
  }

  public async getUserPoints() {
    const contract = this.web3Modifier();
    try {
      
      const result = await contract.methods['getUserPoints'](this.walletAddressSubject.value).call();
      return result;
    } catch (error) {
      console.error("getUserPoints fail to fetch:", error);
      throw error;
    }
  }

  public async getTokenPoints(tokenId: number) {
    const contract = this.web3Modifier();
    try {
      
      const result = await contract.methods['getTokenPoints'](tokenId).call();
      return result;
    } catch (error) {
      console.error("getTokenPoints fail to fetch:", error);
      throw error;
    }
  }

  public async mint(numberOfTokens: number): Promise<any> {
    const contract = this.web3Modifier();
    const balance = await this.balanceOf(this.walletAddressSubject.value);
    const totalSupply = await this.Supply();
    const currentSaleMinted = await this.currentSaleMinted();
    const saleMintLimit = await this.saleMintLimit();

    if(numberOfTokens > 20) throw new Error("You can't mint more than 20 NFTs at a time");
    if(numberOfTokens + Number(balance) > 20) throw new Error("You can't mint more than 20 NFTs");
    if(Number(totalSupply) + numberOfTokens > 20000) throw new Error("Exceeded max supply");
    if(Number(currentSaleMinted) + numberOfTokens > Number(saleMintLimit)) throw new Error("Exceeded max mint limit for this sale");
    
    try {
      const tokenIdsBefore: number[] = await this.tokenOfOwnerByIndex(this.walletAddressSubject.value);
      const totalPrice = (numberOfTokens * FoxyPrice).toString();
  
      await contract.methods['mint'](numberOfTokens).send({
        from: this.walletAddressSubject.value,
        value: this.web3?.utils.toWei(totalPrice, 'ether'),
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
    const contract = this.web3Modifier();
    const totalSupply = await this.Supply();
    if(numberOfTokens > Number(await this.numAvailableToMint())) throw new Error("Exceeded max available to purchase");
    if(Number(totalSupply) + numberOfTokens > 20000) throw new Error("Exceeded max supply");
    try {
      const tokenIdsBefore: number[] = await this.tokenOfOwnerByIndex(this.walletAddressSubject.value);
      
      const privaleSaleIsActive = await this.privateSaleIsActive();
      const totalPrice = (numberOfTokens * (privaleSaleIsActive ? PrivateSaleFoxyPrice : FoxyPrice)).toString();
      await contract.methods['mintAllowList'](numberOfTokens).send({
        from: this.walletAddressSubject.value,
        value: this.web3?.utils.toWei(totalPrice, 'ether'),
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
    let tokenIdsAfter: number[] = [];
    try {
      do {
          tokenIdsAfter = await this.tokenOfOwnerByIndex(fromAddress);
      } while (tokenIdsAfter.length === tokenIdsBefore.length);
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

  public async merge(tokenId1: number, tokenId2: number): Promise<any> {
    if(tokenId1 === tokenId2) throw new Error("Cannot merge the same token");
    const tokenLevel1 = await this.level(tokenId1);
    const tokenLevel2 = await this.level(tokenId2);
    if(Number(tokenLevel1) !== 1 && Number(tokenLevel2) !== 1) throw new Error("Cannot merge 2 tokens that are above level 1");
    if(Number(tokenLevel1) === 3 || Number(tokenLevel2) === 3) throw new Error("Cannot merge a token that is level 3");

    const owner1: string = await this.ownerOf(tokenId1);
        const owner2: string = await this.ownerOf(tokenId2);
        const userWallet: string | null = this.walletAddressSubject.value;
        if (!userWallet) throw new Error("Wallet address not found");

        if (owner1 !== userWallet || owner2 !== userWallet) throw new Error("You are not the owner of one of the tokens");

    const contract = this.web3Modifier();
    const tokenIdsBefore: number[] = await this.tokenOfOwnerByIndex(this.walletAddressSubject.value);
    try {
      await contract.methods['merge'](tokenId1, tokenId2).send({
        from: this.walletAddressSubject.value
      });
      this.creatingNftLoadingSubject.next(true);
      return this._createMergedNFT(tokenIdsBefore, this.walletAddressSubject.value, tokenId1, tokenId2);
    } catch (error) {
      console.error("Merge failed:", error);
      this.creatingNftLoadingSubject.next(false);
      throw error;
    }
  }

  private async _createMergedNFT(tokenIdsBefore: number[], fromAddress: string, tokenId1: number, tokenId2: number) {
    let tokenIdsAfter: number[] = [];
    try {
      do {
        tokenIdsAfter = await this.tokenOfOwnerByIndex(fromAddress);
      } while (tokenIdsAfter.length === tokenIdsBefore.length);
      const newTokenIds: number[] = tokenIdsAfter.filter(
        (id) => !tokenIdsBefore.includes(id)
      );                                                                  
      const nftData = await Promise.all(
        newTokenIds.map(async (tokenId) => {
          try {
            const response = await axios.get(`http://localhost:8080/merge?tokenId1=${tokenId1}&tokenId2=${tokenId2}&newTokenId=${tokenId}`);
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
    const contract = this.web3Modifier();
    
    try {
      const result = await contract.methods['flipPublicSaleState'](maxMintAmount, state).send({
        from: this.walletAddressSubject.value
      });
      console.log(result)
      return result;
    } catch (error) {
      console.error("Fliping Sale failed:", error);
      throw error;
    }
  }

  public async flipPrivateSaleState(): Promise<any> {
    const contract = this.web3Modifier();
    
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
  
  public async flipAllowListState(): Promise<any> {
    const contract = this.web3Modifier();
    
    try {
      const result = await contract.methods['flipAllowListState']().send({
        from: this.walletAddressSubject.value
      });
      return result;
    } catch (error) {
      console.error("Fliping Allow List failed:", error);
      throw error;
    }
  }

  public async owner() {
    const contract = this.web3Modifier();
    const owner = await contract.methods['owner']().call();
    return owner;
  }

  public async balanceOf(owner: String) {
    try {
      const contract = this.web3Modifier();
      const balance = await contract.methods['balanceOf'](owner).call();
      return balance;
    } catch (error) {
      console.error("Fail to fetch token balance:", error);
      throw error;
    }
    
  }

  public async currentSaleMinted() {
    const contract = this.web3Modifier();
    
    const currentSaleMinted = await contract.methods['currentSaleMinted']().call();
    return currentSaleMinted;
  }

  public async saleMintLimit() {
    const contract = this.web3Modifier();
    
    const saleMintLimit = await contract.methods['saleMintLimit']().call();
    return saleMintLimit;
  }

  public async numAvailableToMint() {
    const contract = this.web3Modifier();
    
    const numAvailableToMint = await contract.methods['numAvailableToMint'](this.walletAddressSubject.value).call();
    return numAvailableToMint;
  }


  public async setBaseURI(uri: String) {
    const contract = this.web3Modifier();
    
    const result = await contract.methods['setBaseURI'](uri).send({
      from: this.walletAddressSubject.value
    });
    return result;
  }

  public async tokenOfOwnerByIndex(owner: String) {
    const contract = this.web3Modifier();
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
      const contract = this.web3Modifier();
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

