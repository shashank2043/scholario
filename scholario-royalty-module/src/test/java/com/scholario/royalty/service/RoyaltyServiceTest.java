package com.scholario.royalty.service;

import com.scholario.royalty.dto.RoyaltyPolicyInput;
import com.scholario.royalty.model.RoyaltyPolicy;
import com.scholario.royalty.model.RoyaltyRecord;
import com.scholario.royalty.repository.RoyaltyPolicyRepository;
import com.scholario.royalty.repository.RoyaltyRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoyaltyServiceTest {

    @Mock
    private RoyaltyPolicyRepository policyRepository;

    @Mock
    private RoyaltyRecordRepository recordRepository;

    @InjectMocks
    private RoyaltyService royaltyService;

    private RoyaltyPolicy existingPolicy;
    private RoyaltyRecord royaltyRecord1;
    private RoyaltyRecord royaltyRecord2;

    @BeforeEach
    void setUp() {
        existingPolicy = new RoyaltyPolicy();
        existingPolicy.setId(1L);
        existingPolicy.setBookId(1L);
        existingPolicy.setFacultyId(2L);
        existingPolicy.setRoyaltyPercentage(new BigDecimal("10.0"));

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
    void defineRoyaltyPolicy_ShouldCreateNewPolicy_WhenPolicyDoesNotExist() {
        RoyaltyPolicyInput input = new RoyaltyPolicyInput(1L, 2L, new BigDecimal("10.0"), null);

        when(policyRepository.findByBookId(1L)).thenReturn(Optional.empty());
        when(policyRepository.save(any(RoyaltyPolicy.class))).thenAnswer(inv -> {
            RoyaltyPolicy p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        RoyaltyPolicy result = royaltyService.defineRoyaltyPolicy(input);

        assertNotNull(result);
        assertEquals(1L, result.getBookId());
        assertEquals(2L, result.getFacultyId());
        assertEquals(new BigDecimal("10.0"), result.getRoyaltyPercentage());
        verify(policyRepository, times(1)).findByBookId(1L);
        verify(policyRepository, times(1)).save(any(RoyaltyPolicy.class));
    }

    @Test
    void defineRoyaltyPolicy_ShouldUpdateExistingPolicy_WhenPolicyExists() {
        RoyaltyPolicyInput input = new RoyaltyPolicyInput(1L, 2L, new BigDecimal("15.0"), null);

        when(policyRepository.findByBookId(1L)).thenReturn(Optional.of(existingPolicy));
        when(policyRepository.save(any(RoyaltyPolicy.class))).thenReturn(existingPolicy);

        RoyaltyPolicy result = royaltyService.defineRoyaltyPolicy(input);

        assertNotNull(result);
        assertEquals(1L, result.getBookId());
        assertEquals(new BigDecimal("15.0"), result.getRoyaltyPercentage());
        verify(policyRepository, times(1)).findByBookId(1L);
        verify(policyRepository, times(1)).save(any(RoyaltyPolicy.class));
    }

    @Test
    void defineRoyaltyPolicy_ShouldSetSharingModel_WhenProvided() {
        RoyaltyPolicyInput input = new RoyaltyPolicyInput(1L, 2L, new BigDecimal("10.0"),
                java.util.Map.of("type", "FIXED", "details", "Standard"));

        when(policyRepository.findByBookId(1L)).thenReturn(Optional.empty());
        when(policyRepository.save(any(RoyaltyPolicy.class))).thenAnswer(inv -> inv.getArgument(0));

        RoyaltyPolicy result = royaltyService.defineRoyaltyPolicy(input);

        assertNotNull(result);
        assertEquals(1L, result.getBookId());
        assertNotNull(result.getSharingModel());
        verify(policyRepository, times(1)).save(any(RoyaltyPolicy.class));
    }

    @Test
    void calculateRoyalty_ShouldCalculateAndSaveRecord() {
        Long bookId = 1L;
        BigDecimal totalRevenue = new BigDecimal("1000.00");

        when(policyRepository.findByBookId(bookId)).thenReturn(Optional.of(existingPolicy));
        when(recordRepository.save(any(RoyaltyRecord.class))).thenAnswer(inv -> {
            RoyaltyRecord r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });

        RoyaltyRecord result = royaltyService.calculateRoyalty(bookId, totalRevenue);

        assertNotNull(result);
        assertEquals(1L, result.getBookId());
        assertEquals(2L, result.getFacultyId());
        assertEquals(new BigDecimal("1000.00"), result.getTotalRevenue());
        assertEquals(new BigDecimal("100.00"), result.getCalculatedRoyalty());
        assertEquals("PENDING", result.getPayoutStatus());
        verify(policyRepository, times(1)).findByBookId(bookId);
        verify(recordRepository, times(1)).save(any(RoyaltyRecord.class));
    }

    @Test
    void calculateRoyalty_ShouldUseCorrectFormula_WithDifferentPercentages() {
        Long bookId = 1L;
        BigDecimal totalRevenue = new BigDecimal("500.00");

        existingPolicy.setRoyaltyPercentage(new BigDecimal("20.0"));
        when(policyRepository.findByBookId(bookId)).thenReturn(Optional.of(existingPolicy));
        when(recordRepository.save(any(RoyaltyRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        RoyaltyRecord result = royaltyService.calculateRoyalty(bookId, totalRevenue);

        assertEquals(new BigDecimal("100.00"), result.getCalculatedRoyalty());
    }

    @Test
    void calculateRoyalty_ShouldThrowException_WhenPolicyNotFound() {
        Long bookId = 99L;
        BigDecimal totalRevenue = new BigDecimal("1000.00");

        when(policyRepository.findByBookId(bookId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> royaltyService.calculateRoyalty(bookId, totalRevenue));

        assertEquals("Royalty policy not found for book: 99", exception.getMessage());
        verify(policyRepository, times(1)).findByBookId(bookId);
        verify(recordRepository, never()).save(any(RoyaltyRecord.class));
    }

    @Test
    void calculateRoyalty_ShouldHandleRoundingCorrectly() {
        Long bookId = 1L;
        BigDecimal totalRevenue = new BigDecimal("333.33");

        existingPolicy.setRoyaltyPercentage(new BigDecimal("10.0"));
        when(policyRepository.findByBookId(bookId)).thenReturn(Optional.of(existingPolicy));
        when(recordRepository.save(any(RoyaltyRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        RoyaltyRecord result = royaltyService.calculateRoyalty(bookId, totalRevenue);

        assertEquals(new BigDecimal("33.33"), result.getCalculatedRoyalty());
    }

    @Test
    void distributeRoyalty_ShouldUpdateStatusToCompleted() {
        Long recordId = 1L;
        royaltyRecord1.setPayoutStatus("PENDING");

        when(recordRepository.findById(recordId)).thenReturn(Optional.of(royaltyRecord1));
        when(recordRepository.save(any(RoyaltyRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        RoyaltyRecord result = royaltyService.distributeRoyalty(recordId);

        assertNotNull(result);
        assertEquals("COMPLETED", result.getPayoutStatus());
        assertNotNull(result.getDistributedAt());
        verify(recordRepository, times(1)).findById(recordId);
        verify(recordRepository, times(1)).save(any(RoyaltyRecord.class));
    }

    @Test
    void distributeRoyalty_ShouldThrowException_WhenRecordNotFound() {
        Long recordId = 99L;

        when(recordRepository.findById(recordId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> royaltyService.distributeRoyalty(recordId));

        assertEquals("Royalty record not found: 99", exception.getMessage());
        verify(recordRepository, times(1)).findById(recordId);
        verify(recordRepository, never()).save(any(RoyaltyRecord.class));
    }

    @Test
    void distributeRoyalty_ShouldSetDistributedAt_WhenStatusChanges() {
        Long recordId = 1L;
        royaltyRecord1.setPayoutStatus("PENDING");
        royaltyRecord1.setDistributedAt(null);

        when(recordRepository.findById(recordId)).thenReturn(Optional.of(royaltyRecord1));
        when(recordRepository.save(any(RoyaltyRecord.class))).thenAnswer(inv -> {
            RoyaltyRecord r = inv.getArgument(0);
            r.setDistributedAt(LocalDateTime.now());
            return r;
        });

        RoyaltyRecord result = royaltyService.distributeRoyalty(recordId);

        assertEquals("COMPLETED", result.getPayoutStatus());
        assertNotNull(result.getDistributedAt());
    }

    @Test
    void getRoyaltyDetails_ShouldReturnRecords_WhenRecordsExist() {
        Long bookId = 1L;

        when(recordRepository.findByBookId(bookId)).thenReturn(List.of(royaltyRecord1, royaltyRecord2));

        List<RoyaltyRecord> results = royaltyService.getRoyaltyDetails(bookId);

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(1L, results.get(0).getId());
        assertEquals(2L, results.get(1).getId());
        verify(recordRepository, times(1)).findByBookId(bookId);
    }

    @Test
    void getRoyaltyDetails_ShouldReturnEmptyList_WhenNoRecordsExist() {
        Long bookId = 99L;

        when(recordRepository.findByBookId(bookId)).thenReturn(List.of());

        List<RoyaltyRecord> results = royaltyService.getRoyaltyDetails(bookId);

        assertNotNull(results);
        assertTrue(results.isEmpty());
        verify(recordRepository, times(1)).findByBookId(bookId);
    }

    @Test
    void getRevenueByBook_ShouldReturnTotalRevenue() {
        Long bookId = 1L;

        when(recordRepository.findByBookId(bookId)).thenReturn(List.of(royaltyRecord1, royaltyRecord2));

        BigDecimal result = royaltyService.getRevenueByBook(bookId);

        assertEquals(new BigDecimal("3000.00"), result);
        verify(recordRepository, times(1)).findByBookId(bookId);
    }

    @Test
    void getRevenueByBook_ShouldReturnZero_WhenNoRecordsExist() {
        Long bookId = 99L;

        when(recordRepository.findByBookId(bookId)).thenReturn(List.of());

        BigDecimal result = royaltyService.getRevenueByBook(bookId);

        assertEquals(BigDecimal.ZERO, result);
        verify(recordRepository, times(1)).findByBookId(bookId);
    }

    @Test
    void getRevenueByBook_ShouldHandleSingleRecord() {
        Long bookId = 1L;

        when(recordRepository.findByBookId(bookId)).thenReturn(List.of(royaltyRecord1));

        BigDecimal result = royaltyService.getRevenueByBook(bookId);

        assertEquals(new BigDecimal("1000.00"), result);
    }
}