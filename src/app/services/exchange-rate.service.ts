  import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { firstValueFrom } from 'rxjs';
  
  @Injectable({
    providedIn: 'root'
  })
  export class ExchangeRateService {
    private apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,tether,weth&vs_currencies=usd';
    private prices: { [key: string]: number } = {};
  
    constructor(private http: HttpClient) {}
  
    async fetchPrices(): Promise<void> {
      try {
        const response: any = await firstValueFrom(this.http.get(this.apiUrl));
        this.prices = {
          ETH: response.ethereum.usd,
          USDC: response['usd-coin'].usd,
          USDT: response.tether.usd,
          WETH: response.weth.usd
        };
      } catch (error) {
        console.error("Erreur lors de la récupération des prix:", error);
        throw error;
      }
    }
  
    async convertToUsd(amount: number, symbol: 'ALL' | 'ETH' | 'USDC' | 'USDT' | 'WETH'): Promise<number> {
      if (symbol === 'ALL') symbol = 'ETH';
      if (!this.prices[symbol]) {
        await this.fetchPrices();
      }
      const priceInUsd = this.prices[symbol];
      return amount * priceInUsd;
    }
  }
  