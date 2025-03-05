package com.foxyclan.jar;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class TraitOptionsService {

    private final List<String> headCoveringOptions = Arrays.asList(
        "Horns", 
        "Halo", 
        "Gold Patterns", 
        "Toxic Liquid", 
        "Engraved Samurai Helmet",
        "Robotic Mask", 
        "Samurai Helmet", 
        "Ninja Bandana", 
        "Ripple Of Magic", 
        "Pilot Helmet",
        "Bunny Ear", 
        "Crown", 
        "Earring", 
        "Bob", 
        "Suit Hat", 
        "Headphones"
    ); //16

    private final List<String> eyesOptions = Arrays.asList(
        "Bloodshot", 
        "Scarlet", 
        "Gold", 
        "Toxic Green", 
        "Striped", 
        "Robotic",
        "Wisdom (Closed)", 
        "Sharingan", 
        "Blindfolded", 
        "Innocent", 
        "Disdainful",
        "Dollars", 
        "Bored", "Hypnotized", 
        "Sunglasses", 
        "Happy (Closed)"
    ); //16

    private final List<String> mouthOptions = Arrays.asList(
        "Long Fangs", 
        "Biting Lip", 
        "Gold Mustache", 
        "Gas Mask", 
        "Engraved Samurai Mask",
        "Robot Mask", 
        "Twig", 
        "Hate", 
        "Smiling", 
        "Neutral",
        "Tongue", 
        "Gold Teeth",
        "Amazed", 
        "Confused", 
        "Smoking", 
        "Happy"
    ); //16

    private final List<String> clothesOptions = Arrays.asList(
        "Winged Dark Armor", 
        "Winged Golden Armor", 
        "Golden Pendant", 
        "Military",
        "Samurai Armor", 
        "Robot", "Samourai", 
        "Coat", "Scarf", 
        "Pilot",
        "Overalls", 
        "King's Cape", 
        "Black Jacket", 
        "T-shirt", 
        "Suit", 
        "Orange Jacket"
    ); //16

    private final List<String> furOptions = Arrays.asList(
        "Magma", 
        "Angel", 
        "Golden Obsidian", 
        "Dirty", 
        "Scarred", 
        "Robot", 
        "Beige", 
        "Brown", 
        "Orange", 
        "Orange"
    ); //10

    private final List<String> backgroundOptions = Arrays.asList(
    "Hell", 
    "Heavenly Skies", 
    "Ancient Egypt", 
    "Green", 
    "Raspberry Red", 
    "Deep Teal", 
    "Soft Beige", 
    "Brown", 
    "Light Blue", 
    "Orange", 
    "Orange", 
    "Red", 
    "Soft Mauve"
    ); //13

    private final List<String> mutationOptions = Arrays.asList(
    "Electrified"
    ); //1

    public String getTraitOption(String category, int index) {
        List<String> options = switch (category.toLowerCase()) {
            case "headcovering" -> headCoveringOptions;
            case "eyes" -> eyesOptions;
            case "mouth" -> mouthOptions;
            case "clothes" -> clothesOptions;
            case "fur" -> furOptions;
            case "background" -> backgroundOptions;
            case "mutation" -> mutationOptions;
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
            case "mutation" -> mutationOptions;
            default -> throw new IllegalArgumentException("Invalid category: " + category);
        };

        int index = options.indexOf(trait);
        if (index == -1) {
            throw new IllegalArgumentException("Trait not found in category: " + category);
        }

        return index;
    }

    public String getBestTrait(String category, String value1, String value2) {
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

}
