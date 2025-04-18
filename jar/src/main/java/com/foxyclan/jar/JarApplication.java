package com.foxyclan.jar;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;


@SpringBootApplication
public class JarApplication {

	//@Autowired
    //private MergeService mergeService; // Injecte MergeService

	public static void main(String[] args) throws IOException {
		SpringApplication.run(JarApplication.class, args);
		/*
		int[] tab = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		for(int i=0; i<20000; i++) {
			tab[Integer.parseInt(rand.generateTraitDNA("background"))] += 1;
		}
		for(int i=0; i<tab.length; i++) {
			System.out.println(tab[i]);
		}
		*/
		// Valeurs fixes pour Background, Fur et Clothes
        String background = "00";
        String fur = "09";
        String clothes = "00";

        // Listes de tous les codes possibles (à ajuster / filtrer si besoin)
        String[] eyesArray = {
            "05","07"
        };
        String[] mouthsArray = {
            "03","04","05","07","08"
        };
        String[] headsArray = {
            "03","04","05","06","07","12","13"
        };

        NftService service = new NftService();
        int tokenId = 1;

        // Tester toutes les combinaisons Eyes x Mouth x Head
        for (String eyes : eyesArray) {
            for (String mouth : mouthsArray) {
                for (String head : headsArray) {
                    Map<String, String> dna = new HashMap<>();
                    dna.put("Background", background);
                    dna.put("Fur", fur);
                    dna.put("Clothes", clothes);
                    dna.put("Eyes", eyes);
                    dna.put("Mouth", mouth);
                    dna.put("Head Covering", head);
					dna.put("Transcendence", "01");

                    // Génère l’image pour la combinaison actuelle
                    service.createImageFile(dna, tokenId);
                    tokenId++;
                }
            }
        }
		
		
	}

	@PostConstruct
    public void runAfterStartup() throws IOException {
        //mergeService.generateMergedDNA(0, 1, 15);
    }

}
