import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

const GlobeComponent = ({ hotTakes }) => {
  const globeRef = useRef(null);
  const [globeReady, setGlobeReady] = useState(false);

  const labels = hotTakes.map((take) => ({
    lat: take.latitude,  
    lng: take.longitude, 
    text: take.location, 
    label: `${take.location}: ${take.hot_take}`, 
    size: 1.5, 
    color: "orange",
    dotSize: Math.log(take.count + 1) * 0.5,
  }));

  useEffect(() => {
    if (globeReady && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: 20, lng: 0, altitude: 1.5 }, 
        2000 
      );
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
    }
  }, [globeReady]); 

  return (
    <Globe
      ref={globeRef}
      width={600}
      height={600}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
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
      labelDotRadius={(d) => d.dotSize}
      labelIncludeDot={true}
      animateIn={true}
      onGlobeReady={() => setGlobeReady(true)}
    />
  );
};

export default GlobeComponent;
