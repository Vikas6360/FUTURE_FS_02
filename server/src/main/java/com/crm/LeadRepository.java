package com.crm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    @Query("SELECT l FROM Lead l WHERE " +
           "(:status IS NULL OR :status = '' OR l.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY l.createdAt DESC")
    List<Lead> searchLeads(@Param("search") String search, @Param("status") String status);

    long countByStatus(String status);
}
