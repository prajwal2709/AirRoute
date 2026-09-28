package com.example.demo.AirRoute.RouteDto;

import java.util.List;

public record HourlyDto(
        List<String>time,
        List<Double>pm2_5
) {
}
