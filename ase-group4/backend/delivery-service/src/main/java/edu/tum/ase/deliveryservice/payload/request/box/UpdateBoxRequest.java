package edu.tum.ase.deliveryservice.payload.request.box;

import edu.tum.ase.deliveryservice.model.Delivery;
import edu.tum.ase.deliveryservice.model.User;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Size;
import java.util.ArrayList;

@Getter
@Setter
public class UpdateBoxRequest {

    @Size(min = 4, max = 6)
    private String name;

    @Size(max = 40)
    private String street;

    @Size(max = 10)
    private String postcode;

    @Size(max = 100)
    private String state;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String country;
}
