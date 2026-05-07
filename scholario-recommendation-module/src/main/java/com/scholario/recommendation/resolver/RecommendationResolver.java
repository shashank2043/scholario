package com.scholario.recommendation.resolver;

import com.scholario.recommendation.dto.BookRecommendation;
import com.scholario.recommendation.dto.CourseMaterialSuggestion;
import com.scholario.recommendation.dto.DemandPrediction;
import com.scholario.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class RecommendationResolver {

    private final RecommendationService recommendationService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<BookRecommendation> recommendBooks(@Argument Long userId) {
        return recommendationService.recommendBooks(userId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'LIBRARIAN', 'ADMIN')")
    public List<CourseMaterialSuggestion> suggestCourseMaterials(@Argument Long courseId) {
        return recommendationService.suggestCourseMaterials(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<DemandPrediction> predictDemand() {
        return recommendationService.predictDemand();
    }
}
