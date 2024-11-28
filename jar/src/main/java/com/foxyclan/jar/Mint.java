package com.foxyclan.jar;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Map;

public class Mint {
    public void NFT(Map<String, String> adn) {
        try {
            String name = adn.get("head covering")
                        + adn.get("mouth")
                        + adn.get("eyes")
                        + adn.get("clothes")
                        + adn.get("fur")
                        + adn.get("background");

            // Charger les images a1 et b1 depuis des fichiers
            BufferedImage background = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\" + adn.get("background") + ".png"));
            BufferedImage fur = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\" + adn.get("fur") + ".png"));
            BufferedImage clothes = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\" + adn.get("clothes") + ".png"));
            BufferedImage eyes = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\" + adn.get("eyes") + ".png"));
            BufferedImage mouth = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\" + adn.get("mouth") + ".png"));
            BufferedImage headCovering = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\" + adn.get("head covering") + ".png"));

            // Créer une nouvelle image avec les mêmes dimensions que a1
            BufferedImage combined = new BufferedImage(background.getWidth(), background.getHeight(), BufferedImage.TYPE_INT_ARGB);

            

            // Dessiner l'image a1 comme couche de base
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
        } catch (IOException e) {
            e.printStackTrace();
        } 
    }
}
