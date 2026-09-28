package com.example.demo.AirRoute.RouteServices;

import com.example.demo.AirRoute.RouteDto.OsrmGeomentryDto;
import com.example.demo.AirRoute.RouteDto.RoutePoint;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteSamplingService {
    private double calculateDistance(
            RoutePoint point1,
            RoutePoint point2) {

        final double EARTH_RADIUS = 6371000; // meters

        double lat1 = Math.toRadians(point1.latitude());
        double lat2 = Math.toRadians(point2.latitude());

        double deltaLat =
                Math.toRadians(point2.latitude() - point1.latitude());

        double deltaLon =
                Math.toRadians(point2.longitude() - point1.longitude());

        double a =
                Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                        +
                        Math.cos(lat1)
                                * Math.cos(lat2)
                                * Math.sin(deltaLon / 2)
                                * Math.sin(deltaLon / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS * c;
    }
    public double testDistance(
            RoutePoint point1,
            RoutePoint point2) {

        return calculateDistance(point1, point2);
    }
    public List<RoutePoint> sampleEveryKilometer(
            List<RoutePoint> routePoints) {

        List<RoutePoint> sampledPoints = new ArrayList<>();

        double accumulatedDistance = 0;

        sampledPoints.add(routePoints.get(0));

        for (int i = 1; i < routePoints.size(); i++) {

            RoutePoint previous = routePoints.get(i - 1);
            RoutePoint current = routePoints.get(i);

            double segmentDistance =
                    calculateDistance(previous, current);

            accumulatedDistance += segmentDistance;

            if (accumulatedDistance >= 1000) {

                sampledPoints.add(current);

                accumulatedDistance = 0;
            }
        }

        return sampledPoints;
    }
    public List<RoutePoint> testSampling(
            OsrmGeomentryDto geometry) {

        List<RoutePoint> routePoints =
                convertToRoutePoints(geometry);

        return sampleEveryKilometer(routePoints);
    }
    public List<RoutePoint> sampleRoute(
            OsrmGeomentryDto geometry) {

        List<RoutePoint> routePoints =
                convertToRoutePoints(geometry);

        return sampleEveryKilometer(routePoints);
    }

    public List<RoutePoint> convertToRoutePoints(
            OsrmGeomentryDto geometry) {

        List<RoutePoint> points = new ArrayList<>();

        for (List<Double> coordinate : geometry.coordinates()) {

            double longitude = coordinate.get(0);
            double latitude = coordinate.get(1);

            points.add(
                    new RoutePoint(latitude, longitude)
            );
        }

        return points;
    }
}