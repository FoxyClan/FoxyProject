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
    
  ]
})
export class RoadmapComponent implements OnInit {
  roadmapItems = [
    {
      phase: 'Phase 1',
      title: 'Genesis Launch',
      date: 'Q2 2025',
      completed: true,
      items: [
        'Website Launch',
        'Official launch of Twitter and Discord',
        'Social Media Presence',
        'Giveaway campaigns for our earliest supporters'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Awakening of the clan',
      date: 'Q3 2024',
      completed: false,
      items: [
        'Free airdrop of 300 NFTs to reward early supporters and creators',
        'Private Sale : 300 NFTs available at 0.0075 ETH',
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