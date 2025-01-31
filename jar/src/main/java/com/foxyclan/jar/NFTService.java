package com.foxyclan.jar;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Service
public class NFTService {

    private static final String BUCKET_URL = "https://foxyclan.s3.filebase.com/";

    public List<NFT> getAvailableNFTs(int offset, int limit) {
        List<NFT> availableNFTs = new ArrayList<>();

        try {
            // Télécharger le XML du bucket Filebase
            URL url = URI.create(BUCKET_URL).toURL();
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(url.openStream());

            // Récupérer la liste des fichiers
            NodeList contents = document.getElementsByTagName("Key");

            List<String> nftIds = new ArrayList<>();
            for (int i = 0; i < contents.getLength(); i++) {
                String key = contents.item(i).getTextContent();
                if (key.endsWith(".json")) {
                    Integer id = Integer.parseInt(key.replace(".json", ""));
                    String imageKey = id + ".png";
                    if (containsFile(contents, imageKey)) {
                        availableNFTs.add(new NFT(id, "NFT #" + id, BUCKET_URL + "/" + imageKey));
                    }
                }
            }

            // Appliquer la pagination
            int end = Math.min(offset + limit, availableNFTs.size());
            return availableNFTs.subList(offset, end);

        } catch (Exception e) {
            e.printStackTrace();
            return availableNFTs;
        }
    }

    private boolean containsFile(NodeList contents, String fileName) {
        for (int i = 0; i < contents.getLength(); i++) {
            if (contents.item(i).getTextContent().equals(fileName)) {
                return true;
            }
        }
        return false;
    }
}

