package es.stilnovo.library;

import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.nio.file.Files;

@Controller
class SpaFallbackController {
    @GetMapping(value = {"/new", "/new/**"}, produces = "text/html;charset=utf-8")
    public ResponseEntity<String> serveSpa() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/new/index.html");
        String content = new String(Files.readAllBytes(resource.getFile().toPath()));
        return ResponseEntity.ok(content);
    }
}

@Configuration
public class SpaRoutingConfig implements WebMvcConfigurer {

        private static final String SPA_ROUTE = "/new";

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

                                                // If it's a real file, return it
                                                if (requestedResource.exists() && requestedResource.isReadable()) {
                                                        return requestedResource;
                                                }

                                                // If requesting an asset file, return null (404)
                                                if (resourcePath.matches(".*\\.(js|css|png|svg|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$")) {
                                                        return null;
                                                }

                                                // Fallback to index.html for SPA routes
                                                return new ClassPathResource("/static" + SPA_ROUTE + "/index.html");
                                        }
                                });
        }
}
