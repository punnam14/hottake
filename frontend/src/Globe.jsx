import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

const GlobeComponent = ({ hotTakes }) => {
  const globeRef = useRef(null);
  const [globeReady, setGlobeReady] = useState(false);

  // Function to get lat/lng (Mock function - Replace with API if needed)
  const getLatLong = (location) => {
    const coordinates = {
      "United States": { lat: 37.0902, lng: -95.7129 },
      "India": { lat: 20.5937, lng: 78.9629 },
      "Germany": { lat: 51.1657, lng: 10.4515 },
      "Canada": { lat: 56.1304, lng: -106.3468 },
      "Australia": { lat: -25.2744, lng: 133.7751 }
    };
    return coordinates[location] || { lat: 0, lng: 0 }; // Default to center
  };

  // Convert hot takes into label data
  const labels = hotTakes.map((take) => {
    const { lat, lng } = getLatLong(take.location);
    return {
      lat,
      lng,
      text: take.location, // Display country name
      label: `${take.location}: ${take.count || 1} reviews`,
      size: Math.log((take.count || 1) + 1) * 2, // Logarithmic scaling for text size
      color: "orange",
    };
  });

  useEffect(() => {
    if (globeReady && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: 20, lng: 0, altitude: 1.5 }, // **Lower altitude = More zoom**
        2000 // Duration of transition in milliseconds
      );
    }
  }, [globeReady]); // Runs when the globe is ready

  return (
    <Globe
      ref={globeRef}
      width={600}
      height={600}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      showAtmosphere={true}
      atmosphereColor="lightskyblue"
      atmosphereAltitude={0.15}
      labelsData={labels}
      labelLat="lat"
      labelLng="lng"
      labelText="text"
      labelColor={() => "orange"}
      labelSize="size"
      labelDotRadius={0.5}
      labelIncludeDot={true}
      animateIn={true}
      onGlobeReady={() => setGlobeReady(true)}
    />
  );
};

export default GlobeComponent;
