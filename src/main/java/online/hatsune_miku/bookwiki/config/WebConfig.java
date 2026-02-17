package online.hatsune_miku.bookwiki.config;

import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final PathProvider pathProvider;

    public WebConfig(PathProvider pathProvider) {
        this.pathProvider = pathProvider;
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /uploads/** to the uploads directory
        String uploadLocation = "file:" + pathProvider.getUploadPath().toString().replace("\\", "/") + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);

        // SPA Routing: Forward all non-API, non-static paths to index.html
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(@NonNull String resourcePath, @NonNull Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // Do not intercept API or uploads
                        if (resourcePath.startsWith("api") || resourcePath.startsWith("uploads")) {
                            return null;
                        }

                        return location.createRelative("index.html");
                    }
                });
    }
}
