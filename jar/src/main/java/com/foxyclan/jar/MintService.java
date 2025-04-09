package com.foxyclan.jar;

import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class MintService {

    @Autowired
    private final NftService nftService;
    
    public MintService() {
        NftService _nftService = new NftService();
        this.nftService = _nftService;
    }

    @PostMapping("/dna")
    @CrossOrigin(origins = "https://foxyclan.fr")
    public Map<String, Object> mintSecurity(@RequestBody Map<String, Object> payload) throws Exception {
        int tokenId = (int) payload.get("tokenId");
        String walletAddress = ((String) payload.get("walletAddress")).toLowerCase();
        try {
            String owner = nftService.getOwnerOf(tokenId);
            if (owner == null || owner.isBlank() || owner.equalsIgnoreCase("0x0000000000000000000000000000000000000000")) {
                throw new SecurityException("Token non minté ou adresse invalide");
            }
            if (!owner.equalsIgnoreCase(walletAddress)) {
                throw new SecurityException("Not the owner");
            }
            System.out.println("Propriétaire du token OK");
            nftService.verifyMintTransaction(tokenId);
        } catch (Exception e) {
            throw new IOException("Erreur de validation blockchain : " + e.getMessage(), e);
        }

        try {
            Map<String, Object> response = generateDna(tokenId);
            return response;
        } catch(Exception e) {
            throw e;
        }
    }

    @PostMapping("/discover")
    @CrossOrigin(origins = "https://foxyclan.fr")
    public Map<String, Object> discoverSecurity(@RequestBody Map<String, Object> payload) throws Exception {
        int tokenId = (int) payload.get("tokenId");
        String walletAddress = ((String) payload.get("walletAddress")).toLowerCase();
        String signature = (String) payload.get("signature");
        String message = (String) payload.get("message");

        try {
            String owner = nftService.getOwnerOf(tokenId);
            if (owner == null || owner.isBlank() || owner.equalsIgnoreCase("0x0000000000000000000000000000000000000000")) {
                throw new SecurityException("Token non minté ou adresse invalide");
            }

            // Vérifier que l'adresse de la signature est bien celle du propriétaire
            String recoveredAddress = SignatureUtil.recover(message, signature);
            if (!walletAddress.equalsIgnoreCase(recoveredAddress)) {
                throw new SecurityException("La signature ne correspond pas à l'adresse fournie");
            }
            System.out.println("Signature OK");

            if (!walletAddress.equalsIgnoreCase(owner)) {
                throw new SecurityException("Vous n'êtes pas le propriétaire de ce token");
            }
            System.out.println("Propriétaire du token OK");

            // Générer les vraies métadonnées
            Map<String, Object> response = generateDna(tokenId);
            return response;

        } catch (Exception e) {
            throw new IOException("Erreur lors de la vérification de découverte : " + e.getMessage(), e);
        }
    }

    public Map<String, Object> generateDna(int tokenId) throws Exception {
        try {
            //if(!nftService.existNft(tokenId)) throw new IOException("Le fichier " + tokenId + ".json n'existe pas dans le bucket");
            System.out.println("Verif exist OK");
            //if(!nftService.isUndiscoveredNft(tokenId)) throw new IOException("Les metadata du tokenId " + tokenId + " existent deja");
            System.out.println("Verif undiscovered OK");
        } catch (Exception e) {
            throw e;
        }
        System.out.println("Creation en cours pour le tokenId " + tokenId +" :");

        int maxAttempts = 20000;
        int attempts = 0;
        boolean addDna = false;
        String stringDna = "";
        Map<String, String> adn = new HashMap<>();

        while (!addDna && attempts < maxAttempts) {
            String Head = generateTraitDNA("");
            String Mouth = generateTraitDNA("");
            String Eyes = generateTraitDNA("");
            String Clothes = generateTraitDNA("");
            String Fur = generateTraitDNA("fur");
            String Background = generateTraitDNA("background");

            stringDna = Head + Mouth + Eyes + Clothes + Fur;
            try {
                addDna = nftService.addDna(stringDna, tokenId);
            } catch (Exception e) {
                throw e;
            }
            
            if (addDna) {
                adn.put("Head Covering", Head);
                adn.put("Mouth", Mouth);
                adn.put("Eyes", Eyes);
                adn.put("Clothes", Clothes);
                adn.put("Fur", Fur);
                adn.put("Background", Background);
            }
            attempts++;
        }

        Map<String, Object> response = new HashMap<>();
        try {
            nftService.createImageFile(adn, tokenId);
            nftService.uploadToFilebase(tokenId + ".png");

            Map<String, Object> metadata = nftService.createMetadataFile(adn, tokenId);
            nftService.uploadToFilebase(tokenId + ".json");

            Path imagePath = Path.of("tmp/" + tokenId + ".png");
            String imageBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));
    
            response.put("image", imageBase64);
            response.put("metadata", metadata);

            nftService.clearOldTmpFiles();

            return response;
        } catch(IOException e) {
            e.printStackTrace();
            throw e;
        }
    }
    
    

    public String generateTraitDNA(String type) {
        String[] numbers;
        double[] probabilities;
        if (type.equals("fur")) {
            numbers = new String[]{"00", "01", "02", "03", "04", "05", "06", "07", "08", "09"};
            probabilities = new double[]{1,2,3,5,7,9,13,16,19,25};
        } 
        else if (type.equals("background")) {
            numbers = new String[]{"00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"};
            probabilities = new double[]{1,2,3,4,5,6,7,8,9,11,13,15,16};
        } 
        else {
            numbers = new String[]{"00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"};
            probabilities = new double[]{1, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.75, 9.5, 10.25, 11.5};
        }
        double totalWeight = 0;
        for (double probability : probabilities) {
            totalWeight += probability;
        }
        double random = Math.random() * totalWeight;
        double cumulativeWeight = 0;
        for (int i = 0; i < probabilities.length; i++) {
            cumulativeWeight += probabilities[i];
            if (random <= cumulativeWeight) {
                return numbers[i];
            }
        }
        // Par défaut, retourner le dernier nombre (ne devrait pas se produire normalement)
        return numbers[numbers.length - 1];
    }
}
