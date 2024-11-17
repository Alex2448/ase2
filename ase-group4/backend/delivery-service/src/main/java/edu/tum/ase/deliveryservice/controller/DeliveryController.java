package edu.tum.ase.deliveryservice.controller;

import edu.tum.ase.deliveryservice.email.EmailService;
import edu.tum.ase.deliveryservice.model.*;
import edu.tum.ase.deliveryservice.payload.request.delivery.AddNewDeliveryRequest;
import edu.tum.ase.deliveryservice.payload.request.delivery.PickUpMultipleDeliveriesRequest;
import edu.tum.ase.deliveryservice.payload.request.delivery.UpdateDeliveryRequest;
import edu.tum.ase.deliveryservice.payload.response.MessageResponse;
import edu.tum.ase.deliveryservice.repository.BoxRepository;
import edu.tum.ase.deliveryservice.repository.DeliveryRepository;
import edu.tum.ase.deliveryservice.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.inject.Inject;
import javax.validation.Valid;
import java.util.ArrayList;
import java.util.Objects;
import java.util.UUID;

import static edu.tum.ase.deliveryservice.model.EStatus.*;

@RestController
@RequestMapping("/delivery-api/deliveries")
public class DeliveryController {

    private static final Logger logger = LoggerFactory.getLogger(DeliveryController.class);

    @Autowired
    DeliveryRepository deliveryRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    BoxRepository boxRepository;

    @Autowired
    EmailService emailService;

    @Inject
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Get All Deliveries from the system
     *
     * @return all deliveries in the system
     */
    @GetMapping("/getAllDeliveries")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public Page<Delivery> getAllDeliveries(
            @RequestParam(defaultValue = "0") Integer page) {
        return deliveryRepository.findAll(PageRequest.of(page, 5, Sort.by("createdAt").descending()));
    }

    /**
     * Get All Active Deliveries By User
     *
     * @param customerName the id of the customer
     * @return all deliveries that match the parameters
     */
    @GetMapping("/getActiveDeliveries/{customerName}")
    @PreAuthorize("hasRole('ROLE_DELIVERER') or hasRole('ROLE_CUSTOMER')")
    @Operation(summary = "Request is protected. Available for: Dispatcher, Customer, Deliverer")
    public Page<Delivery> getActiveDeliveries(
            @PathVariable String customerName,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "") String searchParam
    ) {
        if (userRepository.existsByUsername(customerName)) {
            User user = userRepository.findUserByUsername(customerName);
            if (Objects.equals(String.valueOf(user.getRole().getName()), "ROLE_DELIVERER")) {
                if (!Objects.equals(searchParam, "")) {
                    return deliveryRepository.
                            findAllByDelivererIdAndTrackingCodeContainingAndStatusOrStatusOrStatus
                                    (user.getId(), searchParam, ORDERED, COLLECTED, DELIVERED,
                                            PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                } else {
                    return deliveryRepository.
                            findAllByDelivererIdAndStatusOrStatusOrStatus
                                    (user.getId(), ORDERED, COLLECTED, DELIVERED,
                                            PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                }
            } else {
                if (!Objects.equals(searchParam, "")) {
                    return deliveryRepository.
                            findAllByCustomerIdAndTrackingCodeContainingAndStatusOrStatusOrStatus
                                    (user.getId(), searchParam, ORDERED, COLLECTED, DELIVERED,
                                            PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                } else {
                    return deliveryRepository.
                            findAllByCustomerIdAndStatusOrStatusOrStatus
                                    (user.getId(), ORDERED, COLLECTED, DELIVERED,
                                            PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                }
            }
        } else {
            return null;
        }
    }

    /**
     * Get Deliveries By User And Status
     *
     * @param customerName the id of the customer
     * @param status       the status of the deliveries
     * @return all deliveries that match the parameters
     */
    @GetMapping("/getDeliveries/{customerName}/{status}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER') or hasRole('ROLE_DELIVERER') or hasRole('ROLE_CUSTOMER')")
    @Operation(summary = "Request is protected. Available for: Dispatcher, Customer, Deliverer")
    public Page<Delivery> getDeliveries(
            @PathVariable String customerName,
            @PathVariable EStatus status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "") String searchParam
    ) {
        if (userRepository.existsByUsername(customerName)) {
            User user = userRepository.findUserByUsername(customerName);
            if (Objects.equals(String.valueOf(user.getRole().getName()), "ROLE_DELIVERER")) {
                if (!Objects.equals(searchParam, "")) {
                    return deliveryRepository.findAllByDelivererIdAndStatusAndTrackingCodeContaining(user.getId(), status, searchParam, PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                } else {
                    return deliveryRepository.findAllByDelivererIdAndStatus(user.getId(), status, PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                }
            } else {
                if (!Objects.equals(searchParam, "")) {
                    return deliveryRepository.findAllByCustomerIdAndStatusAndTrackingCodeContaining(user.getId(), status, searchParam, PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                } else {
                    return deliveryRepository.findAllByCustomerIdAndStatus(user.getId(), status, PageRequest.of(page, 5, Sort.by("createdAt").descending()));
                }
            }
        } else {
            return null;
        }
    }

    /**
     * Add a new delivery to the system
     *
     * @param addNewDeliveryRequest body for the request
     * @return Response Message
     */
    @PostMapping("/addNewDelivery")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> addNewDelivery(@Valid @RequestBody AddNewDeliveryRequest addNewDeliveryRequest) {

        User customer = new User();
        User deliverer = new User();
        Box box = new Box();

        String trackingCode = UUID.randomUUID().toString();

        // check if customer exists in database
        if (userRepository.existsById(addNewDeliveryRequest.getCustomerId())) {
            customer = userRepository.findById(addNewDeliveryRequest.getCustomerId());
            if (customer.getRole().getName() != ERole.ROLE_CUSTOMER) {
                return ResponseEntity.badRequest().body(new MessageResponse("Customer role is incorrect"));
            }
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Customer does not exist."));
        }

        // check if deliverer exists in database
        if (userRepository.existsById(addNewDeliveryRequest.getDelivererId())) {
            deliverer = userRepository.findById(addNewDeliveryRequest.getDelivererId());
            if (deliverer.getRole().getName() != ERole.ROLE_DELIVERER) {
                return ResponseEntity.badRequest().body(new MessageResponse("Deliverer role is incorrect"));
            }
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Deliverer does not exist."));
        }

        // check if box exists in database
        if (boxRepository.existsById(addNewDeliveryRequest.getTargetBoxId())) {

            box = boxRepository.findById(addNewDeliveryRequest.getTargetBoxId());

            // check if there is still a delivery that has status ordered and is assigned to this box
            if (deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(box.getId(), "ORDERED") == null) {
                EStatus status = getStatusEnumFromString("ORDERED");
                Delivery delivery = new Delivery(customer, deliverer, box, status, trackingCode);
                deliveryRepository.save(delivery);
                return ResponseEntity.ok(new MessageResponse("New delivery has been added"));
            }

            // ensure that if box is reassigned it has to be the same customer
            if (deliveryRepository.existsByTargetBoxId(addNewDeliveryRequest.getTargetBoxId())) {
                Delivery oldDelivery = deliveryRepository.findTopByTargetBoxId(addNewDeliveryRequest.getTargetBoxId());
                // is old customerId equal to new customer Id?
                if (!Objects.equals(oldDelivery.getCustomer().getId(), customer.getId())) {
                    return ResponseEntity
                            .badRequest()
                            .body(new MessageResponse("Error: The Box is already used for another customer."));
                }
                // box can be reassigned because it is the same customer
                else {
                    EStatus status = getStatusEnumFromString("ORDERED");
                    Delivery delivery = new Delivery(customer, deliverer, box, status, trackingCode);
                    deliveryRepository.save(delivery);
                    emailService.sendMail(customer.getEmail(), "New Delivery",
                            "A New Delivery has been placed for you. \n" +
                                    "Your Deliverer is " + deliverer.getUsername() + "\n" +
                                    "The Delivery comes in box " + box.getName());
                    return ResponseEntity.ok(new MessageResponse("New delivery has been added"));
                }
            }
            // the box has not yet been assigned => save new delivery
            else {
                EStatus status = getStatusEnumFromString("ORDERED");
                Delivery delivery = new Delivery(customer, deliverer, box, status, trackingCode);
                deliveryRepository.save(delivery);
                logger.info(customer.getEmail());
                emailService.sendMail(customer.getEmail(), "New Delivery",
                        "A New Delivery has been placed for you. \n" +
                                "Your Deliverer is " + deliverer.getUsername() + "\n" +
                                "The Delivery comes in box " + box.getName());
                return ResponseEntity.ok(new MessageResponse("New delivery has been added"));

            }
        }
        // box does not exist
        else {
            return ResponseEntity.badRequest().body(new MessageResponse("Box does not exist."));
        }
    }

    /**
     * update a delivery in the system
     *
     * @param updateDeliveryRequest update delivery body
     * @param deliveryId            the id of the delivery
     * @return response message
     */
    @PostMapping("/updateDelivery/{deliveryId}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> updateDelivery(
            @Valid @RequestBody UpdateDeliveryRequest updateDeliveryRequest,
            @PathVariable String deliveryId) {

        if (deliveryRepository.existsById(deliveryId)) {

            Delivery delivery = deliveryRepository.findById(deliveryId);

            String customer = updateDeliveryRequest.getCustomerId();
            String deliverer = updateDeliveryRequest.getDelivererId();
            String targetBox = updateDeliveryRequest.getTargetBoxId();

            if (customer != null & userRepository.existsById(customer)) {
                delivery.setCustomer(userRepository.findById(customer));
            }
            if (deliverer != null & userRepository.existsById(deliverer)) {
                delivery.setDeliverer(userRepository.findById(deliverer));
            }
            if (targetBox != null & boxRepository.existsById(targetBox)) {
                delivery.setTargetBox(boxRepository.findById(targetBox));
            }

            deliveryRepository.save(delivery);
            return ResponseEntity.ok(new MessageResponse("Delivery successfully updated!"));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Delivery with this ID does not exist."));
        }
    }

    @PostMapping("/changeStatus/{deliveryId}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER') or hasRole('ROLE_DELIVERER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> changeStatus(
            @PathVariable String deliveryId,
            @RequestParam(required = true) String status) {
        // check if delivery exists
        if (deliveryRepository.existsById(deliveryId)) {
            Delivery delivery = deliveryRepository.findById(deliveryId);
            EStatus statusEnumFromString = getStatusEnumFromString(status);
            if (statusEnumFromString != null) {
                delivery.setStatus(statusEnumFromString);
                deliveryRepository.save(delivery);
                // if that was the last delivery that has been picked up from the box => send email
                if (deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(delivery.getTargetBox().getId(), "ORDERED") == null) {
                    emailService.sendMail(delivery.getCustomer().getEmail(), "All Deliveries Picked Up",
                            "All deliveries have successfully been picked up.");
                }
                return ResponseEntity.ok(new MessageResponse("Delivery successfully updated!"));
            }
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Provide a valid delivery Status"));
        }
        return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Delivery with this ID does not exist."));

    }


    /**
     * delete a delivery
     *
     * @param deliveryId id of delivery that has to be deleted
     * @return response message
     */
    @DeleteMapping("/deleteDelivery/{deliveryId}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteDelivery(@PathVariable String deliveryId) {
        logger.info(deliveryId);
        if (deliveryRepository.existsById(deliveryId)) {
            Delivery delivery = deliveryRepository.findById(deliveryId);
            deliveryRepository.delete(delivery);
            return ResponseEntity.ok(new MessageResponse("Delivery successfully deleted!"));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Delivery with this ID does not exist."));
        }
    }

    /**
     * Collect multiple deliveries from central depot
     *
     * @param pickupMultipleDeliveriesRequest pickup multiple deliveries request
     * @return response message
     */
    @PostMapping("/pickupMultipleDeliveries")
    @PreAuthorize("hasRole('ROLE_DELIVERER')")
    @Operation(summary = "Request is protected. Only available for Deliverer.", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> pickupMultipleDeliveries(@Valid @RequestBody PickUpMultipleDeliveriesRequest pickupMultipleDeliveriesRequest) {
        ArrayList<String> deliveryIds = pickupMultipleDeliveriesRequest.getDeliveryIds();
        if (deliveryIds.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("No delivery IDs provided"));
        }
        for (String deliveryId : deliveryIds) {
            Delivery delivery = deliveryRepository.findById(deliveryId);
            if (delivery == null) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Delivery with following ID does not exist: " + deliveryId));
            }
            delivery.setStatus(COLLECTED);
            deliveryRepository.save(delivery);
        }
        return ResponseEntity.ok(new MessageResponse("All deliveries are collected successfully."));
    }

    @PostMapping("/checkAuthorization/{boxId}/{RFID}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> checkAuthorization(@PathVariable String RFID, @PathVariable String boxId) {
        if (userRepository.existsByRfidToken(RFID)) {
            User user = userRepository.findByRfidToken(RFID);
            Boolean authorized = false;
            if (user.getRole().getName().equals(ERole.ROLE_DELIVERER)) {
                Box box = boxRepository.findById(boxId);
                authorized = deliveryRepository.existsDeliveryByTargetBoxAndDelivererAndStatus(box, user, COLLECTED);
            }
            if (user.getRole().getName().equals(ERole.ROLE_CUSTOMER)) {
                Box box = boxRepository.findById(boxId);
                authorized = deliveryRepository.existsDeliveryByTargetBoxAndCustomerAndStatus(box, user, DELIVERED);
            }
            if (authorized) {
                return ResponseEntity.ok("Is authorized.");
            }
        }
        return ResponseEntity
                .badRequest()
                .body(new MessageResponse(
                        "User is not authorized."));
    }

    @PostMapping("/deliverOrPickUpMultipleDeliveries/{boxId}/{RFID}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> deliverOrPickUpMultipleDeliveries(@PathVariable String RFID, @PathVariable String boxId) {
        if (userRepository.existsByRfidToken(RFID)) {
            User user = userRepository.findByRfidToken(RFID);
            Page<Delivery> allDeliveries = null;
            Box box = boxRepository.findById(boxId);
            if (user.getRole().getName().equals(ERole.ROLE_DELIVERER)) {
                allDeliveries = deliveryRepository.findAllByDelivererIdAndStatusAndTargetBox(user.getId(), COLLECTED, box, PageRequest.of(0, 5, Sort.by("createdAt").descending()));
                if (allDeliveries.getTotalElements() == 0) {
                    return ResponseEntity
                            .badRequest()
                            .body(new MessageResponse(
                                    "There are no deliveries to be delivered by this deliverer in this box"));
                }
                for (Delivery delivery : allDeliveries) {
                    delivery.setStatus(DELIVERED);
                    deliveryRepository.save(delivery);
                    emailService.sendMail(delivery.getCustomer().getEmail(), "Delivery is delivered",
                            "Delivery " + delivery.getId() + "is delivered and is ready to get picked up in box " + box.getName());
                }
                return ResponseEntity.ok(allDeliveries.getContent());
            }

            if (user.getRole().getName().equals(ERole.ROLE_CUSTOMER)) {
                allDeliveries = deliveryRepository.findAllByCustomerIdAndStatusAndTargetBox(user.getId(), DELIVERED, box, PageRequest.of(0, 5, Sort.by("createdAt").descending()));
                if (allDeliveries.getTotalElements() == 0) {
                    return ResponseEntity
                            .badRequest()
                            .body(new MessageResponse(
                                    "There are no deliveries to be delivered by this deliverer in this box"));
                }
                for (Delivery delivery : allDeliveries) {
                    delivery.setStatus(PICKED_UP);
                    deliveryRepository.save(delivery);
                    // if that was the last delivery that has been picked up from the box => send email
                    if (deliveryRepository.findTopDeliveryByTargetBoxIdAndStatus(box.getId(), "DELIVERED") == null) {
                        emailService.sendMail(delivery.getCustomer().getEmail(), "All Delivered Deliveries Picked Up",
                                "All delivered deliveries have successfully been picked up.");
                    }
                }
                return ResponseEntity.ok(allDeliveries.getContent());
            }
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(
                            "There are no deliveries to be delivered by this deliverer in this box"));
        } else {
            return ResponseEntity
                    .status(401)
                    .body(new MessageResponse(
                            "User is unauthorized."));
        }
    }


    /**
     * get Enum String from String
     *
     * @param statusString the string for the status
     * @return EStatus Type
     */
    private EStatus getStatusEnumFromString(String statusString) {
        logger.info(statusString);
        switch (statusString.toLowerCase()) {
            case "picked_up":
                return PICKED_UP;
            case "ordered":
                return ORDERED;
            case "collected":
                return COLLECTED;
            case "delivered":
                return DELIVERED;
        }
        return null;
    }
}