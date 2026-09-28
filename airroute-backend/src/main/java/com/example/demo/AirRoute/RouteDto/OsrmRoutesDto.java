package com.example.demo.AirRoute.RouteDto;

public record OsrmRoutesDto(
        double distance,
        double duration,
        OsrmGeomentryDto geometry
) {
}
