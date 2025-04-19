package com.foxyclan.jar;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class TraitOptionsService {

    private final List<String> headCoveringOptions = Arrays.asList(
        "Horns", 
        "Halo", 
        "Golden Tiara", 
        "Toxic Liquid", 
        "Robotic Mask", 
        "Engraved Helmet",
        "Golden Kabuto", 
        "Pilot Helmet",
        "Suit Hat", 
        "Crown", 
        "Ripple Of Magic",  
        "Straw Hat",
        "Ninja Bandana",
        "Headphones",
        "Bob",  
        "Earring" 
    ); //16

    private final List<String> eyesOptions = Arrays.asList(
        "Bloodshot", 
        "Scarlet", 
        "Golden Patterns", 
        "Toxic Green",
        "Robotic", 
        "Striped", 
        "Wisdom (Closed)",
        "Blindfolded", 
        "Sunglasses", 
        "Dollars", 
        "Sharingan",  
        "Happy (Closed)",
        "Bored",
        "Disdainful", 
        "Hypnotized",
        "Normal"
    ); //16

    private final List<String> mouthOptions = Arrays.asList(
        "Magma Fangs", 
        "Blue Psyche", 
        "Gold Mustache", 
        "Gas Mask", 
        "Robot Mask", 
        "Engraved Mask",
        "Gold Teeth",
        "Twig Nibbles",  
        "Smoking", 
        "Tongue Out", 
        "Stunned", 
        "Rabbit",
        "Hate", 
        "Happy",
        "Confused",
        "Neutral"
    ); //16

    private final List<String> clothesOptions = Arrays.asList(
        "Winged Dark Armor", 
        "Winged Golden Armor", 
        "Ornamental Armor", 
        "Military", 
        "Robot", 
        "Samurai",
        "Shoulder Cloak",
        "Pilot Suit",  
        "Suit", 
        "King's Cape",
        "Black Jacket",  
        "Overalls",
        "Blue Coat",  
        "Scarf", 
        "T-shirt",
        "Orange Jacket"
    ); //16

    private final List<String> furOptions = Arrays.asList(
        "Magma", 
        "Angel", 
        "Golden Obsidian", 
        "Dirty", 
        "Robot", 
        "Scarred", 
        "Beige",
        "Dark Brown",
        "Light Brown", 
        "Orange"
    ); //10

    private final List<String> backgroundOptions = Arrays.asList(
        "Hell", 
        "Heavenly Skies", 
        "Ancient Egypt", 
        "Green Gradient", 
        "Turquoise Gradient", 
        "Red Gradient", 
        "Soft Beige", 
        "Grey", 
        "Dark Blue", 
        "Red", 
        "Soft Mauve", 
        "Light Blue", 
        "Orange"
    ); //13

    private final List<String> transcendenceOptions = Arrays.asList(
        "Electrified",
        "Neon Nose"
    ); //1

    public String getTraitOption(String category, int index) {
        List<String> options = switch (category.toLowerCase()) {
            case "headcovering" -> headCoveringOptions;
            case "eyes" -> eyesOptions;
            case "mouth" -> mouthOptions;
            case "clothes" -> clothesOptions;
            case "fur" -> furOptions;
            case "background" -> backgroundOptions;
            case "transcendence" -> transcendenceOptions;
            default -> throw new IllegalArgumentException("Invalid category: " + category);
        };

        if (index < 0 || index >= options.size()) {
            throw new IndexOutOfBoundsException("Index out of range for category: " + category);
        }

        return options.get(index);
    }

    public int getTraitIndex(String category, String trait) {
        List<String> options = switch (category.toLowerCase()) {
            case "head covering" -> headCoveringOptions;
            case "eyes" -> eyesOptions;
            case "mouth" -> mouthOptions;
            case "clothes" -> clothesOptions;
            case "fur" -> furOptions;
            case "background" -> backgroundOptions;
            case "transcendence" -> transcendenceOptions;
            default -> throw new IllegalArgumentException("Invalid category: " + category);
        };

        int index = options.indexOf(trait);
        if (index == -1) {
            throw new IllegalArgumentException("Trait not found in category: " + category);
        }

        return index;
    }

    public String getBestTrait(String category, String value1, String value2) {
        if (value1 == null && value2 == null) return null;
        if (value1 == null) return String.format("%02d", this.getTraitIndex(category, value2));
        if (value2 == null) return String.format("%02d", this.getTraitIndex(category, value1));
        
        int index1 = this.getTraitIndex(category, value1);
        int index2 = this.getTraitIndex(category, value2);
        
        int bestIndex = Math.min(index1, index2);
        return String.format("%02d", bestIndex);
    }
    

    public String getTraitValue(Map<String, Object> metadata, String traitType) {
        Object attributesObj = metadata.get("attributes");
    
        if (attributesObj instanceof List<?>) {
            List<?> attributesList = (List<?>) attributesObj;
    
            for (Object attributeObj : attributesList) {
                if (attributeObj instanceof Map<?, ?> attributeMap) {
                    Object traitTypeObj = attributeMap.get("trait_type");
                    Object valueObj = attributeMap.get("value");
    
                    if (traitTypeObj instanceof String traitTypeStr && valueObj instanceof String valueStr) {
                        if (traitTypeStr.equals(traitType)) {
                            return valueStr;
                        }
                    }
                }
            }
        }
        return null;
    }



    private final Map<String, Integer> traitWeights = Map.ofEntries(
        // Background (poids 0)
        Map.entry("Background:00", 0), Map.entry("Background:01", 0), Map.entry("Background:02", 0),
        Map.entry("Background:03", 0), Map.entry("Background:04", 0), Map.entry("Background:05", 0),
        Map.entry("Background:06", 0), Map.entry("Background:07", 0), Map.entry("Background:08", 0),
        Map.entry("Background:09", 0), Map.entry("Background:10", 0), Map.entry("Background:11", 0),
        Map.entry("Background:12", 0),
        // Fur (poids 20)
        Map.entry("Fur:00", 20), Map.entry("Fur:01", 20), Map.entry("Fur:02", 20),
        Map.entry("Fur:03", 20), Map.entry("Fur:04", 20), Map.entry("Fur:05", 20),
        Map.entry("Fur:06", 20), Map.entry("Fur:07", 20), Map.entry("Fur:08", 20),
        Map.entry("Fur:09", 20),
        // Clothes (poids 40)
        Map.entry("Clothes:00", 40), Map.entry("Clothes:01", 40), Map.entry("Clothes:02", 40),
        Map.entry("Clothes:03", 40), Map.entry("Clothes:04", 40), Map.entry("Clothes:05", 40),
        Map.entry("Clothes:06", 40), Map.entry("Clothes:07", 40), Map.entry("Clothes:08", 40),
        Map.entry("Clothes:09", 40), Map.entry("Clothes:10", 40), Map.entry("Clothes:11", 40),
        Map.entry("Clothes:12", 40), Map.entry("Clothes:13", 40), Map.entry("Clothes:14", 40),
        Map.entry("Clothes:15", 40),
        // Eyes (poids 60)
        Map.entry("Eyes:00", 60), Map.entry("Eyes:01", 60), Map.entry("Eyes:02", 60),
        Map.entry("Eyes:03", 60), Map.entry("Eyes:04", 60), Map.entry("Eyes:05", 60),
        Map.entry("Eyes:06", 60), Map.entry("Eyes:07", 60), Map.entry("Eyes:08", 60),
        Map.entry("Eyes:09", 60), Map.entry("Eyes:10", 60), Map.entry("Eyes:11", 60),
        Map.entry("Eyes:12", 60), Map.entry("Eyes:13", 60), Map.entry("Eyes:14", 60),
        Map.entry("Eyes:15", 60),
        // Mouth (poids 80)
        Map.entry("Mouth:00", 80), Map.entry("Mouth:01", 80), Map.entry("Mouth:02", 140),
        Map.entry("Mouth:03", 120), Map.entry("Mouth:04", 120), Map.entry("Mouth:05", 120),
        Map.entry("Mouth:06", 80), Map.entry("Mouth:07", 140), Map.entry("Mouth:08", 180),
        Map.entry("Mouth:09", 80), Map.entry("Mouth:10", 80), Map.entry("Mouth:11", 80),
        Map.entry("Mouth:12", 80), Map.entry("Mouth:13", 80), Map.entry("Mouth:14", 80),
        Map.entry("Mouth:15", 80),
        // HeadCovering (poids 100)
        Map.entry("HeadCovering:00", 100), Map.entry("HeadCovering:01", 100), Map.entry("HeadCovering:02", 100),
        Map.entry("HeadCovering:03", 178), Map.entry("HeadCovering:04", 100), Map.entry("HeadCovering:05", 130),
        Map.entry("HeadCovering:06", 125), Map.entry("HeadCovering:07", 100), Map.entry("HeadCovering:08", 100),
        Map.entry("HeadCovering:09", 100), Map.entry("HeadCovering:10", 100), Map.entry("HeadCovering:11", 100),
        Map.entry("HeadCovering:12", 100), Map.entry("HeadCovering:13", 100), Map.entry("HeadCovering:14", 100),
        Map.entry("HeadCovering:15", 100),

        Map.entry("Transcendence:00", 179), Map.entry("Transcendence:01", 200)
    );

    public int getTraitWeight(String category, String code) {
        return traitWeights.getOrDefault(category + ":" + code, 0);
    }


}
