package com.scholario.review.repository;

import com.scholario.review.model.ReviewRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewRecordRepository extends JpaRepository<ReviewRecord, Long> {
    Optional<ReviewRecord> findByBookId(Long bookId);
}
