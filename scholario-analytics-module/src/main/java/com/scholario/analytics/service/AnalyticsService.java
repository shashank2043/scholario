package com.scholario.analytics.service;

import com.scholario.analytics.dto.BookUsageAnalytics;
import com.scholario.analytics.dto.CourseMaterialStats;
import com.scholario.analytics.dto.FacultyPerformance;
import com.scholario.analytics.dto.StudentEngagement;
import com.scholario.book.model.Book;
import com.scholario.book.repository.BookRepository;
import com.scholario.content.model.DigitalContent;
import com.scholario.content.repository.ContentAccessLogRepository;
import com.scholario.content.repository.DigitalContentRepository;
import com.scholario.course.model.Course;
import com.scholario.course.model.CourseMaterial;
import com.scholario.course.repository.CourseMaterialRepository;
import com.scholario.course.repository.CourseRepository;
import com.scholario.lending.repository.IssueRecordRepository;
import com.scholario.reserve.repository.ReservationRepository;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookRepository bookRepository;
    private final IssueRecordRepository issueRecordRepository;
    private final ReservationRepository reservationRepository;
    private final DigitalContentRepository digitalContentRepository;
    private final ContentAccessLogRepository contentAccessLogRepository;
    private final CourseRepository courseRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final UserRepository userRepository;

    public BookUsageAnalytics getBookUsageAnalytics(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        long issues = issueRecordRepository.countByBookId(bookId);
        long reservations = reservationRepository.countByBookId(bookId);
        
        List<Long> contentIds = digitalContentRepository.findByBookId(bookId).stream()
                .map(DigitalContent::getId)
                .toList();
        
        long digitalAccess = contentIds.isEmpty() ? 0 : contentAccessLogRepository.countByContentIdIn(contentIds);

        return new BookUsageAnalytics(bookId, book.getTitle(), issues, reservations, digitalAccess);
    }

    public CourseMaterialStats getCourseMaterialStats(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        List<CourseMaterial> materials = courseMaterialRepository.findByCourseId(courseId);
        long total = materials.size();
        long mandatory = materials.stream().filter(CourseMaterial::isMandatory).count();
        long optional = total - mandatory;

        if (total == 0) {
            return new CourseMaterialStats(courseId, course.getCourseCode(), 0, 0, 0, 0.0);
        }

        long usedMaterials = 0;
        for (CourseMaterial material : materials) {
            Long bookId = material.getBookId();
            boolean hasUsage = issueRecordRepository.countByBookId(bookId) > 0 ||
                               reservationRepository.countByBookId(bookId) > 0;

            if (!hasUsage) {
                List<Long> contentIds = digitalContentRepository.findByBookId(bookId).stream()
                        .map(DigitalContent::getId)
                        .toList();
                if (!contentIds.isEmpty() && contentAccessLogRepository.countByContentIdIn(contentIds) > 0) {
                    hasUsage = true;
                }
            }

            if (hasUsage) {
                usedMaterials++;
            }
        }

        double usageRate = (double) usedMaterials / total;

        return new CourseMaterialStats(courseId, course.getCourseCode(), total, mandatory, optional, usageRate);
    }

    public FacultyPerformance getFacultyPerformance(Long facultyId) {
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty not found"));

        long books = bookRepository.countByFacultyId(facultyId);
        long courses = courseRepository.countByFacultyId(facultyId);
        
        // engagement as total issues of their books
        List<Book> facultyBooks = bookRepository.findByFacultyId(facultyId);
        long engagement = facultyBooks.stream()
                .mapToLong(b -> issueRecordRepository.countByBookId(b.getId()))
                .sum();

        return new FacultyPerformance(facultyId, faculty.getFullName(), books, courses, engagement);
    }

    public StudentEngagement getStudentEngagement(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        long borrowed = issueRecordRepository.countByUserId(studentId);
        long digital = contentAccessLogRepository.countByUserId(studentId);
        long reservations = reservationRepository.countByUserId(studentId);

        return new StudentEngagement(studentId, student.getFullName(), borrowed, digital, reservations);
    }
}
