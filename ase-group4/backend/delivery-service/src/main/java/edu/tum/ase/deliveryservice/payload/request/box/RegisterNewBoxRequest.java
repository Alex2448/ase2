package edu.tum.ase.deliveryservice.payload.request.box;

import edu.tum.ase.deliveryservice.model.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;


import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Getter
@Setter
public class RegisterNewBoxRequest {

    @NotBlank
    @Size(min = 16, max = 16)
    private String raspberryId;

    @NotBlank
    @Size(min=4, max = 6)
    private String name;

    private User customer;

    @NotBlank
    @Size(max=40)
    private String street;

    @NotBlank
    @Size(max=10)
    private String postcode;

    @NotBlank
    @Size(max=100)
    private String state;

    @NotBlank
    @Size(max=100)
    private String city;

    @NotBlank
    @Size(max=100)
    private String country;
}
