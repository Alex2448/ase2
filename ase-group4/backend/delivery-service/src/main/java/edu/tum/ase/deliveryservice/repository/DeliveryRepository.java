package edu.tum.ase.deliveryservice.repository;

import edu.tum.ase.deliveryservice.model.Box;
import edu.tum.ase.deliveryservice.model.Delivery;
import edu.tum.ase.deliveryservice.model.EStatus;
import edu.tum.ase.deliveryservice.model.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import javax.validation.constraints.NotBlank;

import java.util.List;

public interface DeliveryRepository extends MongoRepository<Delivery, Id> {
    Page<Delivery> findAll(Pageable pageable);
    Delivery findById(String id);
    Delivery findTopByTargetBoxId(String id);
    Boolean existsByTargetBoxId(String id);
    Boolean existsById(String id);
    Page<Delivery> findAllByCustomerIdAndStatus(String customerName, @NotBlank EStatus status, Pageable pageable);
    Page<Delivery> findAllByCustomerIdAndStatusAndTargetBox(@NotBlank String customerName, @NotBlank EStatus status, @NotBlank Box box, Pageable pageable);
    Page<Delivery> findAllByCustomerIdAndStatusAndTrackingCodeContaining(String customerName, @NotBlank EStatus status, String searchParam, Pageable pageable);

    Page<Delivery> findAllByCustomerIdAndStatusOrStatusOrStatus
            (String customerId, @NotBlank EStatus firstStatus, @NotBlank EStatus secondStatus,
             @NotBlank EStatus thirdStatus, Pageable pageable);
    Page<Delivery> findAllByCustomerIdAndTrackingCodeContainingAndStatusOrStatusOrStatus
            (String customerName, String searchParam, @NotBlank EStatus firstStatus, @NotBlank EStatus secondStatus,
             @NotBlank EStatus thirdStatus,  Pageable pageable);
    Page<Delivery> findAllByDelivererIdAndStatus(String delivererName, @NotBlank EStatus status, Pageable pageable);
    Page<Delivery> findAllByDelivererIdAndStatusAndTargetBox(@NotBlank String delivererName, @NotBlank EStatus status, @NotBlank Box box, Pageable pageable);
    Page<Delivery> findAllByDelivererIdAndStatusAndTrackingCodeContaining(String delivererName, @NotBlank EStatus status, String searchParam, Pageable pageable);
    Page<Delivery> findAllByDelivererIdAndStatusOrStatusOrStatus
            (String delivererName, @NotBlank EStatus firstStatus, @NotBlank EStatus secondStatus,
             @NotBlank EStatus thirdStatus, Pageable pageable);
    Page<Delivery> findAllByDelivererIdAndTrackingCodeContainingAndStatusOrStatusOrStatus
            (String delivererName, String searchParam, @NotBlank EStatus firstStatus, @NotBlank EStatus secondStatus,
             @NotBlank EStatus thirdStatus,  Pageable pageable);
    Boolean existsDeliveryByTargetBoxAndStatus(@NotBlank Box targetBox, @NotBlank EStatus status);
    Boolean existsDeliveryByTargetBoxAndDelivererAndStatus(@NotBlank Box targetBox, @NotBlank User deliverer, @NotBlank EStatus status);
    Boolean existsDeliveryByTargetBoxAndCustomerAndStatus(@NotBlank Box targetBox, @NotBlank User customer, @NotBlank EStatus status);
    Delivery findTopDeliveryByTargetBoxIdAndStatus(String boxId, String status);
}
