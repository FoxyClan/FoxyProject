package com.foxyclan.jar;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthBlock;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.EthLog;
import org.web3j.protocol.http.HttpService;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import org.springframework.stereotype.Service;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Address;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.Log;
import java.math.BigInteger;

@Service
@CrossOrigin(origins = "http://localhost:4200")
public class NftService {
    //private final Web3j web3 = Web3j.build(new HttpService("https://mainnet.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35"));
    private final Web3j web3 = Web3j.build(new HttpService("https://sepolia.infura.io/v3/16c76dc3448e4b96a41e908703fa0b35"));

    private final String contractAddress = "0x0839A1f8b8742bBD99a7CDD3429D6FA52Bcb2D62";

    @Value("${filebase.accessKey}")
    private String accessKey;

    @Value("${filebase.secretKey}")
    private String secretKey;

    @Value("${filebase.endpointUrl}")
    private String endpointUrl;

    @Value("${filebase.foxyBucket}")
    private String foxyBucket;

    @Value("${filebase.foxyBaseUrl}")
    private String foxyBaseUrl;

    @Value("${filebase.dnaBucket}")
    private String dnaBucket;

    @Value("${filebase.dnaBaseUrl}")
    private String dnaBaseUrl;

    
    
    public void createImageFile(Map<String, String> adn, int tokenId) throws IOException {
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

            if (adn.containsKey("Transcendence")) {
                String transcendencePath = "jar\\src\\main\\resources\\NFT\\evo\\" + adn.get("Transcendence") + ".png";
                File transcendenceFile = new File(transcendencePath);
                if (transcendenceFile.exists()) { // Vérifie si le fichier de transcendence existe avant de l'ajouter
                    BufferedImage transcendence = ImageIO.read(transcendenceFile);
                    g.drawImage(transcendence, 0, 0, null);
                    System.out.println("Transcendence appliquée : " + adn.get("Transcendence"));
                } else {
                    System.out.println("Fichier de la transcendence introuvable : " + transcendencePath);
                }
            }
            
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
                .bucket(foxyBucket)
                .key(key)
                .build();

            s3Client.putObject(putObjectRequest, filePath);
            System.out.println("Fichier téléversé : " + key);
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Erreur lors du téléversement du fichier : " + key, e);
        }
    }



    public Map<String, Object> createMetadataFile(Map<String, String> dna, int tokenId) throws IOException {
        try {
            Map<String, Object> metadata = new HashMap<>();
            TraitOptionsService traitOptionsService = new TraitOptionsService();
            
            String imageUrl = "ipfs://" + this.getCIDFromFilebase(tokenId + ".png");
            String description = "Foxy Clan is a unique collection of adorable and distinctive red pandas, celebrating their playful charm on the blockchain.";
            String name = "Foxy Clan #" + tokenId;
            String nftDna = dna.get("Head Covering")
                            + dna.get("Mouth")
                            + dna.get("Eyes")
                            + dna.get("Clothes")
                            + dna.get("Fur")
                            + dna.get("Background");
            if (dna.containsKey("Transcendence")) {
                nftDna = nftDna + dna.get("Transcendence");
            }
    
            metadata.put("image", imageUrl);
            metadata.put("description", description);
            metadata.put("name", name);
            metadata.put("DNA", nftDna);

            List<Map<String, Object>> attributes = new ArrayList<>();
            attributes.add(Map.of("value", traitOptionsService.getTraitOption("headcovering", Integer.parseInt(dna.get("Head Covering"))), "trait_type", "Head Covering"));
            attributes.add(Map.of("trait_type", "Mouth", "value", traitOptionsService.getTraitOption("mouth", Integer.parseInt(dna.get("Mouth")))));
            attributes.add(Map.of("trait_type", "Eyes", "value", traitOptionsService.getTraitOption("eyes", Integer.parseInt(dna.get("Eyes")))));
            attributes.add(Map.of("trait_type", "Clothes", "value", traitOptionsService.getTraitOption("clothes", Integer.parseInt(dna.get("Clothes")))));
            attributes.add(Map.of("trait_type", "Fur", "value", traitOptionsService.getTraitOption("fur", Integer.parseInt(dna.get("Fur")))));
            attributes.add(Map.of("trait_type", "Background", "value", traitOptionsService.getTraitOption("background", Integer.parseInt(dna.get("Background")))));

            if (dna.containsKey("Transcendence")) {
                attributes.add(Map.of("trait_type", "Transcendence", "value", traitOptionsService.getTraitOption("transcendence", Integer.parseInt(dna.get("Transcendence")))));
            }

            metadata.put("attributes", attributes);
    
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
        String fileUrl = foxyBaseUrl + tokenId + ".json";
        System.out.println(fileUrl);

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            URL url = URI.create(fileUrl).toURL();
            return objectMapper.readValue(url, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (MalformedURLException e) {
            throw new IOException("URL malformée pour le token " + tokenId, e);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des métadonnées du token " + tokenId);
            e.printStackTrace();
            return null;
        }
    }



    public boolean addDna(String newAdn, int tokenId) throws IOException {
        String bucket = dnaBucket; // Bucket sur Filebase
        String fileName = newAdn.substring(0, 10) + ".json"; // Fichier ADN unique
        ObjectMapper objectMapper = new ObjectMapper();

        S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(URI.create(endpointUrl))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .build();
            s3Client.headObject(headObjectRequest);
            System.out.println("L'ADN " + newAdn + " existe déjà sur Filebase");
            return false; // ADN déjà existant
        } catch (NoSuchKeyException e) {
            System.out.println("L'ADN " + newAdn + " n'existe pas encore. Création du fichier...");
        } catch (Exception e) {
            System.err.println("Erreur lors de la vérification du fichier ADN sur Filebase.");
            e.printStackTrace();
            return false;
        }

        Map<Integer, String> adnMapping = new HashMap<>();
        adnMapping.put(tokenId, newAdn);

        // Création d'un fichier temporaire contenant le mapping
        File tempFile = new File("jar/src/main/resources/tmp/" + fileName);
        objectMapper.writeValue(tempFile, adnMapping);
        
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .build();

            s3Client.putObject(putObjectRequest, Path.of(tempFile.getPath()));
            System.out.println("ADN ajouté avec succès : " + newAdn + " -> TokenID: " + tokenId);
            return true;
        } catch (Exception e) {
            System.err.println("Erreur lors de l'upload du fichier ADN sur Filebase !");
            e.printStackTrace();
            return false;
        }
    }


    public void deleteNftFiles(int tokenId1, int tokenId2) throws IOException {
        try {
            S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(java.net.URI.create(endpointUrl))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    
            //deleteFileFromFilebase(s3Client, foxyBucket, tokenId1 + ".png");
            deleteFileFromFilebase(s3Client, foxyBucket, tokenId1 + ".json");
            //deleteFileFromFilebase(s3Client, foxyBucket, tokenId2 + ".png");
            deleteFileFromFilebase(s3Client, foxyBucket, tokenId2 + ".json");
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new IOException("Erreur lors de la suppression des fichiers pour les tokens " + tokenId1 + " et " + tokenId2, e);
        }
    }
    
    private void deleteFileFromFilebase(S3Client s3Client, String bucketName, String fileName) throws Exception {
        try {
            s3Client.deleteObject(builder -> builder.bucket(bucketName).key(fileName).build());
            System.out.println("Fichier supprimé : " + fileName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Erreur lors de la suppression du fichier : " + fileName, e);
        }
    }
    


    /* CLEAR TMP */

    public void clearOldTmpFiles() {
        try {
            File tmpDir = new File("jar\\src\\main\\resources\\tmp");
            long currentTime = System.currentTimeMillis();

            if (tmpDir.exists() && tmpDir.isDirectory()) {
                for (File file : tmpDir.listFiles()) {
                    if (currentTime - file.lastModified() > 30 * 60 * 1000) { // 30 min
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


    /* METADATA */


    public boolean existNft(int tokenId) throws IOException { // faire return false ou true a la place
        try {
            S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(URI.create(endpointUrl))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    
            String fileName = tokenId + ".json";
            try {
                HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(foxyBucket)
                    .key(fileName)
                    .build();
                s3Client.headObject(headObjectRequest);
            } catch (NoSuchKeyException e) {
                return false;
            }
            return true;
        } catch (Exception e) {
            throw e;
        }
    }


    public boolean isUndiscoveredNft(int tokenId) throws IOException {
        try {
            String fileName = tokenId + ".json";
            
            String fileUrl = foxyBaseUrl + fileName;
            ObjectMapper objectMapper = new ObjectMapper();
            URL url = URI.create(fileUrl).toURL();
            Map<String, Object> metadata = objectMapper.readValue(url, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
    
            // Vérifier si l'image correspond à undiscovered.png
            String expectedImageUrl = foxyBaseUrl + "undiscovered.png";
            if (metadata.containsKey("image") && expectedImageUrl.equals(metadata.get("image"))) {
                return true;
            }
            return false;
        } catch (MalformedURLException e) {
            throw new IOException("URL malformée pour le token " + tokenId);
        } catch (Exception e) {
            throw e;
        }
    }


    public String getCIDFromFilebase(String fileName) {
        try {
            String urlString = foxyBaseUrl + fileName;
            URI uri = new URI(urlString);
            URL url = uri.toURL();

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("HEAD");
            conn.setRequestProperty("X-API-KEY", secretKey);

            // Vérifier la réponse HTTP
            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                // Lire l'en-tête x-amz-meta-cid
                Map<String, java.util.List<String>> headers = conn.getHeaderFields();
                if (headers.containsKey("x-amz-meta-cid")) {
                    System.out.println("CID : " + headers.get("x-amz-meta-cid").get(0));
                    return headers.get("x-amz-meta-cid").get(0);
                } else {
                    System.out.println("CID non trouvé dans les en-têtes.");
                }
            } else {
                System.err.println("Erreur HTTP : " + responseCode);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }



    /* CONTRACT */



    @SuppressWarnings("rawtypes")
    public String getOwnerOf(int tokenId) throws Exception {
        Function function = new Function(
                "ownerOf",
                List.of(new Uint256(BigInteger.valueOf(tokenId))),
                List.of(new TypeReference<Address>() {})
        );

        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response = web3.ethCall(
                org.web3j.protocol.core.methods.request.Transaction.createEthCallTransaction(
                        null, contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST
        ).send();

        List<Type> result = FunctionReturnDecoder.decode(
                response.getResult(), function.getOutputParameters());

        if (result.isEmpty()) throw new Exception("Aucun propriétaire trouvé pour le tokenId " + tokenId);

        return result.get(0).getValue().toString();
    }



    @SuppressWarnings("rawtypes")
    public String getMintTransactionHash(int tokenId) throws Exception {
        String eventSignature = org.web3j.crypto.Hash.sha3String("Transfer(address,address,uint256)");
        String tokenIdHex = "0x" + String.format("%064x", tokenId);
        String fromZeroAddressTopic = "0x0000000000000000000000000000000000000000000000000000000000000000";
    
        // On ne filtre que par event signature (topic0)
        EthFilter filter = new EthFilter(
                DefaultBlockParameterName.EARLIEST,
                DefaultBlockParameterName.LATEST,
                contractAddress
        );
        filter.addSingleTopic(eventSignature); // topic[0] = Transfer signature
    
        EthLog ethLog = web3.ethGetLogs(filter).send();
        List<EthLog.LogResult> logs = ethLog.getLogs();
    
        if (logs == null || logs.isEmpty()) {
            throw new Exception("Aucun log trouvé sur le contrat.");
        }
    
        for (EthLog.LogResult rawLog : logs) {
            if (rawLog instanceof EthLog.LogObject logObj) {
                Log log = logObj.get();
                List<String> topics = log.getTopics();
    
                // Vérification des conditions de mint
                if (topics.size() >= 4) {
                    String fromTopic = topics.get(1);
                    String tokenIdTopic = topics.get(3);
    
                    if (fromTopic.equalsIgnoreCase(fromZeroAddressTopic) && tokenIdTopic.equalsIgnoreCase(tokenIdHex)) {
                        return log.getTransactionHash();
                    }
                }
            }
        }
        throw new Exception("Aucune transaction de mint trouvée pour le tokenId " + tokenId);
    }
    
    
    


    public void verifyMintTransaction(int tokenId) throws Exception {
        try {
            EthGetTransactionReceipt receiptResponse = web3.ethGetTransactionReceipt(getMintTransactionHash(tokenId)).send();
            if (receiptResponse.getTransactionReceipt().isPresent()) {
                EthBlock block = web3.ethGetBlockByHash(receiptResponse.getTransactionReceipt().get().getBlockHash(), false).send();
                long timestampBlock = block.getBlock().getTimestamp().longValueExact() * 1000L; // millis
                long now = System.currentTimeMillis();

                if ((now - timestampBlock) > 180_000) { // 3 minutes
                    throw new SecurityException("Mint trop ancien : sécurité rejetée.");
                }
                long delta = now - timestampBlock;
                System.out.println("Transaction trouvé et récente : Il y a " + delta / 1000 + " secondes");
            } else {
                throw new SecurityException("Impossible de retrouver la transaction de mint.");
            }
        } catch(Exception e) {
            throw e;
        }
    }

    public void verifyMergeTransaction(int tokenId1, int tokenId2, int newTokenId, String walletAddress) throws Exception {
        String eventSignature = org.web3j.crypto.Hash.sha3String("Merge(address,uint256,uint256,uint256)");
        String tokenId1Hex = "0x" + String.format("%064x", tokenId1);
        String tokenId2Hex = "0x" + String.format("%064x", tokenId2);
        String newTokenIdHex = "0x" + String.format("%064x", newTokenId);
        String ownerHex = "0x" + String.format("%064x", new java.math.BigInteger(walletAddress.substring(2), 16));
    
        EthFilter filter = new EthFilter(
            DefaultBlockParameterName.EARLIEST,
            DefaultBlockParameterName.LATEST,
            contractAddress
        );
        filter.addSingleTopic(eventSignature);
    
        EthLog logs = web3.ethGetLogs(filter).send();
    
        for (EthLog.LogResult<?> logResult : logs.getLogs()) {
            EthLog.LogObject log = (EthLog.LogObject) logResult;
            List<String> topics = log.getTopics();
    
            if (topics.size() < 4) continue;
    
            // topics[1] = owner, topics[2] = tokenIdBurned1, topics[3] = tokenIdBurned2
            String ownerTopic = topics.get(1);
            String tokenBurned1Topic = topics.get(2);
            String tokenBurned2Topic = topics.get(3);
    
            // Check if this event matches the given parameters (order of tokenId1/tokenId2 doesn't matter)
            boolean matchTokens = (tokenBurned1Topic.equalsIgnoreCase(tokenId1Hex) && tokenBurned2Topic.equalsIgnoreCase(tokenId2Hex)) ||
                                  (tokenBurned1Topic.equalsIgnoreCase(tokenId2Hex) && tokenBurned2Topic.equalsIgnoreCase(tokenId1Hex));
    
            if (ownerTopic.equalsIgnoreCase(ownerHex) && matchTokens) {
                // Now check the newTokenId in data
                String data = log.getData();
                if (data == null || data.length() < 66) continue;
    
                String newTokenIdExtractedHex = "0x" + data.substring(data.length() - 64);
                if (!newTokenIdExtractedHex.equalsIgnoreCase(newTokenIdHex)) continue;
    
                EthGetTransactionReceipt receipt = web3.ethGetTransactionReceipt(log.getTransactionHash()).send();
                if (receipt.getTransactionReceipt().isEmpty()) throw new SecurityException("Impossible de retrouver la transaction de merge.");
    
                EthBlock block = web3.ethGetBlockByHash(receipt.getTransactionReceipt().get().getBlockHash(), false).send();
                long timestampBlock = block.getBlock().getTimestamp().longValueExact() * 1000L; // millis
                long now = System.currentTimeMillis();
    
                if ((now - timestampBlock) > 180_000) {
                    throw new SecurityException("Merge trop ancien : sécurité rejetée.");
                }
    
                System.out.println("Merge validé. Il y a " + (now - timestampBlock) / 1000 + " secondes");
                return;
            }
        }
    
        throw new SecurityException("Aucune transaction de merge valide trouvée pour l'adresse et les tokens donnés.");
    }
    
}
