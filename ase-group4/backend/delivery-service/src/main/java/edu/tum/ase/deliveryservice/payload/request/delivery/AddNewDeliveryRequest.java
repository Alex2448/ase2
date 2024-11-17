package edu.tum.ase.deliveryservice.payload.request.delivery;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
public class AddNewDeliveryRequest {

    @NotBlank
    private String customerId;

    @NotBlank
    private String delivererId;

    @NotBlank
    private String targetBoxId;

    private String status;

    private String trackingCode;

    @Value("true")
    private boolean enabled;
}
