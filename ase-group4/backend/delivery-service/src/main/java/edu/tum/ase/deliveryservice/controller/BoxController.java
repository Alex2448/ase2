package edu.tum.ase.deliveryservice.controller;

import edu.tum.ase.deliveryservice.model.Box;
import edu.tum.ase.deliveryservice.payload.request.box.RegisterNewBoxRequest;
import edu.tum.ase.deliveryservice.payload.request.box.UpdateBoxRequest;
import edu.tum.ase.deliveryservice.payload.response.MessageResponse;
import edu.tum.ase.deliveryservice.repository.BoxRepository;
import edu.tum.ase.deliveryservice.repository.DeliveryRepository;
import edu.tum.ase.deliveryservice.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.springframework.data.domain.Sort;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;

@RestController
@EnableMongoAuditing
@RequestMapping("/delivery-api/boxes")
public class BoxController {

    private static final Logger logger = LoggerFactory.getLogger(BoxController.class);

    @Autowired
    BoxRepository boxRepository;

    @Autowired
    DeliveryRepository deliveryRepository;

    @Autowired
    UserRepository userRepository;

    /**
     * get all boxes of the system
     *
     * @return boxes
     */
    @GetMapping("/getAllBoxes")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    public Page<Box> getAllBoxes(
            @RequestParam(defaultValue = "0") Integer page) {
        return boxRepository.findAll(PageRequest.of(page, 5, Sort.by("createdAt").descending()));
    }

    /**
     * get a specific box
     *
     * @param raspberryId
     * @return
     */
    @GetMapping("/getBox/{raspberryId}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getBox(@PathVariable String raspberryId) {
        if (!boxRepository.existsByRaspberryId(raspberryId)) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Box with this name does not exist."));
        } else {
            Box box = boxRepository.findByRaspberryId(raspberryId);
            return ResponseEntity.ok(box);
        }
    }

    /**
     * Get Only Boxes which are not assigned to a delivery with status "ORDERED"
     *
     * @return all available boxes
     */
    @GetMapping("/getAvailableBoxes")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected")
    public List<Box> getAvailableBoxes() {
        return boxRepository.findAll();
    }

    /**
     * register a new Box into the system
     *
     * @param registerNewBoxRequest
     * @return responseentity
     */
    @PostMapping("/registerNewBox")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    public ResponseEntity<?> registerNewBox(@Valid @RequestBody RegisterNewBoxRequest registerNewBoxRequest) {
        // check if box already exists
        if (boxRepository.existsByName(registerNewBoxRequest.getName()) ||
                boxRepository.existsByRaspberryId(registerNewBoxRequest.getRaspberryId())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Box with provided name or raspberry ID already exists"));
        }
        // Set Box Object
        Box box = new Box(
                registerNewBoxRequest.getRaspberryId(),
                registerNewBoxRequest.getName(),
                registerNewBoxRequest.getStreet(),
                registerNewBoxRequest.getPostcode(),
                registerNewBoxRequest.getState(),
                registerNewBoxRequest.getCity(),
                registerNewBoxRequest.getCountry()
        );
        boxRepository.save(box);
        return ResponseEntity.ok(new MessageResponse("New Box has successfully been registered."));
    }

    /**
     * update a box, raspberry ID cannot be changed since it would be a different box then.
     *
     * @param updateBoxRequest
     * @param boxId
     * @return response entity
     */
    @PostMapping("/updateBox/{boxId}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    public ResponseEntity<?> updateBox(
            @Valid @RequestBody UpdateBoxRequest updateBoxRequest,
            @PathVariable String boxId) {

        if (boxRepository.existsById(boxId)) {

            Box box = boxRepository.findById(boxId);

            // if box has deliveries in it or deliveries are on the way to the box then no update should be possible
            if (deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(box.getId(), "DELIVERED") != null ||
                    deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(box.getId(), "COLLECTED") != null) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Box is still in use for active deliveries."));
            }

            String name = updateBoxRequest.getName();
            String street = updateBoxRequest.getStreet();
            String postcode = updateBoxRequest.getPostcode();
            String state = updateBoxRequest.getState();
            String city = updateBoxRequest.getCity();
            String country = updateBoxRequest.getCountry();

            if (name != null) {
                if (Objects.equals(box.getName(), name)) {
                    box.setName(name);
                } else if (boxRepository.existsByName(name)) {
                    return ResponseEntity
                            .badRequest()
                            .body("Error: Box with this name already exists.");
                } else {
                    box.setName(name);
                }
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
     * @param boxId
     * @return response entity
     */
    @DeleteMapping("/deleteBox/{boxId}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    public ResponseEntity<?> deleteBox(@PathVariable String boxId) {
        // check if box exists
        if (!boxRepository.existsById(boxId)) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Box with this name does not exist."));
        } else {
            Box box = boxRepository.findById(boxId);
            // check if there is still a delivery with status "ordered" assigned to the box
            if (deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(box.getId(), "ORDERED") != null ||
                    deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(box.getId(), "DELIVERED") != null ||
                    deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(box.getId(), "COLLECTED") != null) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Box is still in use."));
            } else {
                boxRepository.delete(box);
                return ResponseEntity.ok(new MessageResponse("Box \"" + box.getName() + "\" successfully deleted!"));
            }
        }
    }
}


