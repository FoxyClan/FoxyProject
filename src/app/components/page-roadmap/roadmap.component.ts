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
      items: [
        { text: 'Website Launch', completed: true },
        { text: 'Official launch of Twitter and Discord', completed: true },
        { text: 'Social Media Presence', completed: false },
        { text: 'Giveaway campaigns for our earliest supporters', completed: false }
      ]      
    },
    {
      phase: 'Phase 2',
      title: 'Awakening of the clan',
      date: 'Q3 2025',
      items: [
        {
          text: 'Free airdrop of 300 NFTs to reward early supporters and creators',
          completed: false
        },
        {
          text: 'Private Sale : 300 NFTs available at 0.0075 ETH',
          completed: false
        },
        {
          text: 'Public Sale : opens at 0.0125 ETH',
          completed: false
        },
        {
          text: 'NFTs revealed',
          completed: false
        }
      ]
    },
    {
      phase: 'Phase 3',
      title: 'Rise of the Foxy',
      date: 'Q3 2025',
      items: [
        {
          text: 'NFT Merger Available',
          completed: false
        },
        {
          text: 'Competitive leaderboard based on rarity',
          completed: false
        },
        {
          text: 'The Echo Unleashed',
          completed: false
        },
        {
          text: '',
          completed: false
        }
      ]
    },    
    {
      phase: 'Phase 4',
      title: '',
      date: 'Q3 2025',
      items: [
        {
          text: '',
          completed: false
        },
        {
          text: '',
          completed: false
        },
        {
          text: '',
          completed: false
        },
        {
          text: '',
          completed: false
        }
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

  isPhaseCompleted(items: { text: string; completed: boolean }[]): boolean {
    return items.every(item => item.completed);
  }
  
}

/*
Phase 7 — Launch of $FOXY Token
Q4 2025

Introduction of $FOXY, the utility token of the Foxy ecosystem

Use $FOXY for fusions, staking, power-ups, and access to events

Reward system for loyal and active community members

Phase 8 — Foxy Clan in the Metaverse
Q4 2025 - Q1 2026

Integration of Foxy NFTs into The Sandbox

Creation of the immersive Foxy HQ

Exclusive metaverse games, quests, and seasonal events

Phase 9 — Expansion & Foxy DAO
2026

Launch of the Foxy DAO for community governance

Multichain expansion (Polygon, Arbitrum, etc.)

Introduction of new characters and allies of the Foxy universe
*/