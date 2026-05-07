package com.scholario.royalty.resolver;

import com.scholario.royalty.dto.RoyaltyPolicyInput;
import com.scholario.royalty.model.RoyaltyPolicy;
import com.scholario.royalty.model.RoyaltyRecord;
import com.scholario.royalty.service.RoyaltyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoyaltyMutationResolverTest {

    @Mock
    private RoyaltyService royaltyService;

    @InjectMocks
    private RoyaltyMutationResolver royaltyMutationResolver;

    private RoyaltyPolicy royaltyPolicy;
    private RoyaltyRecord royaltyRecord;

    @BeforeEach
    void setUp() {
        royaltyPolicy = new RoyaltyPolicy();
        royaltyPolicy.setId(1L);
        royaltyPolicy.setBookId(1L);
        royaltyPolicy.setFacultyId(2L);
        royaltyPolicy.setRoyaltyPercentage(new BigDecimal("10.0"));

        royaltyRecord = new RoyaltyRecord();
        royaltyRecord.setId(1L);
        royaltyRecord.setBookId(1L);
        royaltyRecord.setFacultyId(2L);
        royaltyRecord.setTotalRevenue(new BigDecimal("1000.00"));
        royaltyRecord.setCalculatedRoyalty(new BigDecimal("100.00"));
        royaltyRecord.setPayoutStatus("PENDING");
    }

    @Test
    void defineRoyaltyPolicy_ShouldReturnPolicy_WhenInputIsValid() {
        RoyaltyPolicyInput input = new RoyaltyPolicyInput(1L, 2L, new BigDecimal("10.0"), null);
        when(royaltyService.defineRoyaltyPolicy(input)).thenReturn(royaltyPolicy);

        RoyaltyPolicy result = royaltyMutationResolver.defineRoyaltyPolicy(input);

        assertNotNull(result);
        assertEquals(1L, result.getBookId());
        assertEquals(2L, result.getFacultyId());
        assertEquals(new BigDecimal("10.0"), result.getRoyaltyPercentage());
        verify(royaltyService, times(1)).defineRoyaltyPolicy(input);
    }

    @Test
    void defineRoyaltyPolicy_ShouldReturnPolicy_WithSharingModel() {
        Map<String, Object> sharingModel = Map.of("type", "FIXED", "rate", "10%");
        RoyaltyPolicyInput input = new RoyaltyPolicyInput(1L, 2L, new BigDecimal("10.0"), sharingModel);
        when(royaltyService.defineRoyaltyPolicy(input)).thenReturn(royaltyPolicy);

        RoyaltyPolicy result = royaltyMutationResolver.defineRoyaltyPolicy(input);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(royaltyService, times(1)).defineRoyaltyPolicy(input);
    }

    @Test
    void defineRoyaltyPolicy_ShouldPassCorrectInputToService() {
        RoyaltyPolicyInput input = new RoyaltyPolicyInput(5L, 10L, new BigDecimal("15.5"),
                Map.of("model", "REVENUE_SHARE"));
        when(royaltyService.defineRoyaltyPolicy(input)).thenReturn(royaltyPolicy);

        RoyaltyPolicy result = royaltyMutationResolver.defineRoyaltyPolicy(input);

        assertNotNull(result);
        verify(royaltyService, times(1)).defineRoyaltyPolicy(input);
    }

    @Test
    void calculateRoyalty_ShouldReturnRecord_WhenPolicyExists() {
        Long bookId = 1L;
        BigDecimal totalRevenue = new BigDecimal("1000.00");
        when(royaltyService.calculateRoyalty(bookId, totalRevenue)).thenReturn(royaltyRecord);

        RoyaltyRecord result = royaltyMutationResolver.calculateRoyalty(bookId, totalRevenue);

        assertNotNull(result);
        assertEquals(1L, result.getBookId());
        assertEquals(new BigDecimal("1000.00"), result.getTotalRevenue());
        assertEquals(new BigDecimal("100.00"), result.getCalculatedRoyalty());
        verify(royaltyService, times(1)).calculateRoyalty(bookId, totalRevenue);
    }

    @Test
    void calculateRoyalty_ShouldReturnRecord_WithDifferentRevenue() {
        Long bookId = 1L;
        BigDecimal totalRevenue = new BigDecimal("5000.00");
        royaltyRecord.setTotalRevenue(totalRevenue);
        royaltyRecord.setCalculatedRoyalty(new BigDecimal("500.00"));
        when(royaltyService.calculateRoyalty(bookId, totalRevenue)).thenReturn(royaltyRecord);

        RoyaltyRecord result = royaltyMutationResolver.calculateRoyalty(bookId, totalRevenue);

        assertEquals(new BigDecimal("5000.00"), result.getTotalRevenue());
        assertEquals(new BigDecimal("500.00"), result.getCalculatedRoyalty());
        verify(royaltyService, times(1)).calculateRoyalty(bookId, totalRevenue);
    }

    @Test
    void calculateRoyalty_ShouldPassCorrectArgumentsToService() {
        Long bookId = 99L;
        BigDecimal totalRevenue = new BigDecimal("2500.75");
        when(royaltyService.calculateRoyalty(bookId, totalRevenue)).thenReturn(royaltyRecord);

        RoyaltyRecord result = royaltyMutationResolver.calculateRoyalty(bookId, totalRevenue);

        assertNotNull(result);
        verify(royaltyService, times(1)).calculateRoyalty(99L, new BigDecimal("2500.75"));
    }

    @Test
    void distributeRoyalty_ShouldReturnUpdatedRecord_WhenRecordExists() {
        Long recordId = 1L;
        royaltyRecord.setPayoutStatus("COMPLETED");
        when(royaltyService.distributeRoyalty(recordId)).thenReturn(royaltyRecord);

        RoyaltyRecord result = royaltyMutationResolver.distributeRoyalty(recordId);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("COMPLETED", result.getPayoutStatus());
        verify(royaltyService, times(1)).distributeRoyalty(recordId);
    }

    @Test
    void distributeRoyalty_ShouldReturnRecord_WithDifferentRecordId() {
        Long recordId = 55L;
        royaltyRecord.setId(55L);
        royaltyRecord.setPayoutStatus("COMPLETED");
        when(royaltyService.distributeRoyalty(recordId)).thenReturn(royaltyRecord);

        RoyaltyRecord result = royaltyMutationResolver.distributeRoyalty(recordId);

        assertEquals(55L, result.getId());
        assertEquals("COMPLETED", result.getPayoutStatus());
        verify(royaltyService, times(1)).distributeRoyalty(recordId);
    }

    @Test
    void distributeRoyalty_ShouldPassCorrectRecordIdToService() {
        Long recordId = 123L;
        when(royaltyService.distributeRoyalty(recordId)).thenReturn(royaltyRecord);

        RoyaltyRecord result = royaltyMutationResolver.distributeRoyalty(recordId);

        assertNotNull(result);
        verify(royaltyService, times(1)).distributeRoyalty(123L);
    }
}