package com.example.demo.AirRoute.RouteClient;

import com.example.demo.AirRoute.RouteDto.OpenMeteoResponseDto;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
@Component
public class OpenMeteoClient {
    private final RestClient  restClient;

    public OpenMeteoClient(RestClient.Builder builder){
        this.restClient=builder
                .baseUrl("https://air-quality-api.open-meteo.com")
                .build();
    }
    public OpenMeteoResponseDto getAirQuality(
            double latitude,
            double longitude
    ) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                .path("/v1/air-quality")
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("hourly", "pm2_5")
                .build())
                .retrieve()
                .body(OpenMeteoResponseDto.class);
    }

}
