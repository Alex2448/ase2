package edu.tum.ase.deliveryservice.repository;

import edu.tum.ase.deliveryservice.model.ERole;
import edu.tum.ase.deliveryservice.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(ERole name);
}
