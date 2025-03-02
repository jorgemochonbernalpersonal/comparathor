package com.comparathor.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    private static final Dotenv dotenv = Dotenv.load();

    @Bean
    public OpenAPI customOpenAPI() {
        String localServer = "http://" + dotenv.get("DB_HOST", "localhost") + ":8081";
        String prodServer = dotenv.get("API_PROD_URL", "https://api.comparathor.com");

        return new OpenAPI()
                .info(new Info()
                        .title("Comparathor API")
                        .version("1.0")
                        .description("API para gestión de productos y comparaciones")
                        .contact(new Contact()
                                .name("Soporte Comparathor")
                                .email("soporte@comparathor.com")
                                .url("https://comparathor.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url(localServer).description("Servidor Local"),
                        new Server().url(prodServer).description("Servidor de Producción")
                ));
    }
}
