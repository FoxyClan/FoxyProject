import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Web3Service } from "../../services/web3.service";

interface Metadata {
  tokenId: number;
  image: string;
  DNA: string;
  name: string;
  description: string;
  attributes: Array<{ value: string; trait_type: string }>;
}

@Component({
  selector: 'app-modal-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-collection.component.html',
  styleUrl: './modal-collection.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'scale(0.9)' })),
      transition(':enter', [
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})


export class ModalCollection implements OnChanges {
  @Input() token!: Metadata | null;
  @Output() closeModalEvent = new EventEmitter<void>();

  tokenLevel: any = "Loading...";
  foxyPoints: any = "Loading...";
  ownerOfToken: string = "Loading...";

  backgroundColor: string = 'linear-gradient(to bottom, #010204, #32a5ba)';

  constructor(private web3Service: Web3Service) {}

  ngOnInit() {
    if(this.token) {
      this.level(this.token.tokenId);
      this.getTokenPoints(this.token.tokenId);
      this.ownerOf(this.token.tokenId);
    }
    
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  ngOnChanges() {
    if (this.token) {
      const backgroundAttr = this.token.attributes.find(attr => attr.trait_type.toLowerCase() === 'background');
      console.log(backgroundAttr)

      if (backgroundAttr) {
        this.backgroundColor = "backgroundAttr.value"; // Appliquer la couleur trouvée
      }
    }
  }

  async level(levelTokenId: number) {
    try {
       const result = await this.web3Service.level(levelTokenId);
       this.tokenLevel = Number(result);
    } catch (error) {
       console.error("level fail to fetch:", error);
       this.tokenLevel = "Fail to fetch";
    }
  }

  async getTokenPoints(tokenPoints: number) {
    try {
       const result = await this.web3Service.getTokenPoints(tokenPoints);
       this.foxyPoints =  Number(result);
    } catch (error) {
       console.error("TokenPoints fail to fetch:", error);
       this.foxyPoints = "Fail to fetch";
    }
  }

  async ownerOf(tokenPoints: number) {
    try {
       const result = await this.web3Service.ownerOf(tokenPoints);
       this.ownerOfToken = String(result);
    } catch (error) {
       console.error("Fail to fetch owner of " + "tokenId", error);
       this.ownerOfToken = "Fail to fetch";
    }
  }
}
