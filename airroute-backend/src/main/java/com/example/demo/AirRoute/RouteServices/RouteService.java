package com.example.demo.AirRoute.RouteServices;

import com.example.demo.AirRoute.RouteClient.OsrmClient;
import com.example.demo.AirRoute.RouteDto.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    private final GeocodingService geocodingService;
    private final OsrmClient osrmClient;
    private final PollutionService pollutionService;
    private final RouteSamplingService routeSamplingService;

    public RouteService(
            GeocodingService geocodingService,
            OsrmClient osrmClient,
            RouteSamplingService routeSamplingService,
            PollutionService pollutionService) {

        this.geocodingService = geocodingService;
        this.osrmClient = osrmClient;
        this.routeSamplingService = routeSamplingService;
        this.pollutionService = pollutionService;
    }

    public OsrmResponseDto findRoute(
            double latitude,
            double longitude,
            String destination) {

        LocationService destinationLocation =
                geocodingService.geocode(destination);

        return osrmClient.getRoute(
                longitude,
                latitude,
                destinationLocation.longitude(),
                destinationLocation.latitude()
        );
    }
    public List<RouteOptionDto> calculateRoutePollution(
            double latitude,
            double longitude,
            String destination) {

        OsrmResponseDto response =
                findRoute(
                        latitude,
                        longitude,
                        destination
                );

        List<RouteOptionDto> routes =
                new ArrayList<>();

        for (OsrmRoutesDto route : response.routes()) {

            RouteOptionDto routeOption =
                    analyzeRoute(route);

            routes.add(routeOption);
        }

        double maxDuration =
                routes.stream()
                        .mapToDouble(RouteOptionDto::duration)
                        .max()
                        .orElse(1);

        double maxExposure =
                routes.stream()
                        .mapToDouble(
                                RouteOptionDto::pollutionExposure
                        )
                        .max()
                        .orElse(1);

        List<RouteOptionDto> scoredRoutes =
                new ArrayList<>();

        for (RouteOptionDto route : routes) {

            RouteOptionDto scoredRoute =
                    calculateScore(
                            route,
                            maxDuration,
                            maxExposure
                    );

            scoredRoutes.add(scoredRoute);
        }

        return scoredRoutes;
    }

    private RouteOptionDto analyzeRoute(OsrmRoutesDto route) {

        List<RoutePoint> points =
                routeSamplingService.sampleRoute(
                        route.geometry()
                );

        List<PollutionPointDto> pollutionPoints =
                pollutionService.getRoutePollution(points);

        List<Double> pm25Values =
                pollutionPoints.stream()
                        .map(PollutionPointDto::pm25)
                        .toList();

        double averagePm25 =
                pollutionService.calculateAveragePm25(
                        pm25Values
                );

        double travelTimeMinutes =
                route.duration() / 60.0;

        double pollutionExposure =
                averagePm25 * travelTimeMinutes;

        return new RouteOptionDto(
                route.distance(),
                route.duration(),
                averagePm25,
                pollutionExposure,
                0,
                0,
                0,
                pollutionPoints,
                route.geometry()
        );
    }
    private RouteOptionDto calculateScore(
            RouteOptionDto route,
            double maxDuration,
            double maxExposure) {

        double timeScore =
                route.duration() / maxDuration;

        double pollutionScore =
                route.pollutionExposure() / maxExposure;

        double finalScore =
                (0.4 * timeScore)
                        + (0.6 * pollutionScore);

        return new RouteOptionDto(
                route.distance(),
                route.duration(),
                route.averagepm25(),
                route.pollutionExposure(),
                timeScore,
                pollutionScore,
                finalScore,
                route.PollutionPoints(),
                route.geometry()
        );
    }
}