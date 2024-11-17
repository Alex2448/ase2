package edu.tum.ase.casservice.payload.request;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Getter
@Setter
public class UpdateUserRequest {

    @NotBlank
    @Size(min = 5, max = 20)
    private String username;

    @Size(max = 50)
    @Email
    private String email;

    private String password;

    private String role;
}
