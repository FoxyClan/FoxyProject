package com.foxyclan.jar;

import java.io.IOException;

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
		
		
	}

	@PostConstruct
    public void runAfterStartup() throws IOException {
        //mergeService.generateMergedDNA(0, 1, 15);
    }

}
