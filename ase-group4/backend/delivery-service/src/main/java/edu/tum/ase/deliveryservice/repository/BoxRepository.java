package edu.tum.ase.deliveryservice.repository;

import edu.tum.ase.deliveryservice.model.Box;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;

import org.springframework.data.domain.Pageable;

public interface BoxRepository extends MongoRepository<Box, Id> {
    Box findById(String id);
    Box findByRaspberryId (String raspberryId);
    Boolean existsByName(String name);
    Boolean existsByRaspberryId(String raspberryId);
    Boolean existsById(String id);
    Page<Box> findAll(Pageable pageable);
}