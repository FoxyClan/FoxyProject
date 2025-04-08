package com.foxyclan.jar;

import org.web3j.crypto.Hash;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import org.web3j.crypto.Keys;


public class SignatureUtil {

    public static String recoverAddress(String message, String signatureHex) throws Exception {
        // Ethereum ajoute ce préfixe avant de signer
        byte[] msgHash = Hash.sha3(message.getBytes(StandardCharsets.UTF_8));

        byte[] signatureBytes = Numeric.hexStringToByteArray(signatureHex);
        if (signatureBytes.length != 65) {
            throw new IllegalArgumentException("Signature invalide. Longueur != 65 octets");
        }

        byte v = signatureBytes[64];
        if (v < 27) v += 27;

        Sign.SignatureData signatureData = new Sign.SignatureData(
                v,
                java.util.Arrays.copyOfRange(signatureBytes, 0, 32),
                java.util.Arrays.copyOfRange(signatureBytes, 32, 64)
        );

        BigInteger publicKey;
        try {
            publicKey = Sign.signedMessageToKey(msgHash, signatureData);
        } catch (Exception e) {
            throw new Exception("Impossible de récupérer la clé publique depuis la signature", e);
        }

        String address = "0x" + Keys.getAddress(publicKey);
        return address.toLowerCase(); // On retourne l'adresse récupérée
    }
}
