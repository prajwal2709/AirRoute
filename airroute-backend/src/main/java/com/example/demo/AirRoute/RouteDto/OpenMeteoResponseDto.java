package com.example.demo.AirRoute.RouteDto;

public record OpenMeteoResponseDto(
        double latitude,
        double longitude,
        HourlyDto hourly
) {
}
