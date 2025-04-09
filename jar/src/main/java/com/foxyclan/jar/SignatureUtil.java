package com.foxyclan.jar;
import org.web3j.crypto.Sign;
import java.math.BigInteger;
import java.security.SignatureException;
import org.web3j.crypto.Keys;

public class SignatureUtil {

    public static String recover(String textMessage, String hexStringSignature) throws SignatureException {

        if(hexStringSignature.length() != 132 || !hexStringSignature.startsWith("0x")) {
            throw new SignatureException("Signature must be an hexadecimal string starting with 0x + 130 characters");
        }
        String r = hexStringSignature.substring(2, 66);
        String s = hexStringSignature.substring(66, 130);
        String v = hexStringSignature.substring(130, 132);

        Sign.SignatureData signatureData = new Sign.SignatureData(hexStringToBytesArray(v), hexStringToBytesArray(r), hexStringToBytesArray(s));
        BigInteger pubKey = Sign.signedPrefixedMessageToKey(textMessage.getBytes(), signatureData);
        String recover = Keys.getAddress(pubKey);
        recover = "0x" + recover;

        return recover;
    }

    public static byte[] hexStringToBytesArray(String hexString) {

        // Remove hexadecimal prefix
        if (hexString.startsWith("0x")) {
            hexString = hexString.substring(2);
        }

        // Check that remaining characters number is even, to be able to group them by 2, for a single byte
        if ((hexString.length() % 2) != 0) {
            throw new IllegalArgumentException("Invalid hex string (length % 2 != 0)");
        }

        // Resulted bytes array length will be half of initial hexadecimal characters number
        byte[] array = new byte[hexString.length() / 2];

        // For each group of 2 hexa characters, convert it into its byte value
        for (int i = 0, arrayIndex = 0; i < hexString.length(); i += 2, arrayIndex++) {
            array[arrayIndex] = Integer.valueOf(hexString.substring(i, i + 2), 16).byteValue();
        }
        return array;
    }



}
