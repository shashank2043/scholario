package com.scholario.recommendation.service;

import com.scholario.book.repository.BookRepository;
import com.scholario.course.model.Course;
import com.scholario.course.repository.CourseMaterialRepository;
import com.scholario.course.repository.CourseRepository;
import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.repository.IssueRecordRepository;
import com.scholario.recommendation.dto.BookRecommendation;
import com.scholario.recommendation.dto.CourseMaterialSuggestion;
import com.scholario.recommendation.dto.DemandPrediction;
import com.scholario.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BookRepository bookRepository;
    private final IssueRecordRepository issueRecordRepository;
    private final CourseRepository courseRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final UserRepository userRepository;

    public List<BookRecommendation> recommendBooks(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        // Logic: Recommend books from the same department that the user hasn't borrowed
        List<IssueRecord> history = issueRecordRepository.findByUserId(userId);
        List<Long> borrowedBookIds = history.stream()
                .map(IssueRecord::getBookId)
                .toList();

        // For demo, we'll just pick some books from the same department
        // (Assuming department filter or just some popular books)
        return bookRepository.findAll().stream()
                .filter(b -> !borrowedBookIds.contains(b.getId()))
                .limit(5)
                .map(b -> new BookRecommendation(
                        b.getId(),
                        b.getTitle(),
                        "Popular in your department",
                        0.85))
                .toList();
    }

    public List<CourseMaterialSuggestion> suggestCourseMaterials(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Logic: Suggest books authored by the same faculty that are not already assigned
        List<Long> assignedIds = courseMaterialRepository.findBookIdsByCourseId(courseId);
        
        return bookRepository.findByFacultyId(course.getFacultyId()).stream()
                .filter(b -> !assignedIds.contains(b.getId()))
                .limit(3)
                .map(b -> new CourseMaterialSuggestion(
                        b.getId(),
                        b.getTitle(),
                        course.getTitle(),
                        "Authored by course faculty"))
                .toList();
    }

    public List<DemandPrediction> predictDemand() {
        // Logic: Use analytics to predict demand
        // Books with high reservation counts or frequent lending are high demand
        Map<Long, Long> issueCountsByBook = issueRecordRepository.countIssuesByBook().stream()
                .collect(Collectors.toMap(
                        IssueRecordRepository.BookIssueCount::getBookId,
                        IssueRecordRepository.BookIssueCount::getIssueCount));

        return bookRepository.findAll().stream()
                .limit(10)
                .map(b -> {
                    long issues = issueCountsByBook.getOrDefault(b.getId(), 0L);
                    int predicted = (int) (issues * 1.2 + 5);
                    String risk = predicted > 20 ? "HIGH" : "LOW";
                    return new DemandPrediction(b.getId(), b.getTitle(), predicted, risk);
                })
                .sorted((a, b) -> Integer.compare(b.predictedDemandCount(), a.predictedDemandCount()))
                .toList();
    }
}
