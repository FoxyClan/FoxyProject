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
        try {
            Boolean exist = nftService.existNft(newTokenId);
            if(exist) {
                Boolean isUndiscoveredNft = nftService.isUndiscoveredNft(newTokenId);
                if(isUndiscoveredNft) throw new IOException("Les metadata du tokenId " + newTokenId + " existent deja");
            } 
        } catch (Exception e) {
            throw e;
        }
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

        String[] traitTypes = {"Head Covering", "Mouth", "Eyes", "Clothes", "Fur", "Background", "Transcendence"};

        for (String trait : traitTypes) {
            String traitValue1 = traitService.getTraitValue(metadata1, trait);
            String traitValue2 = traitService.getTraitValue(metadata2, trait);
            if(traitValue1 == null && traitValue2 == null) continue;
            String bestTrait = traitService.getBestTrait(trait, traitValue1, traitValue2);
            mergedTraits.put(trait, bestTrait);
        }

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
        mergedTraits = applyTranscendence(mergedTraits, traitTypes);
        nftService.createImageFile(mergedTraits, newTokenId);
        Map<String, Object> mergedMetadata = nftService.createMetadataFile(mergedTraits, newTokenId);

        nftService.uploadToFilebase(newTokenId + ".png");
        nftService.uploadToFilebase(newTokenId + ".json");

        nftService.deleteNftFiles(tokenId1, tokenId2);

        // Retourner les nouvelles métadonnées et l'image en Base64
        Path imagePath = Path.of("jar/src/main/resources/tmp/" + newTokenId + ".png");
        String imageBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));

        Map<String, Object> response = new HashMap<>();
        response.put("image", imageBase64);
        response.put("metadata", mergedMetadata);

        nftService.clearOldTmpFiles();

        return response;
    }



    private String buildDNAString(Map<String, String> traits) {
        String dnaString = traits.get("Head Covering") +
                           traits.get("Mouth") +
                           traits.get("Eyes") +
                           traits.get("Clothes") +
                           traits.get("Fur") +
                           traits.get("Background");

        if (traits.containsKey("Transcendence")) {
            dnaString += traits.get("Transcendence");
        }
        return dnaString;
    }



    private Map<String, String> modifyTraits(Map<String, String> mergedTraits, String[] traitTypes) {
        List<String> modifiableTraits = new ArrayList<>();
        Map<String, String> modifiedTraits = new HashMap<>(mergedTraits);
        // Récupérer tous les traits sauf "Background" et ceux qui sont déjà à 00
        for (String trait : traitTypes) {
            if (!trait.equals("Background") && !trait.equals("Transcendence") && Integer.parseInt(modifiedTraits.get(trait)) > 0) {
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



    private Map<String, String> applyTranscendence(Map<String, String> traits, String[] traitTypes) {
        Random rand = new Random();
        
        // Vérifie si la transcendance est déjà présente
        boolean hasTranscendence = traits.containsKey("Transcendence");
    
        // Probabilité de transcendance : 100% si déjà présente, sinon 50%
        boolean applyTranscendence = hasTranscendence || rand.nextDouble() < 0.5;
    
        if (applyTranscendence) {
            // Récupère la valeur actuelle du trait "Mouth"
            int mouthValue = Integer.parseInt(traits.getOrDefault("Mouth", "00"));
    
            // Détermine la nouvelle valeur de Transcendence
            int newTranscendenceValue = (mouthValue <= 5) ? 0 : 1;
    
            // Vérifie si la valeur doit être mise à jour
            int currentTranscendenceValue = hasTranscendence ? Integer.parseInt(traits.get("Transcendence")) : -1;
    
            // Met à jour seulement si la valeur change ou si elle n'existait pas
            if (!hasTranscendence || newTranscendenceValue != currentTranscendenceValue) {
                traits.put("Transcendence", String.format("%02d", newTranscendenceValue));
                System.out.println("Transcendence mise à jour : " + newTranscendenceValue);
            } else {
                System.out.println("Transcendence conservée : " + currentTranscendenceValue);
            }
        } else {
            System.out.println("Aucune Transcendence appliquée.");
        }
    
        return traits;
    }
    
}
