package edu.tum.ase.deliveryservice.repository;

import edu.tum.ase.deliveryservice.model.Role;
import edu.tum.ase.deliveryservice.model.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, Id> {
    User findById(String id);
    Optional<User> findByUsername(String username);
    User findUserByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsById(String id);
    Boolean existsByRfidToken(String token);
    User findByRfidToken(String token);
    User findByEmail(String email);
    Page<User> findAll(Pageable pageable);
    List<User> findAllByRole(Role role);
}