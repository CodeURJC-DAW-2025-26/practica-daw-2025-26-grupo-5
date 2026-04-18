package es.stilnovo.library.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * AdminController: Legacy template-based controller
 * 
 * NOTE: This controller is kept for backwards compatibility
 * All admin operations are now handled by REST controllers:
 * - AdminRestController: Admin dashboard, user management, inventory
 * - UserWebRestController: User operations
 * - ProductRestController: Product management
 * 
 * The REST API is the primary interface for admin operations
 */
@Controller
@RequestMapping("/admin")
public class AdminController {

    
    // Legacy template endpoints removed - use REST API instead
    // All admin operations are now handled by:
    // - AdminRestController: /api/v1/admin/*
    // - UserWebRestController: /api/v1/users/*
    // - ProductRestController: /api/v1/products/*
}

