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

@RestController
@RequestMapping("/api/v1/catalog")
public class MainRestController {

        @Autowired
        private MainService mainService;

        @Autowired
        private ProductMapper productMapper;

        @Autowired
        private UserMapper userMapper;

        @GetMapping
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
