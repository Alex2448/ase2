package edu.tum.ase.deliveryservice.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import java.time.Instant;

@Getter
@Setter
@Document(collection = "deliveries")
public class Delivery {

    @Id
    private String id;

    @NotBlank
    @DBRef
    private User customer;

    @NotBlank
    @DBRef
    private User deliverer;

    @NotBlank
    @DBRef
    private Box targetBox;

    @NotBlank
    private EStatus status;

    @NotBlank
    private String trackingCode;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Delivery(User customer, User deliverer, Box targetBox, EStatus status, String trackingCode) {
        this.customer = customer;
        this.deliverer = deliverer;
        this.targetBox = targetBox;
        this.status = status;
        this.trackingCode = trackingCode;
    }
}
