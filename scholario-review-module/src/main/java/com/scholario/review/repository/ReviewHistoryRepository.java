package com.scholario.review.repository;

import com.scholario.review.model.ReviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewHistoryRepository extends JpaRepository<ReviewHistory, Long> {
    List<ReviewHistory> findByReviewRecordIdOrderByTimestampDesc(Long reviewRecordId);
}
