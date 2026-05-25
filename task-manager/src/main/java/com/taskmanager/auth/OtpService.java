package com.taskmanager.auth;


import com.taskmanager.auth.entity.OtpPurpose;
import com.taskmanager.auth.entity.OtpRepository;
import com.taskmanager.auth.entity.OtpVerification;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 10;

    @Transactional
    public void generateAndSendOtp(String email, OtpPurpose purpose) {
        try {
            // Delete old OTPs for this email+purpose
            otpRepository.deleteAllByEmailAndPurpose(email, purpose);

            String otp = generateFourDigitOtp();

            OtpVerification otpRecord = OtpVerification.builder()
                    .email(email)
                    .otp(otp)
                    .purpose(purpose)
                    .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                    .build();

            otpRepository.save(otpRecord);
            log.info("OTP generated and saved for email: {} with purpose: {}", email, purpose);

            // Send email based on purpose - failures won't crash the flow
            try {
                if (purpose == OtpPurpose.REGISTRATION) {
                    emailService.sendRegistrationOtp(email, otp);
                } else if (purpose == OtpPurpose.PASSWORD_RESET) {
                    emailService.sendPasswordResetOtp(email, otp);
                }
                log.info("OTP email sent successfully to: {} for purpose: {}", email, purpose);
            } catch (Exception emailEx) {
                log.error("Failed to send OTP email to {}: {}. OTP is still valid and stored in database.", 
                        email, emailEx.getMessage());
                // Don't throw - email sending failure shouldn't block OTP generation
                // User can still retry or use backup methods
            }
        } catch (Exception ex) {
            log.error("Error in OTP generation for {}: {}", email, ex.getMessage(), ex);
            throw new BadRequestException("Failed to generate OTP. Please try again.");
        }
    }

    @Transactional
    public void verifyOtp(String email, String otp, OtpPurpose purpose) {
        OtpVerification record = otpRepository
                .findTopByEmailAndPurposeAndVerifiedFalseAndUsedFalseOrderByIdDesc(email, purpose)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one."));

        if (LocalDateTime.now().isAfter(record.getExpiresAt())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!record.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP. Please check and try again.");
        }

        record.setVerified(true);
        record.setUsed(true);
        otpRepository.save(record);
    }

    private String generateFourDigitOtp() {
        SecureRandom random = new SecureRandom();
        int num = 1000 + random.nextInt(9000); // always 4 digits: 1000–9999
        return String.valueOf(num);
    }
}
