package edu.tum.ase.project.controller;

import edu.tum.ase.project.model.Box;
import edu.tum.ase.project.model.User;
import edu.tum.ase.project.payload.request.RegisterNewBoxRequest;
import edu.tum.ase.project.payload.request.UpdateBoxRequest;
import edu.tum.ase.project.payload.response.MessageResponse;
import edu.tum.ase.project.repository.BoxRepository;
import edu.tum.ase.project.repository.DeliveryRepository;
import edu.tum.ase.project.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/boxes")
public class BoxController {

    private static final Logger logger = LoggerFactory.getLogger(BoxController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    BoxRepository boxRepository;

    @Autowired
    DeliveryRepository deliveryRepository;

    @Autowired
    UserRepository userRepository;

    Box newBox;

    /**
     * get all boxes of the system
     *
     * @return boxes
     */
    @GetMapping("/getAllBoxes")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public List<Box> getAllBoxes() {
        return boxRepository.findAll();
    }

    /**
     * Get Only Boxes which are not assigned to a delivery with status "ORDERED"
     * @return all available boxes
     */
    @GetMapping("/getAvailableBoxes")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public List<Box> getAvailableBoxes() {
        return boxRepository.findAllByInUse(false);
    }

    /**
     * register a new Box into the system
     *
     * @param registerNewBoxRequest
     * @return
     */
    @PostMapping("/registerNewBox")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> registerNewBox(@Valid @RequestBody RegisterNewBoxRequest registerNewBoxRequest) {
        // check if box already exists
        logger.info(registerNewBoxRequest.getName());
        if (boxRepository.existsByName(registerNewBoxRequest.getName())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Box with provided name already exists"));
        }

        // Set Box Object
        Box box = new Box(
                registerNewBoxRequest.getID(),
                registerNewBoxRequest.getName(),
                registerNewBoxRequest.getCustomer(),
                registerNewBoxRequest.getStreet(),
                registerNewBoxRequest.getPostcode(),
                registerNewBoxRequest.getState(),
                registerNewBoxRequest.getCity(),
                registerNewBoxRequest.getCountry(),
                false
        );
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:8080/api/boxes/NewBoxConfiguration";
        URI uri = null;
        try {
            uri = new URI(url);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        ResponseEntity<String> result = restTemplate.postForEntity(uri, box, String.class);


//        Map<String, String> urlParams = new HashMap<>();
//        urlParams.put("id", box.getId());
//        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(uri);
//        ResponseEntity<?> request = restTemplate.postForObject(builder.buildAndExpand(urlParams).toUri(), box, ResponseEntity.class);
//        if (boxRequest != null && boxRequest.getStatusCodeValue() != 200)
//            return ResponseEntity.badRequest().body(
//                new MessageResponse("The configuration could not be posted."));

//        ResponseEntity<String> entity = template.getForEntity("https://example.com", String.class);
//        String body = entity.getBody();
//        MediaType contentType = entity.getHeaders().getContentType();
//        HttpStatus statusCode = entity.getStatusCode();

        boxRepository.save(box);
        newBox = box;
        return ResponseEntity.ok(new MessageResponse("New Box has successfully been registered."));
    }

    @PostMapping("/NewBoxConfiguration")
//    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
//    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> postNewBoxConfiguration(@Valid @RequestBody Box box) {
        return ResponseEntity.ok(box.toString());
    }

    @GetMapping("/NewBoxConfiguration")
//    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
//    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getNewBoxConfiguration() {
        if (newBox != null)
            return ResponseEntity.ok(newBox);
        else {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: A new box is not yet registered."));
        }
    }


    /**
     * update a box
     * @param updateBoxRequest
     * @param boxName
     * @return
     */
    @PostMapping("/updateBox/{boxName}") //TODO: Put??
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> updateBox(@Valid @RequestBody UpdateBoxRequest updateBoxRequest, @PathVariable String boxName) {
        if (boxRepository.existsByName(boxName)) {

            String name = updateBoxRequest.getName();
            String street = updateBoxRequest.getStreet();
            String postcode = updateBoxRequest.getPostcode();
            String state = updateBoxRequest.getState();
            String city = updateBoxRequest.getCity();
            String country = updateBoxRequest.getCountry();
            User customer = updateBoxRequest.getCustomer();

            Box box = boxRepository.findByName(boxName);
            if (name != null) {
                box.setName(name);
            }
            if (street != null) {
                box.setStreet(street);
            }
            if (postcode != null) {
                box.setPostcode(postcode);
            }
            if (state != null) {
                box.setState(state);
            }
            if (city != null) {
                box.setCity(city);
            }
            if (country != null) {
                box.setCountry(country);
            }
            if (customer != null) {
                if (box.getInUse()) {
                    return ResponseEntity
                            .badRequest()
                            .body(new MessageResponse(
                                    "Error: Box is still in use and a customer cannot be assigned."));
                }
                box.setCustomer(customer);
            }
            boxRepository.save(box);
            return ResponseEntity.ok(new MessageResponse("Box successfully updated!"));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Box with this name does not exist."));
        }
    }

    /**
     * delete a box
     *
     * @param boxName
     * @return
     */
    @DeleteMapping("/deleteBox/{boxName}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteBox(@PathVariable String boxName) {
        if (!boxRepository.existsByName(boxName)) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Box with this name does not exist."));
        }
        else {
            Box box = boxRepository.findByName(boxName);
            if (box.getInUse()) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Box is still in use."));
            }
            boxRepository.delete(box);
            return ResponseEntity.ok(new MessageResponse("Box successfully deleted!"));
        }
    }
}


