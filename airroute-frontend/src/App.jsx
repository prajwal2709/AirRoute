import { useEffect, useRef, useState } from "react";
import RouteMap from "./components/RouteMap";
import RouteInfo from "./components/RouteInfo";
import { findRoute } from "./services/routeApi";
import {
  calculateRemainingDistance,
  calculateDistanceFromRoute
} from "./utils/routeDistance";

function App() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const offRouteCount = useRef(0);
  const rerouting = useRef(false);

  const OFF_ROUTE_THRESHOLD = 50;
  const REQUIRED_OFF_ROUTE_UPDATES = 3;

  // --------------------------------
  // LIVE GPS LOCATION
  // --------------------------------

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );

      setLocationLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        console.log(
          "Current GPS location:",
          location
        );

        setCurrentLocation(location);
        setSource("Current location");
        setLocationLoading(false);
      },

      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationError(
          "Unable to access your location. Please allow location access."
        );

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // --------------------------------
  // ROUTE DISTANCE CALCULATIONS
  // --------------------------------

  const remainingDistance =
    calculateRemainingDistance(
      selectedRoute,
      currentLocation
    );

  const distanceFromRoute =
    calculateDistanceFromRoute(
      selectedRoute,
      currentLocation
    );

  const isOffRoute =
    distanceFromRoute !== null &&
    distanceFromRoute > OFF_ROUTE_THRESHOLD;

  // --------------------------------
  // OFF-ROUTE DETECTION
  // --------------------------------

  useEffect(() => {
    if (
      !selectedRoute ||
      distanceFromRoute === null
    ) {
      offRouteCount.current = 0;
      return;
    }

    if (!isOffRoute) {
      offRouteCount.current = 0;
      return;
    }

    offRouteCount.current += 1;

    console.log(
      "Off-route update:",
      offRouteCount.current
    );

    if (
      offRouteCount.current >=
        REQUIRED_OFF_ROUTE_UPDATES &&
      !rerouting.current
    ) {
      rerouting.current = true;

      console.log(
        "OFF ROUTE CONFIRMED — REROUTING"
      );

      handleReroute();
    }
  }, [
    selectedRoute,
    distanceFromRoute,
    isOffRoute
  ]);

  // --------------------------------
  // FIND INITIAL ROUTE
  // --------------------------------

  const handleFindRoute = async () => {
    if (!currentLocation) {
      setError(
        "Your current location is not available."
      );
      return;
    }

    if (!destination.trim()) {
      setError(
        "Please enter a destination."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await findRoute(
        currentLocation.latitude,
        currentLocation.longitude,
        destination
      );

      if (!data || data.length === 0) {
        throw new Error(
          "No route returned"
        );
      }

      setRoutes(data);
      setSelectedRoute(data[0]);

      offRouteCount.current = 0;

    } catch (err) {
      console.error(err);

      setError(
        "Unable to find route. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // AUTOMATIC REROUTING
  // --------------------------------

  const handleReroute = async () => {
    if (
      !currentLocation ||
      !destination
    ) {
      rerouting.current = false;
      return;
    }

    try {
      console.log(
        "Recalculating route..."
      );

      const data = await findRoute(
        currentLocation.latitude,
        currentLocation.longitude,
        destination
      );

      if (!data || data.length === 0) {
        throw new Error(
          "No route returned"
        );
      }

      setRoutes(data);
      setSelectedRoute(data[0]);

      offRouteCount.current = 0;

      console.log(
        "Route successfully recalculated."
      );

    } catch (err) {
      console.error(
        "Rerouting failed:",
        err
      );

      setError(
        "Unable to recalculate route."
      );

    } finally {
      rerouting.current = false;
    }
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="app">

      <header className="header">
        <h1>AirRoute</h1>
        <p>
          Pollution-Aware Navigation
        </p>
      </header>

      <main className="container">

        <section className="route-form">

          <div className="input-group">
            <label>
              Source
            </label>

            <input
              type="text"
              value={
                locationLoading
                  ? "Detecting your location..."
                  : source
              }
              readOnly
            />
          </div>

          <div className="input-group">
            <label>
              Destination
            </label>

            <input
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) =>
                setDestination(
                  e.target.value
                )
              }
            />
          </div>

          <button
            onClick={handleFindRoute}
            disabled={
              loading ||
              locationLoading
            }
          >
            {loading
              ? "Finding Route..."
              : "Find Route"}
          </button>

        </section>

        {/* LOCATION ERROR */}

        {locationError && (
          <div className="error">
            {locationError}
          </div>
        )}

        {/* ROUTE ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* REMAINING DISTANCE */}

        {remainingDistance !== null && (
          <div className="remaining-distance">

            <span>
              Distance remaining
            </span>

            <strong>
              {(
                remainingDistance / 1000
              ).toFixed(2)} km
            </strong>

          </div>
        )}

        {/* NAVIGATION STATUS */}

        {distanceFromRoute !== null && (
          <div className="navigation-status">

            {isOffRoute ? (
              <>
                <strong>
                  ⚠️ Off route
                </strong>

                <span>
                  You are{" "}
                  {Math.round(
                    distanceFromRoute
                  )}
                  m away from the
                  planned route.
                </span>
              </>
            ) : (
              <>
                <strong>
                  ✓ On route
                </strong>

                <span>
                  You are following the
                  planned route.
                </span>
              </>
            )}

          </div>
        )}

        {/* ROUTES */}

        {routes.length > 0 && (
          <>
            <RouteInfo
              routes={routes}
              selectedRoute={
                selectedRoute
              }
              onSelectRoute={(route) => {
                offRouteCount.current = 0;
                setSelectedRoute(route);
              }}
            />

            <RouteMap
              routes={routes}
              selectedRoute={
                selectedRoute
              }
              currentLocation={
                currentLocation
              }
            />
          </>
        )}

      </main>

    </div>
  );
}

export default App;