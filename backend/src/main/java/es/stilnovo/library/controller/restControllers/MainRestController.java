package es.stilnovo.library.controller.restControllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

import es.stilnovo.library.dto.HomePageDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.service.MainService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST Controller for catalog and homepage operations
 * Provides endpoints for browsing products with search and filtering
 */
@RestController
@RequestMapping("/api/v1/catalog")
@Tag(name = "Catalog", description = "REST API for catalog and homepage operations (browsing, searching, and filtering products)")
public class MainRestController {

        @Autowired
        private MainService mainService;

        @Autowired
        private ProductMapper productMapper;

        @Autowired
        private UserMapper userMapper;

        /**
         * Retrieves home page data with filtered products and recommendations
         * @param query Optional search query
         * @param category Optional category filter
         * @param pageable Pagination parameters
         * @param principal Authenticated user (optional)
         * @return HomePageDTO with products, recommendations, and metadata
         */
        @GetMapping
        @Operation(summary = "Get home page data", description = "Retrieves home page data including filtered products, recommendations, and pagination metadata")
        @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Catalog data retrieved successfully")
        })
        public HomePageDTO getHomePage(
                        @RequestParam(required = false) String query,
                        @RequestParam(required = false) String category,
                        @PageableDefault(size = 10) Pageable pageable,
                        Principal principal) {
                var homePageData = mainService.getHomePageData(
                                query,
                                category,
                                principal != null ? principal.getName() : null,
                                pageable);

                return new HomePageDTO(
                                productMapper.toDTOs(homePageData.products()),
                                productMapper.toDTOs(homePageData.recommendedProducts()),
                                homePageData.user() != null ? userMapper.toDTO(homePageData.user()) : null,
                                homePageData.logged(),
                                homePageData.admin(),
                                homePageData.query(),
                                homePageData.searching(),
                                homePageData.last(),
                                homePageData.nextOffset());
        }
}