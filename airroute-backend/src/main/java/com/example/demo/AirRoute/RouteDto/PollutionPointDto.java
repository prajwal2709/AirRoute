package com.example.demo.AirRoute.RouteDto;

public record PollutionPointDto(
        double latitude,
        double longitude,
        double pm25
) {}