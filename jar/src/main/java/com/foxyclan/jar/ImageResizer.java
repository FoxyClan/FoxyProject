package com.foxyclan.jar;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

public class ImageResizer {

    public static void resizeImagesInFolder(String folderPath) {
        File folder = new File(folderPath);
        if (!folder.exists() || !folder.isDirectory()) {
            System.out.println("Le chemin spécifié n'est pas un dossier valide.");
            return;
        }

        // Créer un dossier de sortie "resized" dans le même répertoire
        File outputFolder = new File(folderPath + File.separator + "resized");
        if (!outputFolder.exists()) {
            outputFolder.mkdir();
        }

        File[] files = folder.listFiles();
        if (files == null) {
            System.out.println("Aucune image trouvée dans le dossier.");
            return;
        }

        for (File file : files) {
            if (file.isFile() && isImage(file)) {
                try {
                    BufferedImage originalImage = ImageIO.read(file);
                    if (originalImage.getWidth() == 2000 && originalImage.getHeight() == 2000) {
                        BufferedImage resizedImage = resizeImage(originalImage, 1000, 1000);
                        File outputFile = new File(outputFolder, file.getName());
                        ImageIO.write(resizedImage, "png", outputFile);
                        System.out.println("Image redimensionnée : " + file.getName());
                    } else {
                        System.out.println("Image ignorée (pas 2000x2000) : " + file.getName());
                    }
                } catch (IOException e) {
                    System.out.println("Erreur lors du traitement de l'image : " + file.getName());
                    e.printStackTrace();
                }
            }
        }
        System.out.println("Redimensionnement terminé.");
    }

    private static BufferedImage resizeImage(BufferedImage originalImage, int width, int height) {
        BufferedImage resizedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = resizedImage.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.drawImage(originalImage.getScaledInstance(width, height, Image.SCALE_SMOOTH), 0, 0, width, height, null);
        g.dispose();
        return resizedImage;
    }

    private static boolean isImage(File file) {
        String[] extensions = { "jpg", "jpeg", "png", "gif", "bmp", "webp" };
        String fileName = file.getName().toLowerCase();
        for (String ext : extensions) {
            if (fileName.endsWith("." + ext)) {
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        String folderPath = "C:/chemin/vers/dossier/images"; // Remplace par ton chemin
        resizeImagesInFolder(folderPath);
    }
}
