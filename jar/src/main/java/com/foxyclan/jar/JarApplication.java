package com.foxyclan.jar;

import java.io.IOException;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class JarApplication {

	public static void main(String[] args) throws IOException {
		SpringApplication.run(JarApplication.class, args);
		
		
		MergeService merge = new MergeService();

		merge.generateMergedDNA(0, 1, 15);
		/*
		NftService rand = new NftService();
		int[] tab = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		for(int i=0; i<20000; i++) {
			tab[Integer.parseInt(rand.generateTraitDNA("background"))] += 1;
		}
		for(int i=0; i<tab.length; i++) {
			System.out.println(tab[i]);
		}
		*/
		/*
		for(int i = 0; i<100; i++) {
			try {
				rand.createUndiscoveredMetadataFile(i);
			} catch (Exception e) {
				System.out.println("Erreur : " + i);
				throw null;
			}
		}
		*/
		
	}

}
