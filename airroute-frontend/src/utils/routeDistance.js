const EARTH_RADIUS = 6371000;

function toRadians(value) {
  return value * Math.PI / 180;
}

function distanceBetweenPoints(point1, point2) {
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const deltaLat = toRadians(
    point2.latitude - point1.latitude
  );

  const deltaLon = toRadians(
    point2.longitude - point1.longitude
  );

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(deltaLon / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function closestPointOnSegment(
  user,
  start,
  end
) {
  const latitudeScale =
    Math.cos(toRadians(user.latitude));

  const x1 =
    start.longitude *
    latitudeScale;

  const y1 =
    start.latitude;

  const x2 =
    end.longitude *
    latitudeScale;

  const y2 =
    end.latitude;

  const x =
    user.longitude *
    latitudeScale;

  const y =
    user.latitude;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return start;
  }

  let t =
    ((x - x1) * dx +
      (y - y1) * dy) /
    (dx * dx + dy * dy);

  t = Math.max(0, Math.min(1, t));

  return {
    latitude:
      start.latitude +
      t * (end.latitude - start.latitude),

    longitude:
      start.longitude +
      t * (end.longitude - start.longitude)
  };
}

export function calculateRemainingDistance(
  route,
  currentLocation
) {
  if (!route || !currentLocation) {
    return null;
  }

  const coordinates =
    route.geometry.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude
      })
    );

  if (coordinates.length < 2) {
    return null;
  }

  let closestPoint = null;
  let closestDistance = Infinity;
  let closestSegmentIndex = 0;

  for (
    let i = 0;
    i < coordinates.length - 1;
    i++
  ) {
    const start = coordinates[i];
    const end = coordinates[i + 1];

    const point =
      closestPointOnSegment(
        currentLocation,
        start,
        end
      );

    const distance =
      distanceBetweenPoints(
        currentLocation,
        point
      );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestPoint = point;
      closestSegmentIndex = i;
    }
  }

  let remainingDistance =
    distanceBetweenPoints(
      closestPoint,
      coordinates[closestSegmentIndex + 1]
    );

  for (
    let i = closestSegmentIndex + 1;
    i < coordinates.length - 1;
    i++
  ) {
    remainingDistance +=
      distanceBetweenPoints(
        coordinates[i],
        coordinates[i + 1]
      );
  }

  return remainingDistance;
}
export function calculateDistanceFromRoute(
  route,
  currentLocation
) {
  if (!route || !currentLocation) {
    return null;
  }

  const coordinates =
    route.geometry.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude
      })
    );

  if (coordinates.length < 2) {
    return null;
  }

  let closestDistance = Infinity;

  for (
    let i = 0;
    i < coordinates.length - 1;
    i++
  ) {
    const start = coordinates[i];
    const end = coordinates[i + 1];

    const closestPoint =
      closestPointOnSegment(
        currentLocation,
        start,
        end
      );

    const distance =
      distanceBetweenPoints(
        currentLocation,
        closestPoint
      );

    if (distance < closestDistance) {
      closestDistance = distance;
    }
  }

  return closestDistance;
}