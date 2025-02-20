package com.foxyclan.jar;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import org.springframework.stereotype.Service;

@Service
public class NftService {

    @Value("${filebase.accessKey}")
    private String accessKey;

    @Value("${filebase.secretKey}")
    private String secretKey;

    @Value("${filebase.endpointUrl}")
    private String endpointUrl;

    @Value("${filebase.bucketName}")
    private String bucketName;

    @Value("${filebase.baseUrl}")
    private String baseUrl;

    @PostConstruct
    public void testConfig() {
        System.out.println("Access Key : " + accessKey);
        System.out.println("Secret Key : " + secretKey);
        System.out.println("Endpoint URL : " + endpointUrl);
        System.out.println("Bucket Name : " + bucketName);
        System.out.println("Base URL : " + baseUrl);
    }

    
    public void createNFT(Map<String, String> adn, int tokenId) throws IOException {
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



    public void uploadToFilebase(String fileName) throws IOException {
        try {
            S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(java.net.URI.create(endpointUrl))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();

            uploadFile(s3Client, fileName, Path.of("jar\\src\\main\\resources\\tmp\\" + fileName));
        } catch(Exception e) {
            e.printStackTrace();
            throw new IOException("Erreur lors du téléversement du fichier : " + fileName, e);
        }
    }
        



    private void uploadFile(S3Client s3Client, String key, Path filePath) throws Exception {
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



    public Map<String, Object> createMetadataFile(Map<String, String> adn, int tokenId) throws IOException {
        try {
            Map<String, Object> metadata = new HashMap<>();
            TraitOptionsService traitOptionsService = new TraitOptionsService();
            
            String imageUrl = endpointUrl + tokenId + ".png";
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

    public Map<String, Object> fetchMetadataFromFilebase(int tokenId) throws IOException {
        String fileUrl = baseUrl + tokenId + ".json";
        System.out.println(fileUrl);

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            URL url = URI.create(fileUrl).toURL();
            return objectMapper.readValue(url, new TypeReference<Map<String, Object>>() {});
        } catch (MalformedURLException e) {
            throw new IOException("URL malformée pour le token " + tokenId, e);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des métadonnées du token " + tokenId);
            e.printStackTrace();
            return null;
        }
    }

    /* CLEAR TMP */

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
            
            String imageUrl = endpointUrl + "undiscovered.png";
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

    
}
