package com.foxyclan.jar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class JarApplication {

	public static void main(String[] args) {
		//SpringApplication.run(JarApplication.class, args);
		RandomADN rand = new RandomADN();
		try {
			rand.generateDNA(1);
			rand.generateDNA(2);
		} catch(Exception e) {

		}
	}

}
