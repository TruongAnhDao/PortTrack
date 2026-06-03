package com.musketeers.porttrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "daily_nav_history",
        uniqueConstraints = @UniqueConstraint(name = "uq_portfolio_date", columnNames = {"portfolio_id", "date"}),
        indexes = @Index(name = "idx_history_date", columnList = "date")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyNavHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "nav_value", nullable = false, precision = 20, scale = 2)
    private BigDecimal navValue;
}
