package edu.tum.ase.casservice.repository;

import edu.tum.ase.casservice.model.ERole;
import edu.tum.ase.casservice.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(ERole name);
}
