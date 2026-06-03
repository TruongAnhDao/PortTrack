package com.musketeers.porttrack.entity;

import com.musketeers.porttrack.entity.enums.TradeAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "transactions",
        indexes = {
                @Index(name = "idx_transactions_symbol", columnList = "symbol"),
                @Index(name = "idx_transactions_executed_at", columnList = "executed_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    // FIX: Tăng length lên 20
    @Column(name = "symbol", nullable = false, length = 20)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TradeAction type;

    // FIX: Chuyển Integer thành Long
    @Column(name = "quantity", nullable = false)
    private Long quantity;

    // FIX: Tăng precision lên 20 cho toàn bộ tiền tệ
    @Column(name = "price", nullable = false, precision = 20, scale = 2)
    private BigDecimal price;

    @Column(name = "fee", precision = 20, scale = 2)
    private BigDecimal fee;

    @Column(name = "tax", precision = 20, scale = 2)
    private BigDecimal tax;

    @Column(name = "total_amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal totalAmount;

    // FIX: Đổi name thành executed_at theo thiết kế SQL
    @CreationTimestamp
    @Column(name = "executed_at", updatable = false)
    private LocalDateTime executedAt;
}
