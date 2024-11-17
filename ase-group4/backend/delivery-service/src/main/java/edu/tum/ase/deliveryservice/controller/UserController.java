package edu.tum.ase.deliveryservice.controller;

import edu.tum.ase.deliveryservice.model.ERole;
import edu.tum.ase.deliveryservice.model.Role;
import edu.tum.ase.deliveryservice.model.User;
import edu.tum.ase.deliveryservice.payload.request.user.AddNewUserRequest;
import edu.tum.ase.deliveryservice.payload.request.user.AddRfidToUserRequest;
import edu.tum.ase.deliveryservice.payload.request.user.UpdateUserRequest;
import edu.tum.ase.deliveryservice.repository.RoleRepository;
import edu.tum.ase.deliveryservice.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/delivery-api/user-management")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    /**
     * get all users in the system
     * @return all user information
     */
    @GetMapping("/getAllUser")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.\"", security = @SecurityRequirement(name = "bearerAuth"))
    public Page<User> getAllUser(
            @RequestParam(defaultValue="0") Integer page
    ) {
        return userRepository.findAll(PageRequest.of(page, 5, Sort.by("createdAt").descending()));
    }

    /**
     * get all users by role
     * @param strRole role as string
     * @return all users with specified role
     */
    @GetMapping("/getUsersByRole/{strRole}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.", security = @SecurityRequirement(name = "bearerAuth"))
    public List<User> getUsersByRole(@PathVariable String strRole) {
        logger.info(strRole);
        Role role = new Role();
        if (strRole != null) {
            switch (strRole) {
                case "dispatcher":
                    role = roleRepository.findByName(ERole.ROLE_DISPATCHER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    break;
                case "deliverer":
                    role = roleRepository.findByName(ERole.ROLE_DELIVERER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    break;
                default:
                    role = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

            }
        }
        return userRepository.findAllByRole(role);
    }

    /**
     * get rfid token by user
     * @param userId user
     * @return rfid token
     */
    @GetMapping("/getRfidTokenByUser/{userId}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    public String getRfidTokenByUser(@PathVariable String userId) {

        if (userRepository.existsById(userId)) {
            User user = userRepository.findById(userId);
            if (user.getRfidToken() != null) {
                return user.getRfidToken();
            } else {
                return null;
            }
        }
        return null;
    }

    /**
     * add a new user to the system. This will be controlled by the CAS-Service
     * @param addNewUserRequest request body
     * @return Response Entity
     */
    @PostMapping("/addNewUser")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    public ResponseEntity<?> addNewUser(@Valid @RequestBody AddNewUserRequest addNewUserRequest) {

        String strRole = addNewUserRequest.getRole();
        Role role = new Role();

        switch (strRole) {
            case "dispatcher":
                role = roleRepository.findByName(ERole.ROLE_DISPATCHER)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                break;
            case "deliverer":
                role = roleRepository.findByName(ERole.ROLE_DELIVERER)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                break;
            default:
                role = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        }

        User user = new User(
                addNewUserRequest.getUsername(),
                addNewUserRequest.getEmail(),
                role,
                true
        );

        userRepository.save(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * add rfid token to user
     * @param addRfidToUserRequest request body
     * @return response entitiy
     */
    @PostMapping("/addRfidToUser")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    public ResponseEntity<?> addRfidToUser(@Valid @RequestBody AddRfidToUserRequest addRfidToUserRequest) {

        String userId = addRfidToUserRequest.getUserId();
        String rfidToken = addRfidToUserRequest.getRfidToken();

        if (userRepository.existsById(userId)) {
            User user = userRepository.findById(userId);
            if (!userRepository.existsByRfidToken(rfidToken)) {
                user.setRfidToken(rfidToken);
                userRepository.save(user);
                return ResponseEntity.ok("RFID Token successfully added.");
            } else {
                User user2 = userRepository.findByRfidToken(rfidToken);
                user2.setRfidToken(null);
                user.setRfidToken(rfidToken);
                userRepository.save(user);
                userRepository.save(user2);
                return ResponseEntity.ok("RFID Token successfully added.");
            }
        } else {
            return ResponseEntity.badRequest().body("The user does not exist");
        }
    }

    /**
     * update user. this is controlled by the cas-service
     * @param updateUserRequest request body
     * @param userName username to change
     * @return response entity
     */
    @PostMapping("/updateUser/{userName}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> updateUser(
            @Valid @RequestBody UpdateUserRequest updateUserRequest,
            @PathVariable String userName) {

        String username = updateUserRequest.getUsername();
        String newEmail = updateUserRequest.getEmail();
        String strRole = updateUserRequest.getRole().toLowerCase();
        Role role;

        User user = userRepository.findUserByUsername(userName);

        if (!Objects.equals(username, "")) {
            user.setUsername(username);
        }
        if (!Objects.equals(newEmail, "")) {
            user.setEmail(newEmail);
        }
        if (!Objects.equals(strRole, "")) {
            switch (strRole) {
                case "dispatcher":
                    role = roleRepository.findByName(ERole.ROLE_DISPATCHER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    break;
                case "deliverer":
                    role = roleRepository.findByName(ERole.ROLE_DELIVERER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    break;
                default:
                    role = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

            }
        }

        if (!Objects.equals(strRole, "")) {
            switch (strRole) {
                case "dispatcher":
                    role = roleRepository.findByName(ERole.ROLE_DISPATCHER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    user.setRole(role);
                    break;
                case "deliverer":
                    role = roleRepository.findByName(ERole.ROLE_DELIVERER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    user.setRole(role);
                    break;
                default:
                    role = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    user.setRole(role);
            }
        }

        userRepository.save(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * delete user from system
     * @param username user to delete
     * @return response entity
     */
    @DeleteMapping("/deleteUser/{username}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        User user = userRepository.findUserByUsername(username);
        userRepository.delete(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
