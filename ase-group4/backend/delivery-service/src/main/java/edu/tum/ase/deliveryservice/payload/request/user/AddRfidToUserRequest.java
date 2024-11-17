package edu.tum.ase.deliveryservice.payload.request.user;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
public class AddRfidToUserRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String rfidToken;
}
