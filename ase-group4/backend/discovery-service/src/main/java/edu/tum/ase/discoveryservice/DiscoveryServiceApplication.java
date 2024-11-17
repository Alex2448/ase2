package edu.tum.ase.discoveryservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServiceApplication implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DiscoveryServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServiceApplication.class, args);
    }

    @Override
    public void run(String...args) throws Exception {
        log.info("*************************");
        log.info("Discovery Eureka Service started");
        log.info("Access at : http://localhost:8761/" );
        log.info("*************************");
    }

}
