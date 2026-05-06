package com.scholario.royalty.resolver;

import com.scholario.royalty.model.RoyaltyRecord;
import com.scholario.royalty.service.RoyaltyService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.List;

@Controller
public class RoyaltyQueryResolver {
    private final RoyaltyService royaltyService;

    public RoyaltyQueryResolver(RoyaltyService royaltyService) {
        this.royaltyService = royaltyService;
    }

    @QueryMapping
    public List<RoyaltyRecord> getRoyaltyDetails(@Argument Long bookId) {
        return royaltyService.getRoyaltyDetails(bookId);
    }

    @QueryMapping
    public BigDecimal getRevenueByBook(@Argument Long bookId) {
        return royaltyService.getRevenueByBook(bookId);
    }
}
