package com.foxyclan.jar;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class Mint {
    public void NFT() {
        try {
            String name = "a1";
            // Charger les images a1 et b1 depuis des fichiers
            BufferedImage a1 = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\c01.png"));
            BufferedImage b1 = ImageIO.read(new File("jar\\src\\main\\resources\\NFT\\hc01.png"));

            // Créer une nouvelle image avec les mêmes dimensions que a1
            BufferedImage combined = new BufferedImage(a1.getWidth(), a1.getHeight(), BufferedImage.TYPE_INT_ARGB);

            // Dessiner l'image a1 comme couche de base
            Graphics2D g = combined.createGraphics();
            g.drawImage(a1, 0, 0, null);

            // Superposer l'image b1 par-dessus
            g.drawImage(b1, 0, 0, null);

            // Libérer les ressources du Graphics2D
            g.dispose();

            // Sauvegarder le résultat de la superposition dans un nouveau fichier
            ImageIO.write(combined, "PNG", new File("jar\\src\\main\\resources\\NFT\\" + name + ".png"));
            System.out.println("Images superposées et enregistrées dans result.png");
        } catch (IOException e) {
            e.printStackTrace();
        } 
    }
}
