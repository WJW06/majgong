package com.majgong.backend.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false)
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProblemFormat format = ProblemFormat.MULTIPLE_CHOICE;

    @Column(length = 2000)
    private String imageUrl;

    @Column(nullable = false)
    private String answer; // 0-indexed correct option index

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_range_id", nullable = false)
    private ProblemRange problemRange;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProblemOption> options = new ArrayList<>();
}
