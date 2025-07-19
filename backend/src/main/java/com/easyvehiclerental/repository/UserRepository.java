package com.easyvehiclerental.repository;

import com.easyvehiclerental.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.role = 'USER'")
    List<User> findAllUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'USER'")
    long countUsers();
}