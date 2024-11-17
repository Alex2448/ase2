package edu.tum.ase.deliveryservice.security.jwt;

import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.InputStream;
import java.io.IOException;
import java.security.Key;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.PublicKey;

@Component
public class KeyStoreManager {

    private KeyStore keyStore;
    private String keyAlias;
    private char[] keyPassword = "$Sb#Ama3V9mNM&f960Yi".toCharArray();

    public KeyStoreManager() throws KeyStoreException, IOException {
        loadKeyStore();
    }

    public void loadKeyStore() throws KeyStoreException, IOException {
        keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        InputStream fis = null;
        try {
            // Get the path to the keystore file in the resources folder
            ClassLoader classLoader = getClass().getClassLoader();
            fis = classLoader.getResourceAsStream("ase_project.keystore");
            keyStore.load(fis, keyPassword);
            keyAlias = keyStore.aliases().nextElement();
        } catch (Exception e) {
            System.err.println("Error when loading KeyStore");
            e.printStackTrace();
        } finally {
            if (fis != null) {
                fis.close();
            }
        }
    }

    protected PublicKey getPublicKey() {
        try {
            keyAlias = keyStore.aliases().nextElement();
            return keyStore.getCertificate(keyAlias).getPublicKey();
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    protected Key getPrivateKey() {
        try {
            return keyStore.getKey(keyAlias,keyPassword);
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }
}
