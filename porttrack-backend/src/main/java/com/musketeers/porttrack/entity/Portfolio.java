package com.musketeers.porttrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "portfolios",
        uniqueConstraints = @UniqueConstraint(name = "uq_user_room", columnNames = {"user_id", "room_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // FIX: Đồng bộ DECIMAL(20,2) với DB
    @Column(name = "cash_balance", nullable = false, precision = 20, scale = 2)
    private BigDecimal cashBalance;

    @Version
    @Column(name = "version")
    private Integer version;

    @Column(name = "submission_url", length = 2048)
    private String submissionUrl;

    @Column(name = "submission_updated_at")
    private LocalDateTime submissionUpdatedAt;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;
}
