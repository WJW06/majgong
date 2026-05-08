package com.majgong.backend.repository;

import com.majgong.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
    
    // 랭킹 조회를 위해 총점 기준 내림차순 조회 (상위 100명)
    java.util.List<User> findTop100ByOrderByTotalScoreDesc();

}
