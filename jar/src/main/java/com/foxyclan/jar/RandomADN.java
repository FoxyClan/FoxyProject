package com.foxyclan.jar;

import org.springframework.web.bind.annotation.RestController;

import java.util.Random;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class RandomADN {
    
    @GetMapping("/adn")
    @CrossOrigin(origins = "http://localhost:4200")
    public static String generateRandomNumber() {
        Random random = new Random();
        StringBuilder number = new StringBuilder();

        // Générer le premier chiffre (1-9 pour éviter un nombre commençant par 0)
        number.append(random.nextInt(9) + 1);

        // Générer les 9 chiffres restants (0-9)
        for (int i = 1; i < 10; i++) {
            number.append(random.nextInt(10));
        }

        return number.toString();
    }
    
}
