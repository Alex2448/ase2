package edu.tum.ase.deliveryservice.payload.request.user;

import jdk.jfr.BooleanFlag;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.mongodb.core.mapping.DBRef;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
//import java.util.Set;

@Getter @Setter
public class UpdateUserRequest {

    @Size(min= 5, max = 20)
    private String username;


    @Size(max=50)
    @Email
    private String email;

    private String role;

    @BooleanFlag
    private boolean enabled;
}

