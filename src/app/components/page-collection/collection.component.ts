import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface MouthOption {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  addresses: string[] = [];
  adr: string = "";
  msg: string = "";

  myValue: string = '';
  traits: string[] = ['HEAD COVERING', 'EYES', 'MOUTH', 'CLOTHES', 'FUR', 'BACKGROUND'];
  isTraitOpen: boolean[] = [];
  

  mouthOptions: MouthOption[] = [
    { name: 'Petite bouche', selected: false },
    { name: 'Grande bouche', selected: false },
    { name: 'Petite bouche', selected: false },
    { name: 'Grande bouche', selected: false },
    { name: 'Petite bouche', selected: false },
    { name: 'Grande bouche', selected: false },
    { name: 'Petite bouche', selected: false },
    { name: 'Grande bouche', selected: false },
    { name: 'Petite bouche', selected: false },
    { name: 'Grande bouche', selected: false },
  ];

  constructor(private http: HttpClient) {}

  getMessage(): any {
    this.http.get('http://localhost:8081/adn', { responseType: 'text' })
      .subscribe(data => {
        this.msg = 'Message reçu :' + data;
      });
  }

  toggleTrait(index: number) {
    this.isTraitOpen[index] = !this.isTraitOpen[index]; // Inverser l'état ouvert/fermé
  }
  

  ngOnInit() {
    this.isTraitOpen = new Array(this.traits.length).fill(false);
    /*
    this.getMessage();
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    web3.eth.getAccounts().then(allAccounts => {
      this.addresses = allAccounts;
      this.adr = this.addresses[0];
    });
    let contract = new web3.eth.Contract([
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_nbrFav",
            "type": "uint256"
          }
        ],
        "name": "setNdrFavoris",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "nbrFavoris",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ], '0x84607377d7aEFA15224Eb4E8Cb52fce83bD741BF');
    let toto = contract.methods['nbrFavoris']().call().then(result => {console.log(result)});*/
  }
}