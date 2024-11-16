import { Component, Output, EventEmitter } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-mint',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './modal-mint.component.html',
  styleUrl: './modal-mint.component.css'
})
export class ModalMint {
  @Output() close = new EventEmitter();
  counterValue: number = 1;

  constructor(private web3Service: Web3Service) {}

  closeModal() {
    this.close.emit();
  }
  
  stopEvent(event: Event) {
    event.stopPropagation();
  }

  increase() {
    this.counterValue++;
  }

  decrease() {
    if (this.counterValue > 1) {
      this.counterValue--;
    }
  }

  onInputChange() {
    if (this.counterValue < 1) {
      this.counterValue = 1;
    }
  }

  async mintNFT(numberOfTokens: number) {
    try {
      const result = await this.web3Service.mint(numberOfTokens);
      console.log("Minting successful:", result);
    } catch (error) {
      console.error("Minting error:", error);
    }
  }
}
