import { Injectable } from '@angular/core';

interface MouthOption {name: string; selected: boolean;}
interface HeadCoveringOption {name: string; selected: boolean;}
interface EyesOption {name: string; selected: boolean;}
interface ClothesOption {name: string; selected: boolean;}
interface FurOption {name: string; selected: boolean;}
interface BackgroundOption {name: string; selected: boolean;}
interface TranscendenceOption {name: string; selected: boolean;}

@Injectable({
  providedIn: 'root'
})
export class TraitOptionsService {

  headCoveringOptions: HeadCoveringOption[] = [
    { name: 'Horns', selected: false },
    { name: 'Angel Halo', selected: false },
    { name: 'Golden Tiara', selected: false },
    { name: 'Toxic Liquid', selected: false },
    { name: 'Robotic Mask', selected: false },
    { name: 'Engraved Mask', selected: false },
    { name: 'Golden Kabuto', selected: false },
    { name: 'Pilot Helmet', selected: false },
    { name: 'Suit Hat', selected: false },
    { name: 'Crown', selected: false },
    { name: 'Ripple Of Magic', selected: false },
    { name: 'Straw Hat', selected: false },
    { name: 'Ninja Bandana', selected: false },
    { name: 'Headphones', selected: false },
    { name: 'Bob', selected: false },
    { name: 'Earring', selected: false },
  ];

  eyesOptions: EyesOption[] = [
    { name: 'Bloodshot', selected: false },
    { name: 'Scarlet', selected: false },
    { name: 'Golden Patterns', selected: false },
    { name: 'Toxic Green', selected: false },
    { name: 'Robotic', selected: false },
    { name: 'Striped', selected: false },
    { name: 'Wisdom (Closed)', selected: false },
    { name: 'Blindfolded', selected: false },
    { name: 'Sunglasses', selected: false },
    { name: 'Dollars', selected: false },
    { name: 'Sharingan', selected: false },
    { name: 'Happy (Closed)', selected: false },
    { name: 'Bored', selected: false },
    { name: 'Disdainful', selected: false },
    { name: 'Hypnotized', selected: false },
    { name: 'Normal', selected: false },
  ];

  mouthOptions: MouthOption[] = [
    { name: 'Magma Fangs', selected: false },
    { name: 'Blue Psyche', selected: false },
    { name: 'Gold Mustache', selected: false },
    { name: 'Gas Mask', selected: false },
    { name: 'Robot Mask', selected: false },
    { name: 'Engraved Mask', selected: false },
    { name: 'Gold Teeth', selected: false },
    { name: 'Twig Nibbles', selected: false },
    { name: 'Smoking', selected: false },
    { name: 'Tongue Out', selected: false },
    { name: 'Disgust', selected: false },
    { name: 'Rabbit', selected: false },
    { name: 'Hate', selected: false },
    { name: 'Happy', selected: false },
    { name: 'Confused', selected: false },
    { name: 'Neutral', selected: false },
  ];

  clothesOptions: ClothesOption[] = [
    { name: 'Winged Dark Armor', selected: false },
    { name: 'Winged Golden Armor', selected: false },
    { name: 'Ornamental Armor', selected: false },
    { name: 'Military', selected: false },
    { name: 'Robot', selected: false },
    { name: 'Samurai', selected: false },
    { name: 'Shoulder Cloak', selected: false },
    { name: 'Pilot Suit', selected: false },
    { name: 'Suit', selected: false },
    { name: "King's Cape", selected: false },
    { name: 'Black Jacket', selected: false },
    { name: 'Overalls', selected: false },
    { name: 'Blue Coat', selected: false },
    { name: 'Scarf', selected: false },
    { name: 'Polo Shirt', selected: false },
    { name: 'Orange Jacket', selected: false },
  ];

  furOptions: FurOption[] = [
    { name: 'Magma', selected: false },
    { name: 'Angel', selected: false },
    { name: 'Golden Obsidian', selected: false },
    { name: 'Dirty', selected: false },
    { name: 'Robot', selected: false },
    { name: 'Scarred', selected: false },
    { name: 'Beige', selected: false },
    { name: 'Dark Brown', selected: false },
    { name: 'Light Brown', selected: false },
    { name: 'Orange', selected: false },
  ];

  backgroundOptions: BackgroundOption[] = [
    { name: 'Hell', selected: false },
    { name: 'Heavenly Skies', selected: false },
    { name: 'Ancient Egypt', selected: false },
    { name: 'Green Gradient', selected: false },
    { name: 'Turquoise Gradient', selected: false },
    { name: 'Red Gradient', selected: false },
    { name: 'Soft Beige', selected: false },
    { name: 'Blue Grey', selected: false },
    { name: 'Dark Blue', selected: false },
    { name: 'Red', selected: false },
    { name: 'Soft Mauve', selected: false },
    { name: 'Light Blue', selected: false },
    { name: 'Orange', selected: false },
  ];
  
  transcendenceOptions: TranscendenceOption[] = [
    { name: 'Electrified', selected: false }, //0
    { name: 'Neon Nose', selected: false }, //1
  ];


  constructor() {}

  getTraitIndex(trait: string, type: string) {
    let options: any[] = [];
    switch (type.toLowerCase()) {
      case 'head covering':
        options = this.headCoveringOptions;
        break;
      case 'eyes':
        options = this.eyesOptions;
        break;
      case 'mouth':
        options = this.mouthOptions;
        break;
      case 'clothes':
        options = this.clothesOptions;
        break;
      case 'fur':
        options = this.furOptions;
        break;
      case 'background':
        options = this.backgroundOptions;
        break;
      case 'transcendence':
        options = this.transcendenceOptions;
        break;
      default:
        console.error('Type de trait invalide:', type);
        return null;
    }
    const index = options.findIndex(option => option.name.toLowerCase() === trait.toLowerCase());
    return index !== -1 ? index : null;
  }

  getTraitRarity(trait: string, type: string) {
    const index = this.getTraitIndex(trait, type);
    if (index === null) {
      console.error("Trait not found");
      return "";
    }
    if (type == "Transcendence" && index == 1) return "epic";
    if (index <= 2) return "legendary";
    if (index <= 5) return "epic";
    if (index <= 8) return "rare";
    return "";
  }

}
