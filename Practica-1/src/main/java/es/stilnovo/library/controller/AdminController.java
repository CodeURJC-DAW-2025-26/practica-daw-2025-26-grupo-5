package es.stilnovo.library.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.UserRepository;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public String listUsers(Model model) {

        List<User> users = userRepository.findAll();
        model.addAttribute("users", users);

        return "admin-user-managment-page";
    }

    @PostMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable Long id) {

    userRepository.deleteById(id);

    return "redirect:/admin/users";
}

}
