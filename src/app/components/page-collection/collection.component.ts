import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { TraitOptionsService } from '../../services/trait-options.service';
import { Web3Service } from "../../services/web3.service";
import axios from "axios";


interface Metadata {
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
    ]),
    trigger('popIn', [
      state('void', style({
        transform: 'scale(0.8)',
        opacity: 0
      })),
      transition('void => *', [
        animate('200ms ease-out',
          style({transform: 'scale(1)', opacity: 1}))
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

  baseUri : string = 'https://foxyclan.s3.filebase.com/';
  numbers = Array.from({ length: 40 }, (_, i) => i + 1);
  tokens: Metadata[] = [];
  tokenIndex: number = 0;
  
  
  constructor(private http: HttpClient, protected traitOptionsService: TraitOptionsService, private web3Service: Web3Service) {
  }

  ngOnInit() {
    this.isTraitOpen = new Array(this.traits.length).fill(false);
    this.loadToken();
  }

  loadToken() {
    for(let i = 1; i <= 40; i++) {
      this.fetchMetadata(this.tokenIndex);
      this.tokenIndex++;
    }
  }

  async fetchMetadata(tokenId: number) {
    try {
      const response = await axios.get<Metadata>(this.baseUri + tokenId + ".json");
      const metadata = response.data;
      this.tokens.push(metadata);
    } catch (error) {
    }
  }

  extractTokenNumber(name: string): number | null {
    const match = name.match(/#(\d+)/); // Cherche un nombre après le caractère #
    return match ? parseInt(match[1], 10) : null; // Convertit en nombre ou retourne null
  }

  toggleTrait(index: number) {
    this.isTraitOpen = this.isTraitOpen.map((_, i) => i === index ? !this.isTraitOpen[i] : false);
  }

  getSelectedOptions() {
    console.log(this.traitOptionsService.mouthOptions.filter(option => option.selected).map(option => option.name))
    console.log(this.traitOptionsService.headCoveringOptions.filter(option => option.selected).map(option => option.name));
  }
  
  


}