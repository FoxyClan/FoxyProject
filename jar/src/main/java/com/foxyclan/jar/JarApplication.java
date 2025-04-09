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
		String signature = "0x92b96757553c946f0ed6432c85ca8abb5da78b138ba879d3a155c3723ccad12d4241f7b81ad1707832df3806d6ce724620048c4a30f01b0bb30ce8b6f23ab01d1c";
		String message = "I confirm that I am the owner of this wallet and wish to reveal my undiscovered NFT (tokenId #0). Signing this message does not perform any blockchain transaction and is only used for verification.";
		try {
			String recovered = SignatureUtil.recover(message, signature);
			System.out.println("Recovered: " + recovered);
		} catch (Exception e) {
			System.out.println(e);
		}
		

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
