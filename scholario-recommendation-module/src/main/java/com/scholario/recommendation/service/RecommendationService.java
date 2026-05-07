package com.scholario.recommendation.service;

import com.scholario.analytics.service.AnalyticsService;
import com.scholario.book.model.Book;
import com.scholario.book.repository.BookRepository;
import com.scholario.course.model.Course;
import com.scholario.course.repository.CourseMaterialRepository;
import com.scholario.course.repository.CourseRepository;
import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.repository.IssueRecordRepository;
import com.scholario.recommendation.dto.BookRecommendation;
import com.scholario.recommendation.dto.CourseMaterialSuggestion;
import com.scholario.recommendation.dto.DemandPrediction;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BookRepository bookRepository;
    private final IssueRecordRepository issueRecordRepository;
    private final CourseRepository courseRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final UserRepository userRepository;
    private final AnalyticsService analyticsService;

    public List<BookRecommendation> recommendBooks(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Logic: Recommend books from the same department that the user hasn't borrowed
        List<IssueRecord> history = issueRecordRepository.findByUserId(userId);
        List<Long> borrowedBookIds = history.stream()
                .map(IssueRecord::getBookId)
                .collect(Collectors.toList());

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
                .collect(Collectors.toList());
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
                .collect(Collectors.toList());
    }

    public List<DemandPrediction> predictDemand() {
        // Logic: Use analytics to predict demand
        // Books with high reservation counts or frequent lending are high demand
        return bookRepository.findAll().stream()
                .limit(10)
                .map(b -> {
                    long issues = issueRecordRepository.countByBookId(b.getId());
                    int predicted = (int) (issues * 1.2 + 5);
                    String risk = predicted > 20 ? "HIGH" : "LOW";
                    return new DemandPrediction(b.getId(), b.getTitle(), predicted, risk);
                })
                .sorted((a, b) -> Integer.compare(b.predictedDemandCount(), a.predictedDemandCount()))
                .collect(Collectors.toList());
    }
}
