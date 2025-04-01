import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('popOut', [
      state('void', style({
        transform: 'scale(1.2)',
        opacity: 0
      })),
      transition('void => *', [
        animate('200ms ease-out',
          style({transform: 'scale(1)', opacity: 1}))
      ])
    ])
  ],
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
      description: 'NFT Designer.',
      image: '4.png'
    },
    {
      name: 'DoniKudjo',
      description: 'Creative Director & NFT Designer.',
      image: '5.png'
    }
  ];
}
