import { getAirQuality } from "../utils/airQuality";

function openGoogleMaps(route) {
  if (!route?.geometry?.coordinates?.length) {
    alert("Route information is not available.");
    return;
  }

  const coordinates = route.geometry.coordinates;

  // Use a limited number of waypoints so the Google Maps URL
  // doesn't become excessively long.
  const maxWaypoints = 8;

  const step = Math.max(
    1,
    Math.floor(coordinates.length / (maxWaypoints + 1))
  );

  const waypoints = [];

  for (
    let i = step;
    i < coordinates.length - 1 && waypoints.length < maxWaypoints;
    i += step
  ) {
    const [longitude, latitude] = coordinates[i];

    waypoints.push(`${latitude},${longitude}`);
  }

  const [destinationLongitude, destinationLatitude] =
    coordinates[coordinates.length - 1];

  const destination =
    `${destinationLatitude},${destinationLongitude}`;

  let url =
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${encodeURIComponent(destination)}` +
    `&travelmode=driving` +
    `&dir_action=navigate`;

  if (waypoints.length > 0) {
    url +=
      `&waypoints=${encodeURIComponent(
        waypoints.join("|")
      )}`;
  }

  window.open(url, "_blank");
}
function RouteInfo({
  routes,
  selectedRoute,
  onSelectRoute
}) {
  if (!routes || routes.length === 0) {
    return null;
  }

  // Use the first route as the reference for comparison.
  const recommendedRoute = routes.reduce(
  (bestRoute, route) => {
    return Number(route.finalScore) >
      Number(bestRoute.finalScore)
      ? route
      : bestRoute;
  },
  routes[0]
);
  return (
    <section className="route-info">

      {routes.map((route, index) => {

        const isSelected =
          route === selectedRoute;

        const pm25 =
          Number(route.averagepm25);

        const exposure =
          Number(route.pollutionExposure);

        const airQuality =
          getAirQuality(pm25);

        let exposureLabel;
        let exposureIcon;

        if (exposure < 200) {
          exposureLabel = "Lower exposure";
          exposureIcon = "🟢";
        } else if (exposure < 400) {
          exposureLabel = "Moderate exposure";
          exposureIcon = "🟡";
        } else {
          exposureLabel = "Higher exposure";
          exposureIcon = "🔴";
        }


        /*
         * Compare this route with the recommended route.
         */

        const distanceDifference =
          route.distance -
          recommendedRoute.distance;

        const exposureDifference =
          exposure -
          Number(
            recommendedRoute.pollutionExposure
          );

        const isShorter =
          distanceDifference < -1;

        const isLonger =
          distanceDifference > 1;

        const hasLowerExposure =
          exposureDifference < -1;

        const hasHigherExposure =
          exposureDifference > 1;


        /*
         * Human-readable comparison message
         */

        let comparisonMessage = "";

        if (route === recommendedRoute) {
          comparisonMessage =
             "✓ Best balance of distance and pollution";
            }
            else if (hasLowerExposure && isLonger) {

          comparisonMessage =
            "Cleaner air, but slightly longer";

        } else if (hasHigherExposure && isShorter) {

          comparisonMessage =
            "Shorter route, but higher pollution";

        } else if (hasLowerExposure) {

          comparisonMessage =
            "Lower pollution exposure";

        } else if (hasHigherExposure) {

          comparisonMessage =
            "Higher pollution exposure";

        } else if (isShorter) {

          comparisonMessage =
            "Shorter route";

        } else if (isLonger) {

          comparisonMessage =
            "Slightly longer route";

        } else {

          comparisonMessage =
            "Similar conditions";

        }


        return (
          <div
            className={`route-card ${
              isSelected
                ? "selected-route"
                : ""
            }`}
            key={index}
          >
            {isSelected && (
  <button
    className="navigation-button"
    onClick={() => openGoogleMaps(route)}
  >
    🧭 Start Navigation
  </button>
)}

            {/* HEADER */}

            <div className="route-card-header">

              <div>

                <span className="route-label">
                  ROUTE {index + 1}
                </span>

              <h2>
  {route === recommendedRoute
    ? "Recommended Route"
    : "Alternative Route"}
</h2>
              </div>


              {isSelected && (
                <span className="selected-badge">
                  ✓ Selected
                </span>
              )}

            </div>


            {/* DISTANCE + TIME */}

            <div className="route-main-stats">

              <div className="main-stat">

                <span>Distance</span>

                <strong>
                  {(route.distance / 1000).toFixed(2)}
                  <small> km</small>
                </strong>

              </div>


              <div className="main-stat">

                <span>Travel time</span>

                <strong>
                  {(route.duration / 60).toFixed(1)}
                  <small> min</small>
                </strong>

              </div>

            </div>

{/* HUMAN FRIENDLY INFORMATION */}

<div className="human-route-info">

  {/* AIR QUALITY */}
  <div
    className="air-quality-box"
    style={{
      background: airQuality.background,
      borderColor: airQuality.color
    }}
  >

    <div className="info-header">
      <span className="info-label">
        AIR QUALITY
      </span>

      <strong
        style={{
          color: airQuality.color
        }}
      >
        {airQuality.icon} {airQuality.level}
      </strong>
    </div>

    <p className="info-description">
      {airQuality.description}
    </p>

    <div className="technical-value">
      PM2.5: {pm25.toFixed(1)} μg/m³
    </div>

  </div>


  {/* POLLUTION EXPOSURE */}
  <div className="exposure-box">

    <div className="info-header">

      <span className="info-label">
        POLLUTION EXPOSURE
      </span>

      <strong>
        {exposureIcon} {exposureLabel}
      </strong>

    </div>

    <p className="info-description">
      Estimated pollution during your journey
    </p>

    <div className="technical-value">
      Exposure index: {exposure.toFixed(2)}
    </div>

  </div>


  {/* AIRROUTE RECOMMENDATION */}
  <div className="route-score-box">

    <div className="info-header">

      <span className="info-label">
        AIRROUTE
      </span>

      <strong>
        {route === recommendedRoute
          ? "✓ Recommended"
          : "Alternative"}
      </strong>

    </div>

    <p className="info-description">

      {route === recommendedRoute
        ? "Best balance of distance and pollution"
        : "Another available route"}

    </p>

    <div className="technical-value">
      Route score:{" "}
      {Number(route.finalScore).toFixed(2)}
    </div>

  </div>

</div>

            {/* COMPARISON MESSAGE */}

            <div className="route-comparison">

              <span className="comparison-icon">
                {index === 0 ? "✓" : "↳"}
              </span>

              <span>
                {comparisonMessage}
              </span>

            </div>


            {/* BUTTON */}

            <button
              onClick={() =>
                onSelectRoute(route)
              }
              disabled={isSelected}
            >
              {isSelected
                ? "✓ Currently Showing"
                : "Show This Route"}
            </button>

          </div>
        );
      })}

    </section>
  );
}

export default RouteInfo;