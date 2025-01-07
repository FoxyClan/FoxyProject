import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.component.html',
  standalone: true,
  imports: [
    CommonModule
  ],
  styleUrls: ['./roadmap.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class RoadmapComponent implements OnInit {
  milestones = [
    {
      phase: 'Phase 1: Genesis',
      title: 'Launch & Community Building',
      description: 'Initial release of 20K unique FoxyClan NFTs with 80+ different traits and 1M+ possibilities.',
      date: 'Q1 2024',
      completed: true,
      icon: '🚀'
    },
    {
      phase: 'Phase 2: Growth',
      title: 'Marketplace Integration',
      description: 'Launch of the FoxyClan marketplace with exclusive trading features for clan members.',
      date: 'Q2 2024',
      completed: false,
      icon: '🌟'
    },
    {
      phase: 'Phase 3: Expansion',
      title: 'Community Rewards',
      description: 'Introduction of staking mechanisms and community rewards for FoxyClan holders.',
      date: 'Q3 2024',
      completed: false,
      icon: '🎁'
    },
    {
      phase: 'Phase 4: Evolution',
      title: 'Metaverse Integration',
      description: 'FoxyClan enters the metaverse with exclusive virtual experiences for holders.',
      date: 'Q4 2024',
      completed: false,
      icon: '🌐'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  isInViewport(element: any): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}