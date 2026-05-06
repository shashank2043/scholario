package com.scholario.royalty.repository;

import com.scholario.royalty.model.RoyaltyPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoyaltyPolicyRepository extends JpaRepository<RoyaltyPolicy, Long> {
    Optional<RoyaltyPolicy> findByBookId(Long bookId);
}
