package com.example.demo.AirRoute.RouteClient;

import com.example.demo.AirRoute.RouteDto.NominatimRsponseDto;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NominatimClient {

    private final RestClient restClient;

    public NominatimClient(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("https://nominatim.openstreetmap.org")
                .build();
    }

    public NominatimRsponseDto[] search(String location) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", location)
                        .queryParam("format", "json")
                        .queryParam("limit", 1)
                        .build())
                .header(
                        "User-Agent",
                        "AirRoute/1.0 (student project)"
                )
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(NominatimRsponseDto[].class);
    }
}