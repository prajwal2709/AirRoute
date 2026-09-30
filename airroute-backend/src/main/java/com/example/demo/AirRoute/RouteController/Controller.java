package com.example.demo.AirRoute.RouteController;

import com.example.demo.AirRoute.RouteClient.OpenMeteoClient;
import com.example.demo.AirRoute.RouteDto.*;
import com.example.demo.AirRoute.RouteServices.GeocodingService;
import com.example.demo.AirRoute.RouteServices.RouteSamplingService;
import com.example.demo.AirRoute.RouteServices.RouteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5174")
public class Controller {

    private final OpenMeteoClient openMeteoClient;
    private final GeocodingService geocodingService;
    private final RouteService routeService;
    private final RouteSamplingService routeSamplingService;
    public Controller(
            GeocodingService geocodingService,
            RouteService routeService,
            OpenMeteoClient openMeteoClient,
            RouteSamplingService routeSamplingService) {

        this.geocodingService = geocodingService;
        this.routeService = routeService;
        this.openMeteoClient = openMeteoClient;
        this.routeSamplingService=routeSamplingService;
    }
    @GetMapping("/geocode")
    public LocationService geocode(
            @RequestParam String location) {

        return geocodingService.geocode(location);
    }


    @GetMapping("/test-pollution")
    public OpenMeteoResponseDto testPollution(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        return openMeteoClient.getAirQuality(latitude, longitude);
    }

    @GetMapping("/route-pollution")
    public List<RouteOptionDto> routePollution(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam String destination) {

        return routeService.calculateRoutePollution(
                latitude,
                longitude,
                destination
        );
    }
    }
