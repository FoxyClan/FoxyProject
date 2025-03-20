import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})


export class TeamComponent {
  teamMembers = [
    {
      name: 'Mathieu Cazaux',
      description: 'Lead Developer and Project Manager',
      image: '1.png'
    },
    {
      name: 'Mickaël',
      description: 'Smart Contract Engineer & Security Auditor',
      image: '2.png'
    },
    {
      name: 'Thalia Ghazal',
      description: 'Marketing & Community Manager.',
      image: '3.png'
    },
    {
      name: 'Hassan Mian',
      description: 'Creative Director & NFT Designer.',
      image: '4.png'
    },
    {
      name: 'PixelPhantom',
      description: 'Web3 Integration & UX/UI Specialist.',
      image: '5.png'
    }
  ];
}
