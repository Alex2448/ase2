package edu.tum.ase.apigateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringCloudConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // CAS API
                .route(r -> r.path("/cas-api/**")
                        .uri("lb://CASCLIENT"))
                // Delivery API
                .route(r -> r.path("/delivery-api/**")
                        .uri("lb://DELIVERYCLIENT"))
                .build();
    }
}