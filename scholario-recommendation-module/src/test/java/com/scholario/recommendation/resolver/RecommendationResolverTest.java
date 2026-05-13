package com.scholario.recommendation.resolver;

import com.scholario.recommendation.dto.BookRecommendation;
import com.scholario.recommendation.dto.CourseMaterialSuggestion;
import com.scholario.recommendation.dto.DemandPrediction;
import com.scholario.recommendation.service.RecommendationService;
import com.scholario.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationResolverTest {

    @Mock
    private RecommendationService recommendationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private RecommendationResolver recommendationResolver;

    @Test
    void recommendBooks_ShouldDelegateToService() {
        List<BookRecommendation> response = List.of(new BookRecommendation(1L, "Title", "Reason", 0.9));
        when(userService.getCurrentUserId()).thenReturn(1L);
        when(recommendationService.recommendBooks(1L)).thenReturn(response);

        List<BookRecommendation> result = recommendationResolver.recommendBooks();

        assertEquals(response, result);
        verify(recommendationService).recommendBooks(1L);
    }

    @Test
    void suggestCourseMaterials_ShouldDelegateToService() {
        List<CourseMaterialSuggestion> response = List.of(new CourseMaterialSuggestion(1L, "Title", "Context", "Reason"));
        when(recommendationService.suggestCourseMaterials(1L)).thenReturn(response);

        List<CourseMaterialSuggestion> result = recommendationResolver.suggestCourseMaterials(1L);

        assertEquals(response, result);
        verify(recommendationService).suggestCourseMaterials(1L);
    }

    @Test
    void predictDemand_ShouldDelegateToService() {
        List<DemandPrediction> response = List.of(new DemandPrediction(1L, "Title", 50, "HIGH"));
        when(recommendationService.predictDemand()).thenReturn(response);

        List<DemandPrediction> result = recommendationResolver.predictDemand();

        assertEquals(response, result);
        verify(recommendationService).predictDemand();
    }
}
