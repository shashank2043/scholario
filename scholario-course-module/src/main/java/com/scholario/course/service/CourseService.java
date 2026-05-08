package com.scholario.course.service;

import com.scholario.book.model.Book;
import com.scholario.book.repository.BookRepository;
import com.scholario.course.dto.CourseInput;
import com.scholario.course.dto.CourseMaterialInput;
import com.scholario.course.model.Course;
import com.scholario.course.model.CourseMaterial;
import com.scholario.course.repository.CourseMaterialRepository;
import com.scholario.course.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final BookRepository bookRepository;

    public CourseService(CourseRepository courseRepository,
                         CourseMaterialRepository courseMaterialRepository,
                         BookRepository bookRepository) {
        this.courseRepository = courseRepository;
        this.courseMaterialRepository = courseMaterialRepository;
        this.bookRepository = bookRepository;
    }

    // Course operations

    public Course createCourse(CourseInput input) {
        if (courseRepository.findByCourseCode(input.courseCode()).isPresent()) {
            throw new IllegalArgumentException("Course with code " + input.courseCode() + " already exists");
        }

        Course course = new Course();
        course.setCourseCode(input.courseCode());
        course.setTitle(input.title());
        course.setDescription(input.description());
        course.setFacultyId(input.facultyId());

        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, CourseInput input) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));

        if (input.title() != null) {
            course.setTitle(input.title());
        }
        if (input.description() != null) {
            course.setDescription(input.description());
        }
        if (input.facultyId() != null) {
            course.setFacultyId(input.facultyId());
        }

        return courseRepository.save(course);
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public List<Course> getCoursesByFaculty(Long facultyId) {
        return courseRepository.findByFacultyId(facultyId);
    }

    public List<Course> searchCourses(String courseCode, String title) {
        if (courseCode != null) {
            return courseRepository.findByCourseCode(courseCode)
                    .map(List::of)
                    .orElse(List.of());
        }
        if (title != null) {
            return courseRepository.searchCourses(null, title);
        }
        return courseRepository.findAll();
    }

    // Course Material operations (assign books to courses)

    public CourseMaterial assignBookToCourse(CourseMaterialInput input) {
        Course course = courseRepository.findById(input.courseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + input.courseId()));

        Book book = bookRepository.findById(input.bookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + input.bookId()));

        // Check version consistency - only assign published books
        if (!(book.getState() instanceof com.scholario.book.model.Published)) {
            throw new IllegalStateException("Can only assign published books to courses");
        }

        // Check if already assigned
        if (courseMaterialRepository.findByCourseIdAndBookId(input.courseId(), input.bookId()).isPresent()) {
            throw new IllegalArgumentException("Book already assigned to this course");
        }

        CourseMaterial material = new CourseMaterial();
        material.setCourse(course);
        material.setBookId(input.bookId());
        material.setMandatory(input.mandatory() != null && input.mandatory());

        return courseMaterialRepository.save(material);
    }

    public CourseMaterial updateCourseMaterial(Long id, Boolean mandatory) {
        CourseMaterial material = courseMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course material not found with id: " + id));

        if (mandatory != null) {
            material.setMandatory(mandatory);
        }

        return courseMaterialRepository.save(material);
    }

    public CourseMaterial removeBookFromCourse(Long id) {
        CourseMaterial material = courseMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course material not found with id: " + id));

        courseMaterialRepository.delete(material);
        return material;
    }

    public List<CourseMaterial> getCourseMaterials(Long courseId) {
        return courseMaterialRepository.findMaterialsByCourseId(courseId);
    }

    public List<Book> getBooksByCourse(Long courseId) {
        List<Long> bookIds = courseMaterialRepository.findBookIdsByCourseId(courseId);
        return bookRepository.findAllById(bookIds);
    }
}