package edu.tum.ase.deliveryservice;

import com.mongodb.client.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableMongoRepositories()
public class DeliveryServiceApplication implements CommandLineRunner {

    @Autowired
    MongoClient mongoClient;

    private static final Logger log = LoggerFactory.getLogger(DeliveryServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(DeliveryServiceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("MongoClient = " + mongoClient.getClusterDescription());
        String projectName = "ASE Group 4 Delivery Backend";
        log.info("***********************************");
        log.info(String.format("PROJECT %s IS CREATED", projectName));
        log.info("API DOC AT : http://localhost:8082/swagger-ui.html");
        log.info("***********************************");
    }
}
