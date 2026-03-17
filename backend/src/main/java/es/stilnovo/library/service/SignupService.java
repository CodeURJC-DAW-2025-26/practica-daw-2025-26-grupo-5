package es.stilnovo.library.service;

import java.io.IOException;
import java.sql.Blob;

import org.hibernate.engine.jdbc.proxy.BlobProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.User;

@Service
public class SignupService {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(MultipartFile profilePicture, String username, String email, String password, String confirmPassword)
            throws IOException {
        if (!password.equals(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }
        if (userService.usernameExists(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The username is already taken");
        }
        if (userService.emailExists(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The email is already registered");
        }

        String encodedPassword = passwordEncoder.encode(password);
        Blob imageBlob = resolveProfileImage(profilePicture);
        User newUser = new User(username, encodedPassword, email, imageBlob, 0.0, null, null, null, 0, 0.0, 0.0, null, "ROLE_USER");
        userService.save(newUser);
        return newUser;
    }

    private Blob resolveProfileImage(MultipartFile profilePicture) throws IOException {
        if (profilePicture != null && !profilePicture.isEmpty()) {
            return BlobProxy.generateProxy(profilePicture.getInputStream(), profilePicture.getSize());
        }

        Resource defaultUserImage = new ClassPathResource("static/images/no-profile-picture.png");
        return BlobProxy.generateProxy(defaultUserImage.getInputStream(), defaultUserImage.contentLength());
    }
}