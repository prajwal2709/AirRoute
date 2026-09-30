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

    {/* ================================
        HEADER
    ================================= */}

    <header className="header">

      <div className="brand">

        <div className="brand-icon">
          🍃
        </div>

        <div>
          <h1>
            AirRoute
          </h1>

          <p>
            Pollution-aware navigation
          </p>
        </div>

      </div>

      <div className="header-status">
        <span className="status-dot"></span>
        Live location
      </div>

    </header>


    <main className="container">


      {/* ================================
          HERO / SEARCH
      ================================= */}

      <section className="hero">

        <div className="hero-content">

          <span className="hero-eyebrow">
            SMART MOBILITY
          </span>

          <h2>
            Breathe better.
            <br />
            Travel smarter.
          </h2>

          <p>
            Find routes that balance travel time,
            distance and pollution exposure.
          </p>

        </div>


        <div className="route-form">

          <div className="input-group">

            <label>
              <span>📍</span>
              Starting point
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
              <span>📌</span>
              Destination
            </label>

            <input
              type="text"
              placeholder="Where do you want to go?"
              value={destination}
              onChange={(e) =>
                setDestination(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !loading &&
                  !locationLoading
                ) {
                  handleFindRoute();
                }
              }}
            />

          </div>


          <button
            className="find-route-button"
            onClick={handleFindRoute}
            disabled={
              loading ||
              locationLoading
            }
          >

            {loading
              ? "Analyzing..."
              : "Find Cleaner Route →"}

          </button>

        </div>

      </section>


      {/* ================================
          ERRORS
      ================================= */}

      {locationError && (
        <div className="error">
          ⚠️ {locationError}
        </div>
      )}

      {error && (
        <div className="error">
          ⚠️ {error}
        </div>
      )}


      {/* ================================
          NAVIGATION STATUS
      ================================= */}

      {distanceFromRoute !== null && (

        <div
          className={`navigation-status ${
            isOffRoute
              ? "off-route"
              : "on-route"
          }`}
        >

          <div>

            <strong>
              {isOffRoute
                ? "⚠️ Off route"
                : "✓ On route"}
            </strong>

            <span>
              {isOffRoute
                ? `You are ${Math.round(
                    distanceFromRoute
                  )}m away from the planned route.`
                : "You are following the planned route."}
            </span>

          </div>

          {remainingDistance !== null && (

            <div className="remaining-pill">

              <span>
                Remaining
              </span>

              <strong>
                {(
                  remainingDistance / 1000
                ).toFixed(2)} km
              </strong>

            </div>

          )}

        </div>

      )}


      {/* ================================
          MAP
      ================================= */}
    {/* =====================================================
    MAP + ROUTE OPTIONS
===================================================== */}

{routes.length > 0 && (
  <section className="navigation-layout">

    {/* =========================
        LEFT — MAP
    ========================= */}

    <div className="map-panel">

      <div className="section-heading map-heading">

        <div>
          <span className="section-eyebrow">
            LIVE ROUTE
          </span>

          <h2>
            Pollution-aware map
          </h2>
        </div>

        <span className="live-badge">
          ● LIVE
        </span>

      </div>

      <RouteMap
        routes={routes}
        selectedRoute={selectedRoute}
        currentLocation={currentLocation}
      />

    </div>


    {/* =========================
        RIGHT — ROUTE OPTIONS
    ========================= */}

    <div className="routes-panel">

      <div className="section-heading">

        <div>
          <span className="section-eyebrow">
            ROUTE OPTIONS
          </span>

          <h2>
            Compare your routes
          </h2>

          <p className="section-description">
            Choose a route based on travel time,
            distance and pollution exposure.
          </p>
        </div>

        <span className="selected-label">
          {routes.length}{" "}
          {routes.length === 1 ? "route" : "routes"}
        </span>

      </div>


      <RouteInfo
        routes={routes}
        selectedRoute={selectedRoute}
        onSelectRoute={(route) => {

          offRouteCount.current = 0;

          setSelectedRoute(route);

        }}
      />

    </div>

  </section>
)}


{/* =====================================================
    SELECTED ROUTE SUMMARY
===================================================== */}

{selectedRoute && (
  <section className="summary-section">

    <div className="section-heading">

      <div>
        <span className="section-eyebrow">
          ROUTE INSIGHTS
        </span>

        <h2>
          Your selected route
        </h2>
      </div>

      <span className="selected-label">
        ✓ Selected
      </span>

    </div>


    <div className="summary-grid">

      <div className="summary-card">

        <span>
          DISTANCE
        </span>

        <strong>
          {(selectedRoute.distance / 1000).toFixed(2)}
          <small> km</small>
        </strong>

        <p>
          Total route distance
        </p>

      </div>


      <div className="summary-card">

        <span>
          TRAVEL TIME
        </span>

        <strong>
          {(selectedRoute.duration / 60).toFixed(1)}
          <small> min</small>
        </strong>

        <p>
          Estimated driving time
        </p>

      </div>


      <div className="summary-card">

        <span>
          AVERAGE PM2.5
        </span>

        <strong>
          {Number(selectedRoute.averagepm25).toFixed(1)}
          <small> μg/m³</small>
        </strong>

        <p>
          Along the selected route
        </p>

      </div>


      <div className="summary-card accent-card">

        <span>
          AIRROUTE SCORE
        </span>

        <strong>
          {Number(selectedRoute.finalScore).toFixed(1)}
        </strong>

        <p>
          Route optimization score
        </p>

      </div>

    </div>

  </section>
)}

      


      {/* ================================
          ROUTES
      ================================= */}

      {routes.length > 0 && (

        <RouteInfo
          routes={routes}
          selectedRoute={selectedRoute}
          onSelectRoute={(route) => {

            offRouteCount.current = 0;

            setSelectedRoute(route);

          }}
        />

      )}

    </main>

  </div>
);
}
export default App;
