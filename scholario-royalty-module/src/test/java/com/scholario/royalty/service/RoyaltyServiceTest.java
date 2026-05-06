package com.scholario.royalty.service;

import com.scholario.royalty.dto.RoyaltyPolicyInput;
import com.scholario.royalty.model.RoyaltyPolicy;
import com.scholario.royalty.model.RoyaltyRecord;
import com.scholario.royalty.repository.RoyaltyPolicyRepository;
import com.scholario.royalty.repository.RoyaltyRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RoyaltyServiceTest {

    @Mock
    private RoyaltyPolicyRepository policyRepository;

    @Mock
    private RoyaltyRecordRepository recordRepository;

    @InjectMocks
    private RoyaltyService royaltyService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testDefineRoyaltyPolicy() {
        RoyaltyPolicyInput input = new RoyaltyPolicyInput(1L, 2L, new BigDecimal("10.0"), null);
        RoyaltyPolicy policy = new RoyaltyPolicy();
        policy.setBookId(1L);
        policy.setFacultyId(2L);
        policy.setRoyaltyPercentage(new BigDecimal("10.0"));

        when(policyRepository.findByBookId(1L)).thenReturn(Optional.empty());
        when(policyRepository.save(any(RoyaltyPolicy.class))).thenReturn(policy);

        RoyaltyPolicy result = royaltyService.defineRoyaltyPolicy(input);

        assertNotNull(result);
        assertEquals(new BigDecimal("10.0"), result.getRoyaltyPercentage());
        verify(policyRepository, times(1)).save(any(RoyaltyPolicy.class));
    }

    @Test
    void testCalculateRoyalty() {
        Long bookId = 1L;
        BigDecimal revenue = new BigDecimal("1000.00");
        RoyaltyPolicy policy = new RoyaltyPolicy();
        policy.setBookId(bookId);
        policy.setFacultyId(2L);
        policy.setRoyaltyPercentage(new BigDecimal("15.0"));

        RoyaltyRecord record = new RoyaltyRecord();
        record.setCalculatedRoyalty(new BigDecimal("150.00"));

        when(policyRepository.findByBookId(bookId)).thenReturn(Optional.of(policy));
        when(recordRepository.save(any(RoyaltyRecord.class))).thenReturn(record);

        RoyaltyRecord result = royaltyService.calculateRoyalty(bookId, revenue);

        assertNotNull(result);
        assertEquals(new BigDecimal("150.00"), result.getCalculatedRoyalty());
    }
}
