package com.example.demo.AirRoute.RouteDto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NominatimRsponseDto(@JsonProperty("display_name")
                                          String displayName,
                                          String lat,
                                          String lon) {
}
