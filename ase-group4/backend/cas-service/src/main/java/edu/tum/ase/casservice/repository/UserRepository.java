package edu.tum.ase.casservice.repository;

import edu.tum.ase.casservice.model.Role;
import edu.tum.ase.casservice.model.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends MongoRepository<User, Id> {
    Optional<User> findByUsername(String username);
    User findById(String id);
    User findUserByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsById(String id);
    User findByEmail(String email);
    List<User> findAll();
    List<User> findAllByRole(Role role);
}