package com.foxyclan.jar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Map;
import java.util.HashMap;


@SpringBootApplication
public class JarApplication {

	public static void main(String[] args) {
		//SpringApplication.run(JarApplication.class, args);
		Mint mint = new Mint();
		Map<String, String> adn = new HashMap<>();
		adn.put("head covering", "06");
		adn.put("mouth", "05");
		adn.put("eyes", "04");
		adn.put("clothes", "03");
		adn.put("fur", "02");
		adn.put("background", "01");
		mint.NFT(adn);
	}

}
