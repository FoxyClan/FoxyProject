import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RoadmapComponent implements OnInit {
  roadmapItems = [
    {
      phase: 'Phase 1',
      title: 'Genesis Launch',
      date: 'Q1 2024',
      completed: true,
      items: [
        'Initial FoxyClan NFT Collection Launch',
        'Community Building',
        'Social Media Presence',
        'Website Launch'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Expansion',
      date: 'Q2 2024',
      completed: false,
      items: [
        'Marketplace Integration',
        'Staking Platform',
        'Community Events',
        'Partnerships Announcement'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'Utility',
      date: 'Q3 2024',
      completed: false,
      items: [
        'Token Launch',
        'DAO Implementation',
        'Exclusive Merchandise',
        'Gaming Integration'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Metaverse',
      date: 'Q4 2024',
      completed: false,
      items: [
        'Virtual World Development',
        'Cross-Chain Integration',
        'Real-World Events',
        'Advanced Features Release'
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}