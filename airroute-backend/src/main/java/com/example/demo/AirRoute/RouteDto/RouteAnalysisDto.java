package com.example.demo.AirRoute.RouteDto;

import java.util.List;

public record RouteAnalysisDto(
        double distance,
        double duration,
        double averagePm25,
        List<PollutionPointDto> pollutionPoints
) {}