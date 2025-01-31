package com.foxyclan.jar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class JarApplication {

	public static void main(String[] args) {
		SpringApplication.run(JarApplication.class, args);
		
		RandomADN rand = new RandomADN();
		/*
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
