package com.taskmanager.auth.entity;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    // Get latest unverified, unused OTP for email + purpose
    Optional<OtpVerification> findTopByEmailAndPurposeAndVerifiedFalseAndUsedFalseOrderByIdDesc(
            String email, OtpPurpose purpose);

    // Delete all OTPs for this email+purpose (cleanup before new OTP)
    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.email = :email AND o.purpose = :purpose")
    void deleteAllByEmailAndPurpose(String email, OtpPurpose purpose);
}