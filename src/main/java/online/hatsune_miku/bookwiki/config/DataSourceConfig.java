package online.hatsune_miku.bookwiki.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private final PathProvider pathProvider;

    public DataSourceConfig(PathProvider pathProvider) {
        this.pathProvider = pathProvider;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .url(pathProvider.getH2JdbcUrl())
                .username("sa")
                .password("")
                .driverClassName("org.h2.Driver")
                .build();
    }
}
