package com.example.demo.AirRoute.RouteServices;

import com.example.demo.AirRoute.RouteClient.OpenMeteoClient;
import com.example.demo.AirRoute.RouteDto.OpenMeteoResponseDto;
import com.example.demo.AirRoute.RouteDto.PollutionPointDto;
import com.example.demo.AirRoute.RouteDto.RoutePoint;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PollutionService {
    private final OpenMeteoClient openMeteoClient;

    public PollutionService(OpenMeteoClient openMeteoClient){
        this.openMeteoClient=openMeteoClient;
    }
    public OpenMeteoResponseDto getPollution(RoutePoint point){
        return openMeteoClient.getAirQuality(
                point.latitude(),
                point.longitude()
        );
    }
    public double getCurrentPm25(RoutePoint point) {

        OpenMeteoResponseDto response =
                getPollution(point);

        String currentHour =
                java.time.LocalDateTime.now()
                        .withMinute(0)
                        .withSecond(0)
                        .withNano(0)
                        .toString();

        int index =
                response.hourly().time().indexOf(currentHour);

        if (index == -1) {
            throw new RuntimeException(
                    "Current hour not found in Open-Meteo response"
            );
        }

        return response.hourly().pm2_5().get(index);
    }
    public List<PollutionPointDto> getRoutePollution(
            List<RoutePoint> points) {

        List<PollutionPointDto> pollutionPoints =
                new ArrayList<>();

        for (RoutePoint point : points) {

            double pm25 =
                    getCurrentPm25(point);

            pollutionPoints.add(
                    new PollutionPointDto  (
                            point.latitude(),
                            point.longitude(),
                            pm25
                    )
            );
        }

        return pollutionPoints;
    }


    public double calculateAveragePm25(List<Double> pm25Values) {

        if (pm25Values.isEmpty()) {
            return 0;
        }

        double sum = 0;

        for (double value : pm25Values) {
            sum += value;
        }

        return sum / pm25Values.size();
    }
}
