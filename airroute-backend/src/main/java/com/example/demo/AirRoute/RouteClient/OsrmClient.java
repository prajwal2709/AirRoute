package com.example.demo.AirRoute.RouteClient;

import com.example.demo.AirRoute.RouteDto.OsrmResponseDto;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OsrmClient {

    private final RestClient restClient;

    public OsrmClient(RestClient.Builder builder) {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        this.restClient = builder
                .baseUrl("https://router.project-osrm.org")
                .requestFactory(requestFactory)
                .build();
    }

    public OsrmResponseDto getRoute(
            double sourceLongitude,
            double sourceLatitude,
            double destinationLongitude,
            double destinationLatitude) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/route/v1/driving/{coordinates}")
                        .queryParam("overview", "full")
                        .queryParam("geometries", "geojson")
                        .queryParam("alternatives", 3)
                        .build(
                                sourceLongitude + "," + sourceLatitude
                                        + ";"
                                        + destinationLongitude + "," + destinationLatitude
                        ))

                .header("Accept-Encoding", "identity")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(OsrmResponseDto.class);
    }
}