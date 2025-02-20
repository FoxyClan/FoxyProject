package com.foxyclan.jar;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@RestController
public class NftService {
    
    @GetMapping("/adn")
    @CrossOrigin(origins = "http://localhost:4200")
    public Map<String, Object> generateDNA(@RequestParam int tokenId) throws IOException {        // @Todo gerer les meme adn, modifier les 
        String Head = generateTraitDNA("");                                                 // noms dans le json, faire les traits impossible a combiner 
        String Mouth = generateTraitDNA("");
        String Eyes = generateTraitDNA("");
        String Clothes = generateTraitDNA("");
        String Fur = generateTraitDNA("fur");
        String Background = generateTraitDNA("background");

        Map<String, String> adn = new HashMap<>();
        adn.put("Head Covering", Head);
        adn.put("Mouth", Mouth);
        adn.put("Eyes", Eyes);
        adn.put("Clothes", Clothes);
        adn.put("Fur", Fur);
        adn.put("Background", Background);

        Map<String, Object> response = new HashMap<>();
        try {
            createNFT(adn, tokenId);
            uploadToFilebase(tokenId + ".png");

            createMetadataFile(adn, tokenId);
            uploadToFilebase(tokenId + ".json");

            Path imagePath = Path.of("jar/src/main/resources/tmp/" + tokenId + ".png");
            String imageBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));
    
            Map<String, Object> metadata = createMetadataFile(adn, tokenId);
    
            response.put("image", imageBase64);
            response.put("metadata", metadata);

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

    private void createNFT(Map<String, String> adn, int tokenId) throws IOException {
        try {
            BufferedImage background = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Background\\" + adn.get("Background") + ".png"));
            BufferedImage fur = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Fur\\" + adn.get("Fur") + ".png"));
            BufferedImage clothes = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Clothes\\" + adn.get("Clothes") + ".png"));
            BufferedImage eyes = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Eyes\\" + adn.get("Eyes") + ".png"));
            BufferedImage mouth = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Mouth\\" + adn.get("Mouth") + ".png"));
            BufferedImage headCovering = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Head\\" + adn.get("Head Covering") + ".png"));

            BufferedImage combined = new BufferedImage(2000, 2000, BufferedImage.TYPE_INT_ARGB);

            // Superposition des images
            Graphics2D g = combined.createGraphics();
            g.drawImage(background, 0, 0, null);
            g.drawImage(fur, 0, 0, null);
            g.drawImage(clothes, 0, 0, null);
            g.drawImage(eyes, 0, 0, null);
            g.drawImage(mouth, 0, 0, null);
            g.drawImage(headCovering, 0, 0, null);
            
            // Libérer les ressources du Graphics2D
            g.dispose();

            // Sauvegarder le résultat de la superposition dans un nouveau fichier
            ImageIO.write(combined, "PNG", new File("jar\\src\\main\\resources\\tmp\\" + tokenId + ".png"));
            System.out.println("Images superposées et enregistrées dans : " + tokenId + ".png");

        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException("Erreur lors de la création du NFT : tokenID = " + tokenId, e);
        } 
    }



    private void uploadToFilebase(String fileName) throws IOException {
        String accessKey = "14BF7594BA96ADCC021B";
        String secretKey = "1mSomlS0ABFMBWA0kRb59iNzUxGDkjAW5pbXecHR";
        String endpointUrl = "https://s3.filebase.com";
        String bucketName = "foxyclan";

        try {
            S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(java.net.URI.create(endpointUrl))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();

            uploadFile(s3Client, bucketName, fileName, Path.of("jar\\src\\main\\resources\\tmp\\" + fileName));
        } catch(Exception e) {
            e.printStackTrace();
            throw new IOException("Erreur lors du téléversement du fichier : " + fileName, e);
        }
    }
        



    private void uploadFile(S3Client s3Client, String bucketName, String key, Path filePath) throws Exception {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.putObject(putObjectRequest, filePath);
            System.out.println("Fichier téléversé : " + key);
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Erreur lors du téléversement du fichier : " + key, e);
        }
    }



    private Map<String, Object> createMetadataFile(Map<String, String> adn, int tokenId) throws IOException {
        try {
            Map<String, Object> metadata = new HashMap<>();
            TraitOptionsService traitOptionsService = new TraitOptionsService();
            
            String imageUrl = "https://foxyclan.s3.filebase.com/" + tokenId + ".png";
            String description = "Foxy Clan is a unique collection of adorable and distinctive red pandas, celebrating their playful charm on the blockchain.";
            String name = "Foxy Clan #" + tokenId;
            String nftADN = adn.get("Head Covering")
                            + adn.get("Mouth")
                            + adn.get("Eyes")
                            + adn.get("Clothes")
                            + adn.get("Fur")
                            + adn.get("Background");
    
            metadata.put("image", imageUrl);
            metadata.put("description", description);
            metadata.put("name", name);
            metadata.put("DNA", nftADN);
            metadata.put("attributes", new Object[]{
                Map.of("trait_type", "Head Covering", "value", traitOptionsService.getTraitOption("headcovering", Integer.parseInt(adn.get("Head Covering")))),
                Map.of("trait_type", "Mouth", "value", traitOptionsService.getTraitOption("mouth", Integer.parseInt(adn.get("Mouth")))),
                Map.of("trait_type", "Eyes", "value", traitOptionsService.getTraitOption("eyes", Integer.parseInt(adn.get("Eyes")))),
                Map.of("trait_type", "Clothes", "value", traitOptionsService.getTraitOption("clothes", Integer.parseInt(adn.get("Clothes")))),
                Map.of("trait_type", "Fur", "value", traitOptionsService.getTraitOption("fur", Integer.parseInt(adn.get("Fur")))),
                Map.of("trait_type", "Background", "value", traitOptionsService.getTraitOption("background", Integer.parseInt(adn.get("Background"))))
            });
    
            File metadataFile = new File("jar\\src\\main\\resources\\tmp\\" + tokenId + ".json");
    
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.writeValue(metadataFile, metadata);
    
            System.out.println("Fichier JSON des métadonnées créé : " + tokenId + ".json");
    
            return metadata;
        } catch (IOException e) {
            System.err.println("Erreur lors de la création du fichier JSON pour le token " + tokenId);
            e.printStackTrace();
            if (e instanceof JsonProcessingException) {
                throw new IOException("Erreur lors du traitement JSON pour le token " + tokenId, e);
            }
            throw e;
        } catch (Exception e) {
            System.err.println("Une erreur inattendue s'est produite lors de la création des métadonnées pour le token " + tokenId);
            e.printStackTrace();
            throw new IOException("Erreur inconnue lors de la création des métadonnées pour le token " + tokenId, e);
        }
    }

    @DeleteMapping("/clear-tmp")
    @CrossOrigin(origins = "http://localhost:4200")
    public void clearOldTmpFiles() {
        try {
            File tmpDir = new File("jar\\src\\main\\resources\\tmp");
            long currentTime = System.currentTimeMillis();

            if (tmpDir.exists() && tmpDir.isDirectory()) {
                for (File file : tmpDir.listFiles()) {
                    if (currentTime - file.lastModified() > 30 * 60 * 1000) { // 30 minutes
                        if (!file.delete()) {
                            System.err.println("Impossible de supprimer le fichier : " + file.getName());
                        }
                    }
                }
            } else {
                System.err.println("Le répertoire tmp n'existe pas ou n'est pas valide.");
            }
        } catch (SecurityException se) {
            System.err.println("Erreur de sécurité lors de la suppression des fichiers : " + se.getMessage());
            se.printStackTrace();
        } catch (Exception e) {
            System.err.println("Erreur inconnue lors de la suppression des fichiers : " + e.getMessage());
            e.printStackTrace();
        }
    }



    /* UNDISCOVERED */




    public void createUndiscoveredMetadataFile(int tokenId) throws IOException {
        try {
            Map<String, Object> metadata = new HashMap<>();
            
            String imageUrl = "https://foxyclan.s3.filebase.com/undiscovered.png";
            String description = "A mysterious member of the Foxy Clan, waiting to reveal its unique traits. Will it be a rare gem or a playful companion? Only time will tell as the secrets of this red panda are uncovered. Visit our website to unveil it !";
            String name = "Foxy Clan #" + tokenId;
    
            metadata.put("image", imageUrl);
            metadata.put("description", description);
            metadata.put("name", name);
    
            File metadataFile = new File(tokenId + ".json");
    
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.writeValue(metadataFile, metadata);
    
            System.out.println("Fichier JSON des métadonnées créé : " + tokenId + ".json");
            this.uploadUndiscoveredToFilebase(tokenId + ".json", metadataFile);
        } catch (IOException e) {
            System.err.println("Erreur lors de la création du fichier JSON pour le token " + tokenId);
            e.printStackTrace();
            if (e instanceof JsonProcessingException) {
                throw new IOException("Erreur lors du traitement JSON pour le token " + tokenId, e);
            }
            throw e;
        } catch (Exception e) {
            System.err.println("Une erreur inattendue s'est produite lors de la création des métadonnées pour le token " + tokenId);
            e.printStackTrace();
            throw new IOException("Erreur inconnue lors de la création des métadonnées pour le token " + tokenId, e);
        }
    }

    private void uploadUndiscoveredToFilebase(String fileName, File file) throws IOException {
        String accessKey = "14BF7594BA96ADCC021B";
        String secretKey = "1mSomlS0ABFMBWA0kRb59iNzUxGDkjAW5pbXecHR";
        String endpointUrl = "https://s3.filebase.com";
        String bucketName = "foxyclan";

        try {
            S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(java.net.URI.create(endpointUrl))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();

                Path filePath = file.toPath();
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

            s3Client.putObject(putObjectRequest, filePath);
            System.out.println("Fichier téléversé : " + fileName);
        } catch(Exception e) {
            e.printStackTrace();
            throw new IOException("Erreur lors du téléversement du fichier : " + fileName, e);
        }
    }


    /* MERGE  */

    
    @GetMapping("/merge")
    @CrossOrigin(origins = "http://localhost:4200")
    public Map<String, Object> generateMergedDNA(@RequestParam int tokenId1, @RequestParam int tokenId2, @RequestParam int newTokenId) throws IOException {
        if(tokenId1 == tokenId2) throw new IOException("Les deux tokens doivent être différents");
        // Récupérer les métadonnées des deux tokens depuis Filebase
        Map<String, Object> metadata1 = fetchMetadataFromFilebase(tokenId1);
        Map<String, Object> metadata2 = fetchMetadataFromFilebase(tokenId2);

        if (metadata1 == null || metadata2 == null) {
            throw new IOException("Impossible de récupérer les métadonnées de l'un des tokens");
        }

        // Comparer les traits et choisir les meilleurs
        TraitOptionsService traitService = new TraitOptionsService();
        Map<String, String> mergedTraits = new HashMap<>();

        String[] traitTypes = {"Head Covering", "Mouth", "Eyes", "Clothes", "Fur", "Background"};

        for (String trait : traitTypes) {
            String traitValue1 = getTraitValue(metadata1, trait);
            String traitValue2 = getTraitValue(metadata2, trait);
            
            // Comparer les indices et prendre le meilleur trait
            String bestTrait = getBestTrait(traitService, trait, traitValue1, traitValue2);
            mergedTraits.put(trait, bestTrait);
        }

        // Générer la nouvelle image du NFT fusionné
        createNFT(mergedTraits, newTokenId);
        uploadToFilebase(newTokenId + ".png");

        // Générer les métadonnées du nouveau NFT
        Map<String, Object> mergedMetadata = createMetadataFile(mergedTraits, newTokenId);
        uploadToFilebase(newTokenId + ".json");

        // Retourner les nouvelles métadonnées et l'image en Base64
        Path imagePath = Path.of("jar/src/main/resources/tmp/" + newTokenId + ".png");
        String imageBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));

        Map<String, Object> response = new HashMap<>();
        response.put("image", imageBase64);
        response.put("metadata", mergedMetadata);

        return response;
    }

    private Map<String, Object> fetchMetadataFromFilebase(int tokenId) throws IOException {
        String fileUrl = "https://foxyclan.s3.filebase.com/" + tokenId + ".json";

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(new java.net.URL(fileUrl), Map.class);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des métadonnées du token " + tokenId);
            e.printStackTrace();
            return null;
        }
    }

    private String getTraitValue(Map<String, Object> metadata, String traitType) {
    List<Map<String, String>> attributes = (List<Map<String, String>>) metadata.get("attributes");

    for (Map<String, String> attribute : attributes) {
        if (attribute.get("trait_type").equals(traitType)) {
            return attribute.get("value");
        }
    }
    return null;
    }

    public String getBestTrait(TraitOptionsService traitService, String category, String value1, String value2) {
        int index1 = traitService.getTraitIndex(category, value1);
        int index2 = traitService.getTraitIndex(category, value2);

        int bestIndex = Math.min(index1, index2);
        return String.format("%02d", bestIndex);
    }


    
}
