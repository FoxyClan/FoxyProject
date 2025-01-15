import { Injectable } from '@angular/core';

interface MouthOption {name: string; selected: boolean;}
interface HeadCoveringOption {name: string; selected: boolean;}
interface EyesOption {name: string; selected: boolean;}
interface ClothesOption {name: string; selected: boolean;}
interface FurOption {name: string; selected: boolean;}
interface BackgroundOption {name: string; selected: boolean;}

@Injectable({
  providedIn: 'root'
})
export class TraitOptionsService {

  headCoveringOptions: HeadCoveringOption[] = [
    { name: 'Horns', selected: false },
    { name: 'Halo', selected: false },
    { name: 'Gold Patterns', selected: false},
    { name: 'Toxic Liquid', selected: false },
    { name: 'Engraved Samurai Helmet', selected: false },
    { name: 'Robotic Mask', selected: false },
    { name: 'Samurai Helmet', selected: false },
    { name: 'Ninja Bandana', selected: false },
    { name: 'Ripple Of Magic', selected: false },
    { name: 'Pilot Helmet', selected: false },
    { name: 'Bunny Ear', selected: false },
    { name: 'Crown', selected: false },
    { name: 'Earring', selected: false },
    { name: 'Bob', selected: false },
    { name: 'Suit Hat', selected: false },
    { name: 'Headphones', selected: false },
  ];

  eyesOptions: EyesOption[] = [
    { name: 'Bloodshot', selected: false },
    { name: 'Scarlet', selected: false },
    { name: 'Gold', selected: false },
    { name: 'Toxic Green', selected: false },
    { name: 'Striped', selected: false },
    { name: 'Robotic', selected: false },
    { name: 'Wisdom (Closed)', selected: false },
    { name: 'Sharingan', selected: false },
    { name: 'Blindfolded', selected: false },
    { name: 'Innocent', selected: false },
    { name: 'Disdainful', selected: false },
    { name: 'Dollars', selected: false },
    { name: 'Bored', selected: false },
    { name: 'Hypnotized', selected: false },
    { name: 'Sunglasses', selected: false },
    { name: 'Happy (Closed)', selected: false },
  ];

  mouthOptions: MouthOption[] = [
    { name: 'Long Fangs', selected: false },
    { name: 'Biting Lip', selected: false }, //change
    { name: 'Black And Gold', selected: false },
    { name: 'Gas Mask', selected: false },
    { name: 'Engraved Samurai Mask', selected: false },
    { name: 'Robot Mask', selected: false },
    { name: 'Twig', selected: false },
    { name: 'Hate', selected: false },
    { name: 'Smiling', selected: false },
    { name: 'Neutral', selected: false },
    { name: 'Tongue', selected: false },
    { name: 'Gold Teeth', selected: false },
    { name: 'Amazed', selected: false },
    { name: 'Confused', selected: false },
    { name: 'Smoking', selected: false },
    { name: 'Happy', selected: false },
  ];

  clothesOptions: ClothesOption[] = [
    { name: 'Winged Dark Armor', selected: false }, //0
    { name: 'Winged Golden Armor', selected: false }, //1
    { name: 'Golden Pendant', selected: false }, //2
    { name: 'Military', selected: false }, //3
    { name: 'Samurai Armor', selected: false }, //4
    { name: 'Robot', selected: false }, //5
    { name: 'Samourai', selected: false }, //6
    { name: 'Coat', selected: false }, //7
    { name: 'Scarf', selected: false }, //8
    { name: 'Pilot', selected: false }, //9
    { name: 'Overalls', selected: false }, //10
    { name: 'King\'s Cape', selected: false }, //11
    { name: 'Black Jacket', selected: false }, //12
    { name: 'T-shirt', selected: false }, //13
    { name: 'Suit', selected: false }, //14
    { name: 'Orange Jacket', selected: false }, //15
  ];

  furOptions: FurOption[] = [
    { name: 'Magma', selected: false }, //0
    { name: 'Angel', selected: false }, //1
    { name: '', selected: false }, //2
    { name: '', selected: false }, //3
    { name: '', selected: false }, //4
    { name: '', selected: false }, //5
    { name: '', selected: false }, //6
    { name: '', selected: false }, //7
    { name: '', selected: false }, //8
  ];

  BackgroundOptions: BackgroundOption[] = [
    { name: '', selected: false }, //0
    { name: '', selected: false }, //1
    { name: '', selected: false }, //2
    { name: '', selected: false }, //3
    { name: '', selected: false }, //4
    { name: '', selected: false }, //5
    { name: '', selected: false }, //6
    { name: '', selected: false }, //7
    { name: '', selected: false }, //8
    { name: '', selected: false }, //9
    { name: '', selected: false }, //10
    { name: '', selected: false }, //11
    { name: '', selected: false }, //12
  ];


  constructor() {}
}
