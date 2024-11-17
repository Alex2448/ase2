package edu.tum.ase.deliveryservice.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import javax.annotation.Generated;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "boxes")
public class Box {

    @Id
    private String id;

    @NotBlank
    @Size(min = 16, max = 16)
    private String raspberryId;

    @NotBlank
    @Size(min = 4, max = 6)
    private String name;

    @NotBlank
    @Size(max = 40)
    private String street;

    @NotBlank
    @Size(max = 10)
    private String postcode;

    @NotBlank
    @Size(max = 100)
    private String state;

    @NotBlank
    @Size(max = 100)
    private String city;

    @NotBlank
    @Size(max = 100)
    private String country;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Box(String raspberryId, String name, String street, String postcode, String state, String city, String country) {
        this.raspberryId = raspberryId;
        this.name = name;
        this.street = street;
        this.postcode = postcode;
        this.state = state;
        this.city = city;
        this.country = country;
    }
}