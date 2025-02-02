package com.foxyclan.jar;

import java.util.Arrays;
import java.util.List;

public class TraitOptionsService {

    private final List<String> headCoveringOptions = Arrays.asList(
        "Horns", "Halo", "Gold Patterns", "Toxic Liquid", "Engraved Samurai Helmet",
        "Robotic Mask", "Samurai Helmet", "Ninja Bandana", "Ripple Of Magic", "Pilot Helmet",
        "Bunny Ear", "Crown", "Earring", "Bob", "Suit Hat", "Headphones"
    );

    private final List<String> eyesOptions = Arrays.asList(
        "Bloodshot", "Scarlet", "Gold", "Toxic Green", "Striped", "Robotic",
        "Wisdom (Closed)", "Sharingan", "Blindfolded", "Innocent", "Disdainful",
        "Dollars", "Bored", "Hypnotized", "Sunglasses", "Happy (Closed)"
    );

    private final List<String> mouthOptions = Arrays.asList(
        "Long Fangs", "Biting Lip", "Black And Gold", "Gas Mask", "Engraved Samurai Mask",
        "Robot Mask", "Twig", "Hate", "Smiling", "Neutral", "Tongue", "Gold Teeth",
        "Amazed", "Confused", "Smoking", "Happy"
    );

    private final List<String> clothesOptions = Arrays.asList(
        "Winged Dark Armor", "Winged Golden Armor", "Golden Pendant", "Military",
        "Samurai Armor", "Robot", "Samourai", "Coat", "Scarf", "Pilot",
        "Overalls", "King's Cape", "Black Jacket", "T-shirt", "Suit", "Orange Jacket"
    );

    private final List<String> furOptions = Arrays.asList(
        "Magma", "Angel", "", "", "", "", "", "", "", ""
    );

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
);

    public String getTraitOption(String category, int index) {
        List<String> options = switch (category.toLowerCase()) {
            case "headcovering" -> headCoveringOptions;
            case "eyes" -> eyesOptions;
            case "mouth" -> mouthOptions;
            case "clothes" -> clothesOptions;
            case "fur" -> furOptions;
            case "background" -> backgroundOptions;
            default -> throw new IllegalArgumentException("Invalid category: " + category);
        };

        if (index < 0 || index >= options.size()) {
            throw new IndexOutOfBoundsException("Index out of range for category: " + category);
        }

        return options.get(index);
    }

}
