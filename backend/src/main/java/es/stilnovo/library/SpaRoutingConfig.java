package es.stilnovo.library;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.PathResourceResolver;
import java.io.IOException;

@Configuration
public class SpaRoutingConfig implements WebMvcConfigurer {

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Maps the URL /new/** to the physical folder static/new/
                registry.addResourceHandler("/new/**", "/new", "/new/")
                                .addResourceLocations("classpath:/static/new/")
                                .resourceChain(true)
                                .addResolver(new PathResourceResolver() {
                                        @Override
                                        protected Resource getResource(String resourcePath, Resource location)
                                                        throws IOException {
                                                Resource requestedResource = location.createRelative(resourcePath);

                                                // 1. If it's a real file (JS, CSS, PNG), return it
                                                if (requestedResource.exists() && requestedResource.isReadable()) {
                                                        return requestedResource;
                                                }

                                                // 2. If the resource is not found but is an asset request (contains a
                                                // dot),
                                                // return null to trigger a 404 instead of a 500.
                                                if (resourcePath.contains(".")) {
                                                        return null;
                                                }

                                                // 3. Fallback: Return index.html for any React navigation route
                                                return new ClassPathResource("/static/new/index.html");
                                        }
                                });
        }
}