package com.scholario.royalty.resolver;

import com.scholario.royalty.model.RoyaltyRecord;
import com.scholario.royalty.service.RoyaltyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoyaltyQueryResolverTest {

    @Mock
    private RoyaltyService royaltyService;

    @InjectMocks
    private RoyaltyQueryResolver royaltyQueryResolver;

    private RoyaltyRecord royaltyRecord1;
    private RoyaltyRecord royaltyRecord2;

    @BeforeEach
    void setUp() {
        royaltyRecord1 = new RoyaltyRecord();
        royaltyRecord1.setId(1L);
        royaltyRecord1.setBookId(1L);
        royaltyRecord1.setFacultyId(2L);
        royaltyRecord1.setTotalRevenue(new BigDecimal("1000.00"));
        royaltyRecord1.setCalculatedRoyalty(new BigDecimal("100.00"));
        royaltyRecord1.setPayoutStatus("PENDING");

        royaltyRecord2 = new RoyaltyRecord();
        royaltyRecord2.setId(2L);
        royaltyRecord2.setBookId(1L);
        royaltyRecord2.setFacultyId(2L);
        royaltyRecord2.setTotalRevenue(new BigDecimal("2000.00"));
        royaltyRecord2.setCalculatedRoyalty(new BigDecimal("200.00"));
        royaltyRecord2.setPayoutStatus("COMPLETED");
    }

    @Test
    void getRoyaltyDetails_ShouldReturnRecords_WhenRecordsExist() {
        Long bookId = 1L;
        when(royaltyService.getRoyaltyDetails(bookId)).thenReturn(List.of(royaltyRecord1, royaltyRecord2));

        List<RoyaltyRecord> results = royaltyQueryResolver.getRoyaltyDetails(bookId);

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(1L, results.get(0).getId());
        assertEquals(2L, results.get(1).getId());
        verify(royaltyService, times(1)).getRoyaltyDetails(bookId);
    }

    @Test
    void getRoyaltyDetails_ShouldReturnEmptyList_WhenNoRecordsExist() {
        Long bookId = 99L;
        when(royaltyService.getRoyaltyDetails(bookId)).thenReturn(List.of());

        List<RoyaltyRecord> results = royaltyQueryResolver.getRoyaltyDetails(bookId);

        assertNotNull(results);
        assertTrue(results.isEmpty());
        verify(royaltyService, times(1)).getRoyaltyDetails(bookId);
    }

    @Test
    void getRoyaltyDetails_ShouldReturnSingleRecord() {
        Long bookId = 1L;
        when(royaltyService.getRoyaltyDetails(bookId)).thenReturn(List.of(royaltyRecord1));

        List<RoyaltyRecord> results = royaltyQueryResolver.getRoyaltyDetails(bookId);

        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getId());
        verify(royaltyService, times(1)).getRoyaltyDetails(bookId);
    }

    @Test
    void getRevenueByBook_ShouldReturnTotalRevenue() {
        Long bookId = 1L;
        when(royaltyService.getRevenueByBook(bookId)).thenReturn(new BigDecimal("3000.00"));

        BigDecimal result = royaltyQueryResolver.getRevenueByBook(bookId);

        assertNotNull(result);
        assertEquals(new BigDecimal("3000.00"), result);
        verify(royaltyService, times(1)).getRevenueByBook(bookId);
    }

    @Test
    void getRevenueByBook_ShouldReturnZero_WhenNoRecordsExist() {
        Long bookId = 99L;
        when(royaltyService.getRevenueByBook(bookId)).thenReturn(BigDecimal.ZERO);

        BigDecimal result = royaltyQueryResolver.getRevenueByBook(bookId);

        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result);
        verify(royaltyService, times(1)).getRevenueByBook(bookId);
    }

    @Test
    void getRevenueByBook_ShouldReturnCorrectAmount() {
        Long bookId = 1L;
        when(royaltyService.getRevenueByBook(bookId)).thenReturn(new BigDecimal("1500.50"));

        BigDecimal result = royaltyQueryResolver.getRevenueByBook(bookId);

        assertEquals(new BigDecimal("1500.50"), result);
        verify(royaltyService, times(1)).getRevenueByBook(bookId);
    }
}