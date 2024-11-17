package edu.tum.ase.casservice.controller;

import edu.tum.ase.casservice.email.EmailService;
import edu.tum.ase.casservice.payload.request.LoginRequest;
import edu.tum.ase.casservice.payload.response.JwtResponse;
import edu.tum.ase.casservice.repository.RoleRepository;
import edu.tum.ase.casservice.repository.UserRepository;
import edu.tum.ase.casservice.security.jwt.JwtUtil;
import edu.tum.ase.casservice.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cas-api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    EmailService emailService;

    /**
     * signin request for users
     *
     * @param loginRequest request body (username and password)
     * @param response     user information
     * @return user information
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Create HTTP Only Cookie
        String jwt = jwtUtil.generateJwtToken(authentication);
        Cookie jwtCookie = new Cookie("jwt", jwt);
        jwtCookie.setMaxAge(2 * 60 * 60); // expires in 2 hours
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/"); // global cookie accessible everywhere
        response.addCookie(jwtCookie);

        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) authentication.getPrincipal();

        List<String> roles = userDetailsImpl.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetailsImpl.getId(),
                userDetailsImpl.getUsername(),
                userDetailsImpl.getEmail(),
                roles));
    }

    /**
     * logout to invalidate jwt cookie
     * @param response success message
     * @return empty jwt cookie
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Create HTTP Only Cookie
        Cookie jwtCookie = new Cookie("jwt", "");
        jwtCookie.setMaxAge(2 * 60 * 60); // expires in 2 hours
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/"); // global cookie accessible everywhere
        response.addCookie(jwtCookie);
        return new ResponseEntity<>("Successful Logout",HttpStatus.OK);
    }

    /**
     * get csrf token
     *
     * @param request
     * @return ok status and csrf token
     */
    @GetMapping("/csrf")
    public ResponseEntity<?> csrf(HttpServletRequest request) {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
