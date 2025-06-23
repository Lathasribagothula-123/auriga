import React, { useEffect, useState } from "react";
import axios from "axios";
import SpeedPanel from "./SpeedPanel";
import mqtt from 'mqtt';
import Client from "../mqtt/client";

const brakeStatus = { 1: "Brake enabled", 0: "Brake disabled" };
const cruiseStatus = { 1: "Cruise enabled", 0: "Cruise disabled" };
const driveModes = { 1: "Eco mode", 2: "City mode", 3: "Power mode",0:"Disabled" };
const modeStatus = {
  1: "Reverse mode",
  2: "Ready mode",
  3: "Park mode",
  4: "Forward mode",
  0:"Disabled",
};
const indicators = {
  "-1": "Neutral",
  1: "Right indicator",
  2: "Left indicator",
  3: "Hazard lights",
};
const ignitionStatus = { 1: "Ignition on", 0: "Ignition off" };
const regenerationStatus = {
  1: "Regeneration enabled",
  0: "Regeneration disabled",
};
const sideStandStatus = {
  1: "Side stand enabled",
  2: "Side stand disabled",
  0: "Disabled",
};
const batteryStates = { 1: "Charging", 2: "Discharging", 0: "Off", null:"Off"};
const joystickControls = {
  1: "UP_KEY",
  2: "DOWN_KEY",
  3: "RIGHT_KEY",
  4: "LEFT_KEY",
  5: "OK_KEY",
  "-1": "Neutral",
   "null": "Neutral"
};

const tabs = ["Driver Behaviour", "Vehicle Details", "Vehicle Crash"];

function BikeDashboard() {
  const [activeTab, setActiveTab] = useState("Driver Behaviour");

  // Vehicle Details API state
  const [vehicleData, setVehicleData] = useState({ body: [] });
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState("");

  // Driver Behaviour API state
  const [driverData, setDriverData] = useState([]);
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState("");

  // Pagination States
  const [driverCurrentPage, setDriverCurrentPage] = useState(1);
  const [vehicleCurrentPage, setVehicleCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🧠 Safe Checks
  const safeDriverData = Array.isArray(driverData) ? driverData : [];
  const safeVehicleData = Array.isArray(vehicleData?.body)
    ? vehicleData.body
    : [];

  // Driver Behaviour Pagination
  const driverStartIndex = (driverCurrentPage - 1) * itemsPerPage;
  const driverPaginatedData = safeDriverData.slice(
    driverStartIndex,
    driverStartIndex + itemsPerPage
  );
  const driverTotalPages = Math.ceil(safeDriverData.length / itemsPerPage);

  // Vehicle Details Pagination
  const vehicleStartIndex = (vehicleCurrentPage - 1) * itemsPerPage;
  const vehiclePaginatedData = safeVehicleData.slice(
    vehicleStartIndex,
    vehicleStartIndex + itemsPerPage
  );
  const vehicleTotalPages = Math.ceil(safeVehicleData.length / itemsPerPage);
  const videoUrl =
    "https://auriga-cam-bg-videos.s3.ca-central-1.amazonaws.com/upload.mp4";

  // Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageGroupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="w-full">
      <div className="flex justify-end pr-4">
        <div className="flex space-x-1">
          {/* Previous group */}
          {startPage > 1 && (
            <button
              onClick={() => onPageChange(startPage - 1)}
              className="text-sm px-3 py-1 border rounded bg-white text-gray-500"
            >
              &laquo;
            </button>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`text-sm px-3 py-1 border rounded ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next group */}
          {endPage < totalPages && (
            <button
              onClick={() => onPageChange(endPage + 1)}
              className="text-sm px-3 py-1 border rounded bg-white text-gray-500"
            >
              &raquo;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


  const vehicleId = "vehicleId-49c91a3ab387153a";

  // 🗺️ Load Map
  useEffect(() => {
    const scriptId = "mappls-script";

    const loadMap = () => {
      if (!window.L || !vehicleData?.body?.[0]?.file_content) return;

      const { latitude, longitude } = vehicleData.body[0].file_content;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      // If map already initialized
      if (window.mapInstance) {
        window.mapInstance.setView([lat, lng], 15);
        if (window.bikeMarker) {
          window.bikeMarker.setLatLng([lat, lng]);
        } else {
          window.bikeMarker = window.L.marker([lat, lng]).addTo(
            window.mapInstance
          );
        }
        return;
      }

      // Initialize new map
      const map = window.L.map("map").setView([lat, lng], 15);
      window.mapInstance = map;

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      window.bikeMarker = window.L.marker([lat, lng]).addTo(map);
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://apis.mappls.com/advancedmaps/v1/c45331da12ea977d69c6ec5988dea0cb/map_load?v=1.5";
      script.async = true;
      script.onload = loadMap;
      document.body.appendChild(script);
    } else {
      loadMap();
    }
  }, [vehicleData]);

  // 🚗 Fetch Vehicle Details API
  useEffect(() => {
    setVehicleLoading(true);
    const fetchVehicleData = async () => {
      try {
        const response = await axios.post(
          "https://95gqvfjrr6.execute-api.ca-central-1.amazonaws.com/s3bucketvehicledetailsapi/s3bucketvehicledetailsapi",
          { vehicleId },
          { headers: { "Content-Type": "application/json" } }
        );
        setVehicleData(response.data);
        setVehicleLoading(false);
      } catch (err) {
        setVehicleError("Vehicle data fetch failed");
        setVehicleLoading(false);
      }
    };
    fetchVehicleData();
    const interval = setInterval(fetchVehicleData, 5000);
    return () => clearInterval(interval);
  }, []);

useEffect(() => {
  setDriverLoading(true);

  const fetchDriverData = async () => {
    try {
      const response = await axios.post(
        "https://3ehk0vnw62.execute-api.ca-central-1.amazonaws.com/getdriverbehaviordetails/getdriverbehaviordetails",
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      const parsed =
        response.data?.body?.map((item) => item.file_content) || [];
      setDriverData(parsed);
      setDriverLoading(false);
    } catch (err) {
      setDriverError("Driver behaviour fetch failed");
      setDriverLoading(false);
    }
  };

 
  fetchDriverData();

  const intervalId = setInterval(fetchDriverData, 500); 

  return () => clearInterval(intervalId);
}, []);



  return (
    <div className="space-y-4">
      {/* MAP & SPEED PANEL */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div
          id="map"
          className="w-full md:w-3/5 h-[300px] rounded-xl shadow-lg"
        ></div>
        <div className="w-full md:w-2/5 h-84 bg-white rounded shadow flex items-center justify-center">
          <SpeedPanel
            speed={
              Number(vehicleData?.body?.[0]?.file_content?.Motor_speed) || 0
            }
            soc={Number(vehicleData?.body?.[0]?.file_content?.SOC) || 0}
            odo={Number(vehicleData?.body?.[0]?.file_content?.odoValue) || 0}
          />
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded shadow">
        <div className="flex space-x-4 border-b px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 transition-all duration-300 ease-in-out ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-auto">
          {/* 🧠 Driver Behaviour Tab */}
          <div className="p-4 overflow-auto">
            {activeTab === "Driver Behaviour" && (
              <>
                {driverLoading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : driverError ? (
                  <div className="text-center text-red-500">{driverError}</div>
                ) : (
                  <table className="min-w-full text-sm border border-gray-200 text-center">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">S.No</th>
                        <th className="border px-2 py-1">Behaviour Status</th>
                        <th className="border px-2 py-1">Timestamp</th>
                        <th className="border px-2 py-1">Vehicle ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverData.length > 0 ? (
                        driverPaginatedData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border px-2 py-1">{index + 1}</td>
                            <td className="border px-2 py-1">
                              {item.behaviourStatus || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {item.timeStamp || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {item.vehicleId || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-gray-500 py-4"
                          >
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                <div className="mt-4">
                  <Pagination
                    currentPage={driverCurrentPage}
                    totalPages={driverTotalPages}
                    onPageChange={setDriverCurrentPage}
                  />
                </div>
              </>
            )}
          </div>

          {/* 🚗 Vehicle Details Tab */}
          {activeTab === "Vehicle Details" && (
            <>
              {vehicleLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : vehicleError ? (
                <div className="text-center text-red-500">{vehicleError}</div>
              ) : (
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {[
                        "S.No",
                        "ID",
                        "Date",
                        "Battery Status",
                        "Brake",
                        "Cruise",
                        "Drive Modes",
                        "Modes",
                        "Indicators",
                        // "Is Wake/Sleep",
                        "Joystick Controls",
                        "Motor Speed",
                        "OdoValue",
                        "Regeneration",
                        "Side Stand",
                        "SOC",
                        "Trip Value",
                        "Video Crash",
                      ].map((header, index) => (
                        <th key={index} className="border px-2 py-1 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehiclePaginatedData.length > 0 ? (
                      vehiclePaginatedData.map((item, index) => {
                        const fc = item.file_content || {};
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border px-2 py-1">{index + 1}</td>
                            <td className="border px-2 py-1">{fc.ID || "-"}</td>
                            <td className="border px-2 py-1">
                              {item.last_modified_date
                                ? new Date(
                                    item.last_modified_date
                                  ).toLocaleString()
                                : "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {batteryStates[fc.Battery_state] || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {brakeStatus[fc.Brake] || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {cruiseStatus[fc.Cruise] || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {driveModes[fc.DriveModes] || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {modeStatus[fc.Modes] || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {indicators[fc.Indicators] || "-"}
                            </td>
                            {/* <td className="border px-2 py-1">
                              {ignitionStatus[fc.isWakeOrSleep] || "-"}
                            </td> */}
                            <td className="border px-2 py-1">
                              {joystickControls[fc.JoystickControls] ||
                                fc.JoystickControls ||
                                "-"}
                            </td>

                            <td className="border px-2 py-1">
                              {fc.Motor_speed || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {fc.odoValue || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {regenerationStatus[fc.Regeneration] || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {sideStandStatus[fc.Side_Stand] || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {fc.SOC || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {fc.tripValue || "-"}
                            </td>
                            {/* 🚀 NEW thumbnail cell */}
                            <td className="p-1 align-middle">
                              <div className="flex items-center justify-center">
                                <a
                                  href="https://videosarcarmanual.s3.ap-south-1.amazonaws.com/parking.mp4"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative block w-10 h-8 rounded overflow-hidden"
                                >
                                  <video
                                    src="https://videosarcarmanual.s3.ap-south-1.amazonaws.com/parking.mp4"
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                    onLoadedData={(e) =>
                                      e.currentTarget.pause()
                                    }
                                  />
                                  {/* Centered Play Icon Overlay */}
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="bg-black bg-opacity-50 rounded-full p-0.5 flex items-center justify-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-2.5 w-2.5 text-white"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path d="M6 4l10 6-10 6V4z" />
                                      </svg>
                                    </div>
                                  </div>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="18"
                          className="text-center text-gray-500 py-4"
                        >
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              <div className="mt-4">
                <Pagination
                  currentPage={vehicleCurrentPage}
                  totalPages={vehicleTotalPages}
                  onPageChange={setVehicleCurrentPage}
                />
              </div>
            </>
          )}
        </div>

        <Client />
      </div>
    </div>
  );
}

export default BikeDashboard;
