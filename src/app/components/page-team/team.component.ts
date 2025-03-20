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
      name: 'ShadowFox',
      description: 'Lead Developer & Blockchain Specialist.',
      image: '1.png'
    },
    {
      name: 'LunaByte',
      description: 'Smart Contract Engineer & Security Auditor.',
      image: '2.png'
    },
    {
      name: 'NeonFury',
      description: 'Creative Director & NFT Designer.',
      image: '3.png'
    },
    {
      name: 'CyberWave',
      description: 'Marketing & Community Manager.',
      image: '4.png'
    },
    {
      name: 'PixelPhantom',
      description: 'Web3 Integration & UX/UI Specialist.',
      image: '5.png'
    }
  ];
}
