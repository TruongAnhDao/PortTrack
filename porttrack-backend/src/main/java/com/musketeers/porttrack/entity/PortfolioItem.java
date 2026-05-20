package com.musketeers.porttrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "portfolio_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "avg_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal avgPrice;

    @Version
    @Column(name = "version")
    private Long version;
}