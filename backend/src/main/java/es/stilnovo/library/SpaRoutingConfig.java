package es.stilnovo.library;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.PathResourceResolver;
import java.io.IOException;

@Configuration
public class SpaRoutingConfig implements WebMvcConfigurer {

        private static final String SPA_ROUTE = "/new";

        @Override
        public void addViewControllers(ViewControllerRegistry registry) {
                // Redirect /new and /new/ to index.html directly
                registry.addViewController(SPA_ROUTE).setViewName("forward:" + SPA_ROUTE + "/index.html");
                registry.addViewController(SPA_ROUTE + "/").setViewName("forward:" + SPA_ROUTE + "/index.html");
        }

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler(SPA_ROUTE + "/**")
                                .addResourceLocations("classpath:/static" + SPA_ROUTE + "/")
                                .resourceChain(true)
                                .addResolver(new PathResourceResolver() {
                                        @Override
                                        protected Resource getResource(String resourcePath, Resource location)
                                                        throws IOException {
                                                Resource requestedResource = location.createRelative(resourcePath);

                                                // If it's a real file (css, js, img), return it
                                                if (requestedResource.exists() && requestedResource.isReadable()) {
                                                        return requestedResource;
                                                }

                                                // If it's a React route (e.g. /new/dashboard), return index.html
                                                return new ClassPathResource("/static" + SPA_ROUTE + "/index.html");
                                        }
                                });
        }
}
