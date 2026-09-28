package com.example.demo.AirRoute.RouteDto;

import java.util.List;

public record OsrmResponseDto(
        String code,
        List<OsrmRoutesDto> routes
) {
}
