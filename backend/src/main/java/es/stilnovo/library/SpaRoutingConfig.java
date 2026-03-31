package es.stilnovo.library;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SpaRoutingConfig implements WebMvcConfigurer {
    private static final String SPA_ROUTE = "/new";

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward all routes under /new to index.html, except for static resources
        registry.addViewController(SPA_ROUTE + "/{spring:\\w+}")
                .setViewName("forward:" + SPA_ROUTE + "/index.html");
        registry.addViewController(SPA_ROUTE + "/**/{spring:\\w+}")
                .setViewName("forward:" + SPA_ROUTE + "/index.html");
        registry.addViewController(SPA_ROUTE)
                .setViewName("forward:" + SPA_ROUTE + "/index.html");
        registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    }
}