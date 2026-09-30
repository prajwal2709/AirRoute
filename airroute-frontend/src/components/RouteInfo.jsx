import { getAirQuality } from "../utils/airQuality";

function openGoogleMaps(route) {
  if (!route?.geometry?.coordinates?.length) {
    alert("Route information is not available.");
    return;
  }

  const coordinates = route.geometry.coordinates;

  const maxWaypoints = 8;

  const step = Math.max(
    1,
    Math.floor(
      coordinates.length / (maxWaypoints + 1)
    )
  );

  const waypoints = [];

  for (
    let i = step;
    i < coordinates.length - 1 &&
    waypoints.length < maxWaypoints;
    i += step
  ) {
    const [longitude, latitude] =
      coordinates[i];

    waypoints.push(
      `${latitude},${longitude}`
    );
  }

  const [
    destinationLongitude,
    destinationLatitude
  ] =
    coordinates[
      coordinates.length - 1
    ];

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

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


function RouteInfo({
  routes,
  selectedRoute,
  onSelectRoute
}) {

  if (!routes || routes.length === 0) {
    return null;
  }

  /*
   * Highest finalScore = recommended route
   */

  const recommendedRoute =
    routes.reduce(
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

      <div className="section-heading">

        <div>
          <span className="section-eyebrow">
            ROUTE OPTIONS
          </span>

          <h2>
            Compare your routes
          </h2>

          <p>
            Choose a route based on travel time,
            distance and pollution exposure.
          </p>
        </div>

        <span className="route-count">
          {routes.length} routes
        </span>

      </div>


      <div className="route-grid">

        {routes.map((route, index) => {

          const isSelected =
            route === selectedRoute;

          const isRecommended =
            route === recommendedRoute;

          const pm25 =
            Number(route.averagepm25);

          const exposure =
            Number(route.pollutionExposure);

          const airQuality =
            getAirQuality(pm25);


          let exposureLabel;
          let exposureIcon;

          if (exposure < 200) {

            exposureLabel =
              "Lower exposure";

            exposureIcon = "🟢";

          } else if (exposure < 400) {

            exposureLabel =
              "Moderate exposure";

            exposureIcon = "🟡";

          } else {

            exposureLabel =
              "Higher exposure";

            exposureIcon = "🔴";
          }


          /*
           * Compare route against recommended route
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


          let comparisonMessage =
            "Similar conditions";


          if (isRecommended) {

            comparisonMessage =
              "Best balance of distance and pollution";

          } else if (
            hasLowerExposure &&
            isLonger
          ) {

            comparisonMessage =
              "Cleaner air, but slightly longer";

          } else if (
            hasHigherExposure &&
            isShorter
          ) {

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
          }


          return (

            <article
              key={index}
              className={`
                route-card
                ${isSelected
                  ? "selected-route"
                  : ""}
                ${isRecommended
                  ? "recommended-route"
                  : ""}
              `}
            >

              {/* TOP */}

              <div className="route-card-top">

                <div>

                  <span className="route-number">
                    ROUTE {index + 1}
                  </span>

                  <h3>

                    {isRecommended
                      ? "Cleaner Route"
                      : "Alternative Route"}

                  </h3>

                </div>


                {isRecommended && (

                  <span className="recommended-badge">
                    🌿 Recommended
                  </span>

                )}

              </div>


              {/* DISTANCE / TIME */}

              <div className="route-primary-stats">

                <div>

                  <span>
                    DISTANCE
                  </span>

                  <strong>
                    {(route.distance / 1000)
                      .toFixed(2)}
                    <small> km</small>
                  </strong>

                </div>


                <div>

                  <span>
                    TRAVEL TIME
                  </span>

                  <strong>
                    {(route.duration / 60)
                      .toFixed(1)}
                    <small> min</small>
                  </strong>

                </div>

              </div>


              {/* AIR QUALITY */}

              <div
                className="route-air-quality"
                style={{
                  background:
                    airQuality.background,
                  borderColor:
                    airQuality.color
                }}
              >

                <div>

                  <span>
                    AIR QUALITY
                  </span>

                  <strong
                    style={{
                      color:
                        airQuality.color
                    }}
                  >
                    {airQuality.icon}{" "}
                    {airQuality.level}
                  </strong>

                </div>

                <div className="pm25-value">

                  <strong>
                    {pm25.toFixed(1)}
                  </strong>

                  <span>
                    μg/m³ PM2.5
                  </span>

                </div>

              </div>


              {/* EXPOSURE */}

              <div className="route-exposure">

                <span>
                  POLLUTION EXPOSURE
                </span>

                <strong>
                  {exposureIcon}{" "}
                  {exposureLabel}
                </strong>

                <small>
                  Exposure index:{" "}
                  {exposure.toFixed(1)}
                </small>

              </div>


              {/* COMPARISON */}

              <div className="route-comparison">

                <span>
                  {isRecommended
                    ? "✓"
                    : "↳"}
                </span>

                <p>
                  {comparisonMessage}
                </p>

              </div>


              {/* ACTION */}

              {isSelected ? (

                <button
                  className="route-selected-button"
                  disabled
                >
                  ✓ Currently Showing
                </button>

              ) : (

                <button
                  className="route-select-button"
                  onClick={() =>
                    onSelectRoute(route)
                  }
                >
                  View This Route →
                </button>

              )}


              {/* GOOGLE MAPS */}

              {isSelected && (

                <button
                  className="google-navigation-button"
                  onClick={() =>
                    openGoogleMaps(route)
                  }
                >
                  🧭 Navigate with Google Maps
                </button>

              )}

            </article>
          );

        })}

      </div>

    </section>
  );
}

export default RouteInfo;