package com.majgong.backend.entity;

import javax.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "MAJGONG_USER") // User is a reserved keyword in Oracle
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = true) // Null for OAuth2 users
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoginType loginType;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private int totalScore;

    @Column(nullable = false)
    private String role; // e.g. ROLE_USER

    public void addScore(int score) {
        this.totalScore += score;
        if (this.totalScore < 0) {
            this.totalScore = 0;
        }
        updateGrade();
    }

    private void updateGrade() {
        if (this.totalScore >= 1000) this.grade = "전설";
        else if (this.totalScore >= 500) this.grade = "마스터";
        else if (this.totalScore >= 300) this.grade = "고급";
        else if (this.totalScore >= 150) this.grade = "중급";
        else if (this.totalScore >= 50) this.grade = "초급";
        else this.grade = "입문";
    }

}
