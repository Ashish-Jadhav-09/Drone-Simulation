import React, { useEffect, useState } from "react";
import Maps, { computeDistance, interpolate } from "react-maps-suite";
import DroneControls from "./component/droneControls";

const defaultCenter = {
  lat: 18.562663708833288,
  lng: -68.3960594399559,
};

const defaultZoom = 15;
const DEFAULT_SPEED = 10;
const TIME_INTERVAL = 1000;

const App = () => {
  const [dronePath, setDronePath] = useState([
    { lat: 18.562093938563784, lng: -68.40836660716829 },
    { lat: 18.560995497953385, lng: -68.40230123938906 },
    { lat: 18.558920646396807, lng: -68.39049951972353 },
    { lat: 18.55794423693522, lng: -68.3884395832001 },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [polylinePath, setPolylinePath] = useState([]);

  useEffect(() => {
    setPolylinePath(dronePath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {}, TIME_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const distance = DEFAULT_SPEED * 0.1;

  useEffect(() => {
    if (isSimulating && currentWaypointIndex < dronePath.length - 1) {
      const currentWaypoint = dronePath[currentWaypointIndex];
      const nextWaypoint = dronePath[currentWaypointIndex + 1];

      const distanceToNextWaypoint = computeDistance(
        currentWaypoint,
        nextWaypoint
      );

      if (distance >= distanceToNextWaypoint) {
        // The drone has reached or passed the next waypoint
        setCurrentWaypointIndex(currentWaypointIndex + 1);

        if (currentWaypointIndex === dronePath.length - 2) {
          // If this is the last waypoint, pause the simulation
          setIsSimulating(false);
        } else {
          // Calculate the remaining distance to the next waypoint
          const remainingDistance = distance - distanceToNextWaypoint;

          // Recursively call the function with the remaining distance
          updateDronePath(remainingDistance);
        }
      } else {
        // Interpolate the drone's position between the current and next waypoint
        const newPosition = getPositionAt(
          currentWaypoint,
          nextWaypoint,
          distance
        );

        // Update the drone path by preserving previous positions
        setDronePath((prevPath) => [
          ...prevPath.slice(0, currentWaypointIndex), // Keep previous positions
          newPosition, // Add the new position
          ...prevPath.slice(currentWaypointIndex + 1), // Keep subsequent positions
        ]);

        // Update the Polyline path to show the path traveled by the drone
        setPolylinePath((prevPolylinePath) => {
          if (
            polylinePath[0].lat === newPosition.lat &&
            polylinePath[0].lng === newPosition.lng
          ) {
            return [newPosition, ...polylinePath.slice(1)];
          } else {
            prevPolylinePath[0] = newPosition;
            return prevPolylinePath;
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance, dronePath, isSimulating, currentWaypointIndex]);

  // Function to update drone path recursively with remaining distance
  const updateDronePath = (remainingDistance) => {
    if (currentWaypointIndex < dronePath.length - 1) {
      const currentWaypoint = dronePath[currentWaypointIndex];
      const nextWaypoint = dronePath[currentWaypointIndex + 1];

      const distanceToNextWaypoint = computeDistance(
        currentWaypoint,
        nextWaypoint
      );

      if (remainingDistance >= distanceToNextWaypoint) {
        // The drone has reached or passed the next waypoint
        setCurrentWaypointIndex(currentWaypointIndex + 1);

        if (currentWaypointIndex === dronePath.length - 2) {
          // If this is the last waypoint, pause the simulation
          setIsSimulating(false);
        } else {
          // Calculate the remaining distance to the next waypoint
          const newRemainingDistance =
            remainingDistance - distanceToNextWaypoint;

          // Recursively call the function with the new remaining distance
          updateDronePath(newRemainingDistance);
        }
      } else {
        // Interpolate the drone's position between the current and next waypoint
        const newPosition = getPositionAt(
          currentWaypoint,
          nextWaypoint,
          remainingDistance
        );
        // Update the drone path by preserving previous positions
        setDronePath((prevPath) => [
          ...prevPath.slice(0, currentWaypointIndex), // Keep previous positions
          newPosition, // Add the new position
          ...prevPath.slice(currentWaypointIndex + 1), // Keep subsequent positions
        ]);

        // Update polylinePath based on the previous state
        setPolylinePath((prevPolylinePath) => {
          if (
            polylinePath[0].lat === newPosition.lat &&
            polylinePath[0].lng === newPosition.lng
          ) {
            return [newPosition, ...polylinePath.slice(1)];
          } else {
            prevPolylinePath[0] = newPosition;
            return prevPolylinePath;
          }
          // Remove the first element and add the newPosition object
        });
      }
    }
  };

  const getPositionAt = (start, end, distance) => {
    const totalDistance = computeDistance(start, end);
    if (totalDistance <= 0) {
      return start;
    }

    const ratio = distance / totalDistance;
    if (ratio >= 1) {
      return end;
    }

    const newPosition = interpolate(start, end, ratio);
    return newPosition;
  };

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          margin: "50px 0px 30px 50px",
          height: 400,
          width: 1000,
        }}
      >
        <Maps
          provider="google"
          center={dronePath[0]}
          defaultCenter={dronePath.length > 0 ? dronePath[0] : defaultCenter}
          defaultZoom={defaultZoom}
        >
          {dronePath.map((position, index) => (
            <Maps.Marker key={`position${index + 1}`} position={position} />
          ))}
          {polylinePath.length > 1 && (
            <Maps.Polyline path={polylinePath} color="blue" />
          )}
        </Maps>
      </div>
      <DroneControls
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        setDronePath={setDronePath}
        setCurrentWaypointIndex={setCurrentWaypointIndex}
        setPolylinePath={setPolylinePath}
      />
    </div>
  );
};

export default App;
