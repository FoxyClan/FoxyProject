package com.foxyclan.jar;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@Service
public class MergeService {

    @Autowired
    private final NftService nftService;

    public MergeService(NftService nftService) {
        this.nftService = nftService;
    }

    @GetMapping("/merge")
    @CrossOrigin(origins = "http://localhost:4200")
    public Map<String, Object> merge(@RequestParam int tokenId1, @RequestParam int tokenId2, @RequestParam int newTokenId) throws IOException {
        if(tokenId1 == tokenId2) throw new IOException("Les deux tokens doivent être différents");
        // Récupérer les métadonnées des deux tokens depuis Filebase
        Map<String, Object> metadata1 = nftService.fetchMetadataFromFilebase(tokenId1);
        Map<String, Object> metadata2 = nftService.fetchMetadataFromFilebase(tokenId2);

        if (metadata1 == null || metadata2 == null) {
            throw new IOException("Impossible de récupérer les métadonnées de l'un des tokens");
        }

        // Comparer les traits et choisir les meilleurs
        TraitOptionsService traitService = new TraitOptionsService();
        Map<String, String> mergedTraits = new HashMap<>();

        String[] traitTypes = {"Head Covering", "Mouth", "Eyes", "Clothes", "Fur", "Background"};

        for (String trait : traitTypes) {
            String traitValue1 = traitService.getTraitValue(metadata1, trait);
            String traitValue2 = traitService.getTraitValue(metadata2, trait);
            String bestTrait = traitService.getBestTrait(trait, traitValue1, traitValue2);
            mergedTraits.put(trait, bestTrait);
        }
        mergedTraits = applyMutation(mergedTraits, traitTypes);

        // Vérification et ajustement de l'ADN s'il existe déjà
        int maxAttempts = 20000;
        int attempts = 0;
        boolean addDna = false;
        while (!addDna && attempts < maxAttempts) {
            String stringDna = buildDNAString(mergedTraits);
            
            try {
                addDna = nftService.addDna(stringDna, newTokenId);
            } catch (Exception e) {
                e.printStackTrace();
                throw e;
            }

            if (!addDna) {
                mergedTraits = modifyTraits(mergedTraits, traitTypes);
                if (mergedTraits == null) {
                    throw new IOException("Merge Impossible");
                }
            }
            attempts++;
        }
        // Générer la nouvelle image du NFT fusionné
        nftService.createImageFile(mergedTraits, newTokenId);
        nftService.uploadToFilebase(newTokenId + ".png");

        // Générer les métadonnées du nouveau NFT
        Map<String, Object> mergedMetadata = nftService.createMetadataFile(mergedTraits, newTokenId);
        nftService.uploadToFilebase(newTokenId + ".json");

        nftService.deleteNftFiles(tokenId1, tokenId2);

        // Retourner les nouvelles métadonnées et l'image en Base64
        Path imagePath = Path.of("jar/src/main/resources/tmp/" + newTokenId + ".png");
        String imageBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));

        Map<String, Object> response = new HashMap<>();
        response.put("image", imageBase64);
        response.put("metadata", mergedMetadata);

        return response;
    }



    private String buildDNAString(Map<String, String> traits) {
        String dnaString = traits.get("Head Covering") +
                           traits.get("Mouth") +
                           traits.get("Eyes") +
                           traits.get("Clothes") +
                           traits.get("Fur") +
                           traits.get("Background");

        if (traits.containsKey("Mutation")) {
            dnaString += traits.get("Mutation");
        }
        return dnaString;
    }



    private Map<String, String> modifyTraits(Map<String, String> mergedTraits, String[] traitTypes) {
        List<String> modifiableTraits = new ArrayList<>();
        Map<String, String> modifiedTraits = new HashMap<>(mergedTraits);
        // Récupérer tous les traits sauf "Background" et ceux qui sont déjà à 00
        for (String trait : traitTypes) {
            if (!trait.equals("Background") && !trait.equals("Mutation") && Integer.parseInt(modifiedTraits.get(trait)) > 0) {
                modifiableTraits.add(trait);
            }
        }
        // Si aucun trait n'est modifiable, on retourne null (fusion impossible)
        if (modifiableTraits.isEmpty()) {
            return null;
        }
        // Sélectionner un trait aléatoire à diminuer
        Random rand = new Random();
        String traitToModify = modifiableTraits.get(rand.nextInt(modifiableTraits.size()));
        // Diminuer la valeur de ce trait
        int newValue = Integer.parseInt(modifiedTraits.get(traitToModify)) - 1;
        modifiedTraits.put(traitToModify, String.format("%02d", newValue)); // Format 2 chiffres
    
        return modifiedTraits;
    }



    private Map<String, String> applyMutation(Map<String, String> traits, String[] traitTypes) {
        Random rand = new Random();
        if (rand.nextDouble() < 1) { // 50% de chance d'appliquer une mutation
            int mutationValue = 0; //rand.nextInt(10) + 1; // Valeur aléatoire entre 01 et 10
            traits.put("Mutation", String.format("%02d", mutationValue));
            System.out.println("Mutation appliquée : " + mutationValue);
        } else {
            System.out.println("Aucune mutation appliquée.");
        }
        return traits;
    }
}
