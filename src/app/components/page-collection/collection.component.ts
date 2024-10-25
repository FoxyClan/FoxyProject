import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { TraitOptionsService } from '../../services/trait-options.service'; // Import du service


@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
  animations: [
    trigger('slideIn', [
      state('in', style({
        height: '*',
        opacity: 1,
        marginLeft: '0px',
      })),
      state('out', style({
        height: '0px',
        opacity: 0,
        marginLeft: '-15px',
      })),
      transition('in => out', [
        animate('300ms ease')
      ]),
      transition('out => in', [
        animate('300ms ease')
      ])
    ])
  ]
})


export class CollectionComponent implements OnInit {
  addresses: string[] = [];
  adr: string = "";
  msg: string = "";

  myValue: string = '';
  traits: string[] = ['HEAD COVERING', 'EYES', 'MOUTH', 'CLOTHES', 'FUR', 'BACKGROUND'];
  isTraitOpen: boolean[] = [];
  

  
  constructor(private http: HttpClient, protected traitOptionsService: TraitOptionsService) {
  }

  toggleTrait(index: number) {
    this.isTraitOpen = this.isTraitOpen.map((_, i) => i === index ? !this.isTraitOpen[i] : false);
  }

  getSelectedOptions() {
    console.log(this.traitOptionsService.mouthOptions.filter(option => option.selected).map(option => option.name))
    console.log(this.traitOptionsService.headCoveringOptions.filter(option => option.selected).map(option => option.name));
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

  /*
  getMessage(): any {
    this.http.get('http://localhost:8081/adn', { responseType: 'text' })
      .subscribe(data => {
        this.msg = 'Message reçu :' + data;
      });
  }
  */
}