package com.example.demo.AirRoute.RouteDto;

import java.util.List;

public record RouteOptionDto(
        double distance,
        double duration,
        double averagepm25,
        double pollutionExposure,
        double timeScore,
        double pollutionScore,
        double finalScore,
        List<PollutionPointDto> PollutionPoints,
        OsrmGeomentryDto geometry
) {
}
