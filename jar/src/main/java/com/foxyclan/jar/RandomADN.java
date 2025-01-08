package com.foxyclan.jar;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@RestController
public class RandomADN {
    
    @GetMapping("/adn")
    @CrossOrigin(origins = "http://localhost:4200")
    public Map<String, Object> generateDNA(@RequestParam int tokenId) throws IOException {        // @Todo gerer les meme adn, mettre les rareté, modifier les 
        String Head = generateTraitDNA(16);                               // noms dans le json, faire les traits impossible a combiner 
        String Mouth = generateTraitDNA(16);
        String Eyes = generateTraitDNA(16);
        String Clothes = generateTraitDNA(16);
        String Fur = generateTraitDNA(9);
        String Background = generateTraitDNA(13);

        Map<String, String> adn = new HashMap<>();
        adn.put("Head", Head);
        adn.put("Mouth", Mouth);
        adn.put("Eyes", Eyes);
        adn.put("Clothes", Clothes);
        adn.put("Fur", Fur);
        adn.put("Background", Background);

        Map<String, Object> response = new HashMap<>();
        try {
            createMetadataFile(adn, tokenId);
            uploadToFilebase(tokenId + ".json");

            createNFT(adn, tokenId);
            uploadToFilebase(tokenId + ".png");

            Path imagePath = Path.of("jar/src/main/resources/tmp/" + tokenId + ".png");
            String imageBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));
    
            // Créer les métadonnées
            Map<String, Object> metadata = createMetadataFile(adn, tokenId);
    
            response.put("image", imageBase64);
            response.put("metadata", metadata);

        } catch(IOException e) {
            e.printStackTrace();
            throw e;
        }
        return response;
    }

    private String generateTraitDNA(int interval) {
        Random random = new Random();
        int number = random.nextInt(interval); // Génère un nombre entre 0 et 15
        return "%02d".formatted(number); // Formate le nombre en deux chiffres
    }

    private void createNFT(Map<String, String> adn, int tokenId) throws IOException {
        try {
            BufferedImage background = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Background\\" + adn.get("Background") + ".png"));
            BufferedImage fur = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Fur\\" + adn.get("Fur") + ".png"));
            BufferedImage clothes = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Clothes\\" + adn.get("Clothes") + ".png"));
            BufferedImage eyes = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Eyes\\" + adn.get("Eyes") + ".png"));
            BufferedImage mouth = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Mouth\\" + adn.get("Mouth") + ".png"));
            BufferedImage headCovering = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\Head\\" + adn.get("Head") + ".png"));

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
            throw e;
        } 
    }



    private void uploadToFilebase(String fileName) throws IOException {
        String accessKey = "14BF7594BA96ADCC021B";
        String secretKey = "1mSomlS0ABFMBWA0kRb59iNzUxGDkjAW5pbXecHR";
        String endpointUrl = "https://s3.filebase.com";
        String bucketName = "foxyclan";

        S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(java.net.URI.create(endpointUrl))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();

        uploadFile(s3Client, bucketName, fileName, Path.of("jar\\src\\main\\resources\\tmp\\" + fileName));
    }



    private void uploadFile(S3Client s3Client, String bucketName, String key, Path filePath) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.putObject(putObjectRequest, filePath);
            System.out.println("Fichier téléversé : " + key);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Échec du téléversement pour : " + key);
        }
    }



    private Map<String, Object> createMetadataFile(Map<String, String> adn, int tokenId) throws IOException {
        Map<String, Object> metadata = new HashMap<>();
        
        String imageUrl = "https://foxyclan.s3.filebase.com/" + tokenId + ".png"; // @ToDo mettre le token id plus tard
        String description = "Foxy Clan is a unique collection of adorable and distinctive red pandas, celebrating their playful charm on the blockchain.";
        String name = "Foxy Clan #" + tokenId;
        String nftADN = adn.get("Head")
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
            Map.of("trait_type", "Head Covering", "value", adn.get("Head")),
            Map.of("trait_type", "Mouth", "value", adn.get("Mouth")),
            Map.of("trait_type", "Eyes", "value", adn.get("Eyes")),
            Map.of("trait_type", "Clothes", "value", adn.get("Clothes")),
            Map.of("trait_type", "Fur", "value", adn.get("Fur")),
            Map.of("trait_type", "Background", "value", adn.get("Background"))
        });

        File metadataFile = new File("jar\\src\\main\\resources\\tmp\\" + tokenId + ".json");

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(metadataFile, metadata);

        System.out.println("Fichier JSON des métadonnées créé : " + tokenId + ".json");

        return metadata;
    }
}
