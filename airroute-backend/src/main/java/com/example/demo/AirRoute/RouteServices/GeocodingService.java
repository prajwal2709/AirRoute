package com.example.demo.AirRoute.RouteServices;

import com.example.demo.AirRoute.RouteClient.NominatimClient;

import com.example.demo.AirRoute.RouteDto.LocationService;
import com.example.demo.AirRoute.RouteDto.NominatimRsponseDto;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@AllArgsConstructor
@Service
public class GeocodingService {

    private final NominatimClient nominatimClient;

    public LocationService geocode(String location) {

        NominatimRsponseDto[] results =
                nominatimClient.search(location);

        if (results.length == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Location not found: " + location
            );
        }

        NominatimRsponseDto result = results[0];

        return new LocationService(
                result.displayName(),
                Double.parseDouble(result.lat()),
                Double.parseDouble(result.lon())
        );
    }
}