import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  CircleMarker,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";


/* ================================
   MAP AUTO FIT
================================ */

function MapUpdater({ selectedRoute }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedRoute?.geometry?.coordinates) {
      return;
    }

    const coordinates =
      selectedRoute.geometry.coordinates.map(
        ([longitude, latitude]) => [
          latitude,
          longitude
        ]
      );

    if (coordinates.length > 0) {
      map.fitBounds(coordinates, {
        padding: [40, 40]
      });
    }

  }, [selectedRoute, map]);

  return null;
}


/* ================================
   POLLUTION COLOR
================================ */

function getPollutionColor(pm25) {

  if (pm25 < 10) {
    return "#16845f";
  }

  if (pm25 < 25) {
    return "#e09b28";
  }

  if (pm25 < 35) {
    return "#c65d16";
  }

  return "#d94b4b";
}


/* ================================
   CURRENT LOCATION ICON
================================ */

const currentLocationIcon = L.divIcon({

  className: "current-location-marker",

  html: `
    <div class="current-location-dot"></div>
  `,

  iconSize: [20, 20],

  iconAnchor: [10, 10]

});


/* ================================
   DESTINATION ICON
================================ */

const destinationIcon = L.divIcon({

  className: "destination-marker",

  html: `
    <div class="destination-pin">
      <div class="destination-pin-center"></div>
    </div>
  `,

  iconSize: [30, 40],

  iconAnchor: [15, 40]

});


/* ================================
   ROUTE MAP
================================ */

function RouteMap({
  routes,
  selectedRoute,
  currentLocation
}) {

  if (
    !routes ||
    routes.length === 0 ||
    !selectedRoute?.geometry?.coordinates
  ) {
    return null;
  }


  /* ================================
     SELECTED ROUTE COORDINATES
  ================================= */

  const selectedCoordinates =
    selectedRoute.geometry.coordinates.map(
      ([longitude, latitude]) => [
        latitude,
        longitude
      ]
    );


  /*
   * Destination is the final point
   * of the selected route.
   */

  const end =
    selectedCoordinates[
      selectedCoordinates.length - 1
    ];


  /* ================================
     GOOGLE MAPS DIRECTIONS
  ================================= */


  
  const openGoogleMaps = () => {

  if (
    !selectedRoute?.geometry?.coordinates ||
    selectedRoute.geometry.coordinates.length < 2
  ) {
    return;
  }

  // Get the actual AirRoute route coordinates
  const routeCoordinates =
    selectedRoute.geometry.coordinates;

  // First coordinate = actual route origin
  const [originLongitude, originLatitude] =
    routeCoordinates[0];

  // Last coordinate = actual route destination
  const [
    destinationLongitude,
    destinationLatitude
  ] =
    routeCoordinates[
      routeCoordinates.length - 1
    ];
    console.log("========== AIRROUTE DEBUG ==========");

console.log(
  "Route START:",
  routeCoordinates[0]
);

console.log(
  "Route END:",
  routeCoordinates[routeCoordinates.length - 1]
);

console.log(
  "Current Location:",
  currentLocation
);

console.log(
  "Selected Route:",
  selectedRoute
);

console.log("====================================");

  const googleMapsUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${originLatitude},${originLongitude}` +
    `&destination=${destinationLatitude},${destinationLongitude}` +
    `&travelmode=driving`;

  window.open(
    googleMapsUrl,
    "_blank",
    "noopener,noreferrer"
  );
};

  return (
    <div className="map-container">


      {/* ================================
          GOOGLE MAPS NAVIGATION BUTTON
      ================================= */}

      <button
        className="directions-button"
        onClick={openGoogleMaps}
        type="button"
      >
        Navigate with Google Maps
      </button>


      {/* ================================
          MAP LEGEND
      ================================= */}

      <div className="map-legend">

        <div className="legend-title">
          AIR QUALITY ALONG ROUTE
        </div>


        <div className="legend-item">

          <span className="legend-dot clean"></span>

          <span>
            Lower pollution
          </span>

        </div>


        <div className="legend-item">

          <span className="legend-dot moderate"></span>

          <span>
            Moderate pollution
          </span>

        </div>


        <div className="legend-item">

          <span className="legend-dot high"></span>

          <span>
            High pollution
          </span>

        </div>


        <div className="legend-item">

          <span className="legend-dot very-high"></span>

          <span>
            Very high pollution
          </span>

        </div>


        <div className="legend-divider"></div>


        <div className="legend-item">

          <span className="legend-line selected"></span>

          <span>
            Selected route
          </span>

        </div>


        <div className="legend-item">

          <span className="legend-line alternative"></span>

          <span>
            Alternative route
          </span>

        </div>


        <div className="legend-item">

          <span className="legend-user"></span>

          <span>
            Your location
          </span>

        </div>


        <div className="legend-item">

          <span className="legend-destination"></span>

          <span>
            Destination
          </span>

        </div>

      </div>


      {/* ================================
          MAP
      ================================= */}

      <MapContainer
        center={
          currentLocation
            ? [
                currentLocation.latitude,
                currentLocation.longitude
              ]
            : selectedCoordinates[0]
        }
        zoom={13}
        className="airroute-map"
      >


        {/* ================================
            MAP TILES
        ================================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* ================================
            ROUTES
        ================================= */}

        {routes.map((route, index) => {

          if (!route?.geometry?.coordinates) {
            return null;
          }


          const coordinates =
            route.geometry.coordinates.map(
              ([longitude, latitude]) => [
                latitude,
                longitude
              ]
            );


          const isSelected =
            route === selectedRoute;


          return (
            <Polyline
              key={index}

              positions={coordinates}

              pathOptions={{

                color:
                  isSelected
                    ? "#167c68"
                    : "#7c8a86",

                weight:
                  isSelected
                    ? 7
                    : 4,

                opacity:
                  isSelected
                    ? 1
                    : 0.45,

                lineCap: "round",

                lineJoin: "round"

              }}
            />
          );

        })}


        {/* ================================
            CURRENT USER LOCATION
        ================================= */}

        {currentLocation && (

          <Marker
            position={[
              currentLocation.latitude,
              currentLocation.longitude
            ]}

            icon={currentLocationIcon}
          >

            <Popup>

              <strong>
                Your location
              </strong>

              <br />

              Starting point

            </Popup>

          </Marker>

        )}


        {/* ================================
            DESTINATION
        ================================= */}

        <Marker
          position={end}
          icon={destinationIcon}
        >

          <Popup>

            <strong>
              Destination
            </strong>

          </Popup>

        </Marker>


        {/* ================================
            POLLUTION POINTS
        ================================= */}

        {(
          selectedRoute.PollutionPoints ??
          selectedRoute.pollutionPoints ??
          []
        ).map((point, index) => {

          const pm25 =
            Number(point.pm25);


          const pollutionColor =
            getPollutionColor(pm25);


          return (
            <CircleMarker

              key={index}

              center={[
                Number(point.latitude),
                Number(point.longitude)
              ]}

              radius={7}

              pathOptions={{

                color: "#ffffff",

                weight: 2,

                fillColor:
                  pollutionColor,

                fillOpacity: 0.85

              }}

            >

              <Popup>

                <strong>
                  Pollution Point
                </strong>

                <br />

                PM2.5:{" "}

                {pm25.toFixed(2)}

                {" μg/m³"}

              </Popup>

            </CircleMarker>
          );

        })}


        {/* ================================
            MAP AUTO FIT
        ================================= */}

        <MapUpdater
          selectedRoute={selectedRoute}
        />

      </MapContainer>

    </div>
  );
}

export default RouteMap;