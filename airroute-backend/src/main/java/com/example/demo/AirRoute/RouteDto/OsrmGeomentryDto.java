package com.example.demo.AirRoute.RouteDto;

import java.util.List;

public record OsrmGeomentryDto(
        String type,
        List<List<Double>> coordinates
) {
}
