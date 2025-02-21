package com.foxyclan.jar;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;


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
    public Map<String, Object> generateMergedDNA(@RequestParam int tokenId1, @RequestParam int tokenId2, @RequestParam int newTokenId) throws IOException {
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
            
            // Comparer les indices et prendre le meilleur trait
            String bestTrait = traitService.getBestTrait(trait, traitValue1, traitValue2);
            mergedTraits.put(trait, bestTrait);
        }

        // Générer la nouvelle image du NFT fusionné
        nftService.createNFT(mergedTraits, newTokenId);
        nftService.uploadToFilebase(newTokenId + ".png");

        // Générer les métadonnées du nouveau NFT
        Map<String, Object> mergedMetadata = nftService.createMetadataFile(mergedTraits, newTokenId);
        nftService.uploadToFilebase(newTokenId + ".json");

        // Retourner les nouvelles métadonnées et l'image en Base64
        Path imagePath = Path.of("jar/src/main/resources/tmp/" + newTokenId + ".png");
        String imageBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));

        Map<String, Object> response = new HashMap<>();
        response.put("image", imageBase64);
        response.put("metadata", mergedMetadata);

        return response;
    }
}
