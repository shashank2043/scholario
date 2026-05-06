package com.scholario.violation.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "violation_reports")
@Getter
@Setter
public class ViolationReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    
    @Enumerated(EnumType.STRING)
    private ViolationType type;
    
    @Enumerated(EnumType.STRING)
    private ViolationSeverity severity;

    private String description;
    private LocalDateTime detectedAt;
    private boolean resolved;

    @PrePersist
    public void prePersist() {
        this.detectedAt = LocalDateTime.now();
    }
}
