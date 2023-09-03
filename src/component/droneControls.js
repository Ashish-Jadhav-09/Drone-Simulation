import React, { useState } from "react";
import { Button, TextField, Box, Typography } from "@mui/material";
import * as yup from "yup";
import CSVReader from "react-csv-reader";
import "./style.css";

const DroneControls = ({
  isSimulating,
  setIsSimulating,
  setDronePath,
  setCurrentWaypointIndex,
  setPolylinePath,
}) => {
  const [formValue, setFormValues] = useState({
    lat: 0,
    lng: 0,
    isDisabled: true,
    isTouched: {},
    error: {},
  });
  const [data, setData] = useState([]);

  const { lat, isTouched, error, lng, isDisabled } = formValue;

  const validationSchema = yup.object({
    lat: yup.number().min(-90).max(90).required("Latitude is required"),
    lng: yup.number().min(-180).max(180).required("Longitude is required"),
  });

  const handleError = (values) => {
    validationSchema
      .validate(
        {
          lat,
          lng,
        },
        { abortEarly: false }
      )
      .then(() => {
        setFormValues({
          ...values,
          error: {},
          isDisabled: false,
        });
      })
      .catch((allErrors) => {
        const schemaErrors = {};
        if (allErrors) {
          allErrors.inner.forEach((err) => {
            schemaErrors[err.path] = err.message;
          });
          setFormValues({
            ...values,
            error: schemaErrors,
            isDisabled: true,
          });
        }
      });
  };

  const handleOnBlur = (event, type) => {
    isTouched[type] = true;
    const newValue = {
      ...formValue,
      isTouched,
    };
    setFormValues(newValue);
    handleError(newValue);
  };
  const getError = (type) => {
    if (isTouched[type]) {
      return error[type] || "";
    }
    return "";
  };

  const handleOnChange = (field, event) => {
    setFormValues({
      ...formValue,
      [field]: event.target.value,
    });
    handleError({
      ...formValue,
      [field]: event.target.value,
    });
  };

  const startSimulation = () => {
    setIsSimulating(true);
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setDronePath([]);
    setCurrentWaypointIndex(0);
    setPolylinePath([]);
  };

  const addWaypoint = () => {
    const newWaypoint = {
      lat: parseFloat(formValue.lat),
      lng: parseFloat(formValue.lng),
    };
    setDronePath((prevPath) => [...prevPath, newWaypoint]);
    setPolylinePath((prevPath) => [...prevPath, newWaypoint]);
    setFormValues({
      lat: 0,
      lng: 0,
      isDisabled: true,
      isTouched: {},
      error: {},
    });
  };

  return (
    <div className="controls-container">
      <Box className="way-points-box" gap={2}>
        <Typography
          fontFamily="fantasy"
          fontSize={30}
          style={{ margin: "-15px 0px 5px 0px" }}
        >
          Add Path
        </Typography>
        <TextField
          type="number"
          label="Enter Latitude"
          variant="outlined"
          value={formValue.lat}
          onChange={(event) => handleOnChange("lat", event)}
          onBlur={(event) => {
            handleOnBlur(event, "lat");
          }}
          error={getError("lat")}
          helperText={getError("lat")}
        />
        <TextField
          type="number"
          label="Enter Longitude"
          variant="outlined"
          value={formValue.lng}
          onChange={(event) => handleOnChange("lng", event)}
          onBlur={(event) => {
            handleOnBlur(event, "lng");
          }}
          error={getError("lng")}
          helperText={getError("lng")}
        />
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={addWaypoint}
            disabled={isDisabled}
            style={{ marginRight: "10px" }}
          >
            Add Waypoint
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setDronePath([]);
              setPolylinePath([]);
            }}
          >
            Clear Path
          </Button>
        </div>
        or add data via csv file
        <CSVReader
          parserOptions={{ header: true }}
          onFileLoaded={(data, fileInfo) => {
            setData([]);
            setDronePath([]);
            setPolylinePath([]);
            const formatted = data
              .map((e) => ({
                lat: Number(e.latitude || e.Latitude),
                lng: Number(e.longitude || e.Longitude),
              }))
              .filter((e) => e.lng && e.lat);
            setData(formatted);
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (!data[0]) return;
            setDronePath(data);
            setPolylinePath(data);
          }}
        >
          Upload
        </Button>
      </Box>
      <Box className="drone-control-box" gap={2}>
        <Typography
          fontFamily="fantasy"
          fontSize={30}
          style={{ margin: "-15px" }}
        >
          Drone Controls
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={startSimulation}
          disabled={isSimulating}
        >
          Start Simulation
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={pauseSimulation}
          disabled={!isSimulating}
        >
          Pause Simulation
        </Button>
        <Button variant="contained" color="secondary" onClick={resetSimulation}>
          Reset Simulation
        </Button>
      </Box>
    </div>
  );
};

export default DroneControls;
