export function getAirQuality(pm25) {
  if (pm25 < 15) {
    return {
      level: "Cleaner air",
      description: "Lower PM2.5 levels",
      color: "#16845f",
      background: "#e7f5ef",
      icon: "🟢"
    };
  }

  if (pm25 < 35) {
    return {
      level: "Moderate",
      description: "Moderate pollution",
      color: "#b7791f",
      background: "#fff7df",
      icon: "🟡"
    };
  }

  if (pm25 < 55) {
    return {
      level: "High pollution",
      description: "Higher PM2.5 levels",
      color: "#c65d16",
      background: "#fff0e5",
      icon: "🟠"
    };
  }

  return {
    level: "Very high pollution",
    description: "Very high PM2.5 levels",
    color: "#c53030",
    background: "#fde8e8",
    icon: "🔴"
  };
}