import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-probability-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './probability-modal.component.html',
  styleUrl: './probability-modal.component.css'
})

export class ProbabilityModalComponent {
  isModalOpen = false;
  traitNumbers = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'];
  showTooltip: boolean = false;
  showLegendTooltip: boolean = false;

  probabilities = {
    'Fur': [1, 2, 3, 5, 7, 9, 13, 16, 19, 25],
    'Background': [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 15, 16],
    'Transcendence': ["0", "0"],
    'Other': [1, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.75, 9.5, 10.25, 11.5]
  };

  openModal() {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = '';
  }

  getProbability(type: string, num: string) {
    let index = parseInt(num);
    if (type === 'Fur') return this.probabilities['Fur'][index] || '-';
    if (type === 'Background') return this.probabilities['Background'][index] || '-';
    if (type === 'Transcendence') return this.probabilities['Transcendence'][index] || '-';
    if (index < 16) return this.probabilities['Other'][index] || '-';
    return '-';
  }
}
