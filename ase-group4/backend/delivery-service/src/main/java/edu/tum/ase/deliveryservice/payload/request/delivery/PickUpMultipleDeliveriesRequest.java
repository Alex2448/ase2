package edu.tum.ase.deliveryservice.payload.request.delivery;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
public class PickUpMultipleDeliveriesRequest {

    private ArrayList<String> deliveryIds;

}
