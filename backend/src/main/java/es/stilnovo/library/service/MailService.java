package es.stilnovo.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * MailService for sending email notifications
 * Handles email delivery using Spring Mail (JavaMailSender)
 */
@Service
public class MailService {
    private static final Logger logger = LoggerFactory.getLogger(MailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    /**
     * Sends a simple HTML email without inline attachments.
     */
    public void sendHtml(String to, String subject, String htmlBody) {
        try {
            // STEP 1: Create MIME message
            MimeMessage message = mailSender.createMimeMessage();
            // STEP 2: Configure email headers and encoding
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            // STEP 3: Set HTML body with true flag for HTML support
            helper.setText(htmlBody, true);
            // STEP 4: Send email via SMTP
            mailSender.send(message);
        } catch (MessagingException ex) {
            throw new IllegalStateException("Failed to build email", ex);
        }
    }

    /**
     * Sends a professional HTML email with an embedded inline image (like a logo).
     * This ensures the image is visible even if the user is offline or external
     * links are blocked.
     */
    public void sendHtmlWithInline(String to, String subject, String htmlBody,
            String contentId, Resource inlineResource) throws MessagingException {
        logger.info("📧 [EMAIL SENDING] From: {}, To: {}, Subject: {}", fromAddress, to, subject);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        helper.addInline(contentId, inlineResource);
        
        logger.info("✅ [EMAIL] Sending email via mailSender.send()...");
        mailSender.send(message);
        logger.info("✅ [EMAIL SENT] Successfully sent to: {}", to);
    }
}