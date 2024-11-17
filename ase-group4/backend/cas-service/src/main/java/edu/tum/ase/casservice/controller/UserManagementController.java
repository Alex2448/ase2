package edu.tum.ase.casservice.controller;

import com.netflix.discovery.EurekaClient;
import edu.tum.ase.casservice.model.ERole;
import edu.tum.ase.casservice.model.Role;
import edu.tum.ase.casservice.model.User;
import edu.tum.ase.casservice.payload.request.AddNewUserRequest;
import edu.tum.ase.casservice.payload.request.UpdateUserRequest;
import edu.tum.ase.casservice.payload.response.MessageResponse;
import edu.tum.ase.casservice.repository.RoleRepository;
import edu.tum.ase.casservice.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.Email;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@RestController
@RequestMapping("/cas-api/user-management")
public class UserManagementController {

    private static final Logger logger = LoggerFactory.getLogger(UserManagementController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    private EurekaClient discoveryClient;

    @Inject
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * add a new user
     * @param addNewUserRequest new user request body
     * @return response
     */
    @PostMapping("/addNewUser")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> addNewUser(
            @Valid @RequestBody AddNewUserRequest addNewUserRequest) {

        // check if user with name already exists
        if (userRepository.existsByUsername(addNewUserRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        // check if email for user already exists
        if (userRepository.existsByEmail(addNewUserRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        String strRole = addNewUserRequest.getRole().toLowerCase();
        Role role = new Role();

        if (addNewUserRequest.getRole() == null) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Please provide a role for the user!"));
        } else {
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

        // Create User Object
        User user = new User(
                addNewUserRequest.getUsername(),
                addNewUserRequest.getEmail(),
                encoder.encode(addNewUserRequest.getPassword()),
                role);

        // Connection to Delivery Eureka Client
        String url = discoveryClient.getNextServerFromEureka("API-GATEWAY-SERVICE", false).getHomePageUrl();

        // login for authentication
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String loginRequestJson = "{" +
                "\"username\":\"dispatcher\"," +
                "\"password\":\"123456\"" +
                "}";
        HttpEntity<String> loginHttpEntity = new HttpEntity<String>(loginRequestJson, headers);
        ResponseEntity<String> loginResult = restTemplate().postForEntity(url +"cas-api/auth/signin", loginHttpEntity, String.class);
        logger.info(String.valueOf(loginResult.getHeaders()));

        headers.add("Cookie", loginResult.getHeaders().getFirst(HttpHeaders.SET_COOKIE));

        // send request to delivery api
        String requestJson =  "{" +
                "\"username\":\"" + addNewUserRequest.getUsername() + "\"," +
                "\"email\":\"" + addNewUserRequest.getEmail() + "\"," +
                "\"role\":\"" + strRole + "\"" +
                "}";
        logger.info(requestJson);
        logger.info(url +"delivery-api/user-management/addNewUser");
        HttpEntity<String> httpEntity = new HttpEntity<String>(requestJson, headers);
        ResponseEntity<String> userResult = restTemplate().postForEntity(url +"delivery-api/user-management/addNewUser", httpEntity, String.class);
        logger.info(String.valueOf(userResult.getStatusCode()));
        if (!Objects.equals(String.valueOf(userResult.getStatusCode()), "200 OK")) {
            return new ResponseEntity<>("User could not be saved in delivery database!", HttpStatus.CONFLICT);
        } else {
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("New user registered successfully!"));
        }
    }

    /**
     * update user information
     * @param updateUserRequest user update body
     * @param userId user that has to be changed
     * @return response
     */
    @PostMapping("/updateUser/{userName}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> updateUser(
            @Valid @RequestBody UpdateUserRequest updateUserRequest,
            @PathVariable String userName) {

        String username = updateUserRequest.getUsername();
        String newEmail = updateUserRequest.getEmail();
        String newPassword = updateUserRequest.getPassword();
        String strRole = updateUserRequest.getRole().toLowerCase();
        Role role;

        // check if user exists
        if (userRepository.existsByUsername(userName)) {

            // load user if exists
            User user = userRepository.findUserByUsername(userName);

            // disable deleting of main dispatcher
            if (Objects.equals(user.getUsername(), "dispatcher")) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: You can not change this dispatcher!"));
            }

            // check if new username is provided and already taken
            if (!Objects.equals(username, "")) {
                if (Objects.equals(username, user.getUsername())) {
                    user.setUsername(username);
                } else {
                    if (userRepository.existsByUsername(username)) {
                        return ResponseEntity
                                .badRequest()
                                .body(new MessageResponse("Error: Username is already taken!"));
                    } else {
                        user.setUsername(username);
                    }
                }
            }

            // check if email is provided and already taken
            if (!Objects.equals(newEmail, "")) {
                if (Objects.equals(newEmail, user.getEmail())) {
                    user.setEmail(newEmail);
                } else {
                    if (userRepository.existsByEmail(newEmail)) {
                        return ResponseEntity
                                .badRequest()
                                .body(new MessageResponse("Error: Email already taken!"));
                    } else {
                        user.setEmail(newEmail);
                    }
                }
            }

            // check if new password was set
            if(!Objects.equals(newPassword, "")) {
                user.setPassword(encoder.encode(newPassword));
            }

            // check if new role provided
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
                    case "customer":
                        role = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        user.setRole(role);
                        break;
                    default:
                        return ResponseEntity
                                .badRequest()
                                .body(new MessageResponse("Error: Give valid role!"));
                }
            } else {
                logger.info(strRole);
                strRole = user.getRole().getName().toString().substring(5);
            }

            // Connection to Delivery Eureka Client
            String url = discoveryClient.getNextServerFromEureka("API-GATEWAY-SERVICE", false).getHomePageUrl();

            // login for authentication
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String loginRequestJson = "{" +
                    "\"username\":\"dispatcher\"," +
                    "\"password\":\"123456\"" +
                    "}";
            HttpEntity<String> loginHttpEntity = new HttpEntity<String>(loginRequestJson, headers);
            ResponseEntity<String> loginResult = restTemplate().postForEntity(url +"cas-api/auth/signin", loginHttpEntity, String.class);
            logger.info(String.valueOf(loginResult.getHeaders()));

            headers.add("Cookie", loginResult.getHeaders().getFirst(HttpHeaders.SET_COOKIE));

            // send request to delivery api
            String requestJson =  "{" +
                    "\"username\":\"" + updateUserRequest.getUsername() + "\"," +
                    "\"email\":\"" + updateUserRequest.getEmail() + "\"," +
                    "\"role\":\"" + strRole + "\"" +
                    "}";
            logger.info(requestJson);
            logger.info(url +"delivery-api/user-management/updateUser");
            HttpEntity<String> httpEntity = new HttpEntity<String>(requestJson, headers);
            ResponseEntity<String> userResult = restTemplate().postForEntity(url +"delivery-api/user-management/updateUser/" + userName, httpEntity, String.class);
            logger.info(String.valueOf(userResult.getStatusCode()));

            if (!Objects.equals(String.valueOf(userResult.getStatusCode()), "200 OK")) {
                return new ResponseEntity<>("User could not be saved in delivery database!", HttpStatus.CONFLICT);
            } else {
                userRepository.save(user);
                return ResponseEntity.ok(new MessageResponse("User successfully updated!"));
            }

        } else {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: User with this username does not exist!"));
        }
    }

    /**
     * delete user
     * @param userId user that has to be deleted
     * @return response
     */
    @DeleteMapping("/deleteUser/{username}")
    @PreAuthorize("hasRole('ROLE_DISPATCHER')")
    @Operation(summary = "Request is protected. Only available for Dispatcher.")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        if (userRepository.existsByUsername(username)) {
            User user = userRepository.findUserByUsername(username);
            if (Objects.equals(user.getUsername(), "dispatcher")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: This dispatcher can not be deleted!"));
            }

            // Connection to Delivery Eureka Client
            String url = discoveryClient.getNextServerFromEureka("API-GATEWAY-SERVICE", false).getHomePageUrl();

            // login for authentication
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String loginRequestJson = "{" +
                    "\"username\":\"dispatcher\"," +
                    "\"password\":\"123456\"" +
                    "}";
            HttpEntity<String> loginHttpEntity = new HttpEntity<String>(loginRequestJson, headers);
            ResponseEntity<String> loginResult = restTemplate().postForEntity(url +"cas-api/auth/signin", loginHttpEntity, String.class);

            headers.add("Cookie", loginResult.getHeaders().getFirst(HttpHeaders.SET_COOKIE));

            HttpEntity<String> httpEntity = new HttpEntity<String>(headers);
            ResponseEntity<String> userResult = restTemplate().exchange(url +"delivery-api/user-management/deleteUser/" + username, HttpMethod.DELETE, httpEntity, String.class);
            logger.info(String.valueOf(userResult.getStatusCode()));
            if (!Objects.equals(String.valueOf(userResult.getStatusCode()), "200 OK")) {
                return new ResponseEntity<>("User could not be saved in delivery database!", HttpStatus.CONFLICT);
            } else {
                userRepository.delete(user);
                return ResponseEntity.ok(new MessageResponse("User successfully deleted!"));
            }
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: User with this username does not exist!"));
        }
    }
}
