package com.foxyclan.jar;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    public String generateDNA() {                   // @Todo prendre les token id en paramettre 
        String Head = generateTraitDNA(16);
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

        String nftADN;
        try {
            nftADN = createNFT(adn);
            
            // Téléverser l'image générée à Filebase
            uploadToFilebase(nftADN + ".png", "NFT\\" + nftADN + ".png");

            // Générer et téléverser le fichier JSON des métadonnées
            String metadataFileName = createMetadataFile(adn, nftADN);
            uploadToFilebase(metadataFileName, "NFT\\" + metadataFileName);

        } catch(IOException e) {
            nftADN = "";
        }
        return nftADN;
    }

    private String generateTraitDNA(int interval) {
        Random random = new Random();
        int number = random.nextInt(interval); // Génère un nombre entre 0 et 15
        return String.format("%02d", number); // Formate le nombre en deux chiffres
    }

    private String createNFT(Map<String, String> adn) throws IOException {
        try {
            String name = adn.get("Head")
                        + adn.get("Mouth")
                        + adn.get("Eyes")
                        + adn.get("Clothes")
                        + adn.get("Fur")
                        + adn.get("Background");

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
            ImageIO.write(combined, "PNG", new File("jar\\src\\main\\resources\\NFT\\" + name + ".png"));
            System.out.println("Images superposées et enregistrées dans " + name + ".png");

            return name;

        } catch (IOException e) {
            e.printStackTrace();
            throw e;
        } 
    }



    private void uploadToFilebase(String fileName, String localFilePath) throws IOException {
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

        uploadFile(s3Client, bucketName, fileName, Path.of("jar\\src\\main\\resources\\" + localFilePath));
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



    private String createMetadataFile(Map<String, String> adn, String nftADN) throws IOException {
        Map<String, Object> metadata = new HashMap<>();
        
        String imageUrl = "https://foxyclan.s3.filebase.com/" + nftADN + ".png"; // @ToDo mettre le token id plus tard
        String description = "Foxy Clan is a unique collection of adorable and distinctive red pandas, celebrating their playful charm on the blockchain.";
        String name = "Foxy Clan #";

        metadata.put("image", imageUrl);
        metadata.put("description", description);
        metadata.put("name", name);
        metadata.put("DNA", nftADN);
        metadata.put("attributes", new Object[]{
            Map.of("value", adn.get("Background"), "trait_type", "Background"),
            Map.of("value", adn.get("Fur"), "trait_type", "Fur"),
            Map.of("value", adn.get("Eyes"), "trait_type", "Eyes"),
            Map.of("value", adn.get("Clothes"), "trait_type", "Clothes"),
            Map.of("value", adn.get("Head"), "trait_type", "Head Covering"),
            Map.of("value", adn.get("Mouth"), "trait_type", "Mouth")
        });

        String metadataFileName = nftADN + ".json";
        File metadataFile = new File("jar\\src\\main\\resources\\NFT\\" + metadataFileName);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(metadataFile, metadata);

        System.out.println("Fichier JSON des métadonnées créé : " + metadataFileName);
        return metadataFileName;
    }


    // @ToDo a voir pour plusieurs a la fois
     private void bulkUpload(S3Client s3Client, String bucketName, String folderPath) {
        try {
            Files.list(Paths.get(folderPath)).forEach(filePath -> {
                if (Files.isRegularFile(filePath)) {
                    String fileName = filePath.getFileName().toString();
                    uploadFile(s3Client, bucketName, fileName, filePath);
                }
            });
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
