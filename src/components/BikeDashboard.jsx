import React, { useEffect, useState } from "react";
import axios from "axios";
import SpeedPanel from "./SpeedPanel";
import mqtt from "mqtt";
import Client from "../mqtt/client";
import aurigaclient from "../mqtt/aurigaclient";

const brakeStatus = {
  1: "Brake enabled",
  0: "Brake disabled",
  null: "Brake Disabled",
};
const cruiseStatus = {
  1: "Cruise enabled",
  0: "Cruise disabled",
  null: "Cruise Disabled",
};
const driveModes = {
  1: "Eco mode",
  2: "City mode",
  3: "Power mode",
  0: "Disabled",
  null: "Disabled",
};
const modeStatus = {
  1: "Reverse mode",
  2: "Ready mode",
  3: "Park mode",
  4: "Forward mode",
  0: "Disabled",
  null: "Disabled",
};
const indicators = {
  "-1": "Neutral",
  1: "Right indicator",
  2: "Left indicator",
  3: "Hazard lights",
  null: "Neutral",
  0: "Off",
};
const ignitionStatus = { 1: "Ignition on", 0: "Ignition off" };
const regenerationStatus = {
  1: "Regeneration enabled",
  0: "Regeneration disabled",
  null: "Regeneration disabled",
};
const sideStandStatus = {
  1: "Side stand enabled",
  2: "Side stand disabled",
  0: "Disabled",
  null: "Disabled",
};
// const ID = { null: "Off" };
// const OdoValue = { null: "0" };
// const MotorSpeed = { null: "0" };
// const Soc = { null: "0" };
const batteryStates = {
  1: "Charging",
  2: "Discharging",
  0: "Off",
  null: "Off",
};
const joystickControls = {
  1: "UP_KEY",
  2: "DOWN_KEY",
  3: "RIGHT_KEY",
  4: "LEFT_KEY",
  5: "OK_KEY",
  "-1": "Neutral",
  null: "Neutral",
};

const safeValue = (value) => {
  return value === "null" || value == null ? 0 : value;
};

const Behaviour = { null: "Harsh Acceleration" };
const Time = { null: "Mon Jun 23 19:41:24 GMT+05:30 2025" };
const vechicle = { null: "865842060076576" };

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

  //video
  const [videoData, setVideoData] = useState([]); // list of videos
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");

  // Pagination States
  const [driverCurrentPage, setDriverCurrentPage] = useState(1);
  const [vehicleCurrentPage, setVehicleCurrentPage] = useState(1);
  const itemsPerPage = 5;

  //  Safe Checks
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
        <div className="flex justify-end">
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
                    ? "bg-white text-gray-500"
                    : "bg-prpsec text-white"
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

  const vehicleId = "vehicleId-865842060076576";

  // Load Map
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

  //  Fetch Vehicle Details API
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
    const interval = setInterval(fetchVehicleData, 300);
    return () => clearInterval(interval);
  }, []);

  //Driver api
  useEffect(() => {
    setDriverLoading(true);

    const fetchDriverData = async () => {
      try {
        const response = await axios.post(
          "https://3ehk0vnw62.execute-api.ca-central-1.amazonaws.com/getdriverbehaviordetails/getdriverbehaviordetails",
          { vehicleId },
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

    const intervalId = setInterval(fetchDriverData, 300);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activeTab !== "Vehicle Crash") return;

    const fetchVideoData = async () => {
      setVideoLoading(true);
      try {
        const { data } = await axios.post(
          "https://5vkat9hy3b.execute-api.ca-central-1.amazonaws.com/vid_get_videos/vid",
          { vid: vehicleId },
          { headers: { "Content-Type": "application/json" } }
        );

        //  Parse the JSON string in data.body
        const parsed = JSON.parse(data.body);

        if (Array.isArray(parsed)) {
          setVideoData(parsed);
        } else {
          console.error("Unexpected video data format:", parsed);
          setVideoData([]);
        }
      } catch (error) {
        console.error("Crash video fetch failed:", error);
        setVideoError("Crash video fetch failed");
        setVideoData([]);
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideoData();

    const intervalId = setInterval(fetchVideoData, 50000);
    return () => clearInterval(intervalId);
  }, [activeTab]);

  return (
    <>
      <div className="space-y-3 px-6 py-5">
        <div className="flex flex-wrap mb-5 -mx-2">
          <div className="w-full md:w-7/12 px-2">
            <div className="card h-full bgshadow">
             <div className="card-body min-h-[300px] p-3 position-relative">

                <div
                  id="map"
                  className="w-full h-[320px] rounded-xl shadow-lg"
                ></div>
              </div>
            </div>
          </div>

          {/* total vehicles div closed */}

          <div className="w-full md:w-5/12 px-2">
            <div className="card h-full bgshadow">
              <div className="card-body min-h-[300px] flex items-center justify-center">
                <SpeedPanel
                  speed={
                    Number(vehicleData?.body?.[0]?.file_content?.Motor_speed) ||
                    0
                  }
                  soc={Number(vehicleData?.body?.[0]?.file_content?.SOC) || 0}
                  odo={
                    Number(vehicleData?.body?.[0]?.file_content?.odoValue) || 0
                  }
                />
              </div>
            </div>
          </div>
          {/* avg miles  div closed */}
        </div>

        {/* TABS */}
        <div className="bgshadow">
          <div className="flex space-x-4 px-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 transition-all duration-300 ease-in-out ${
                  activeTab === tab
                    ? "text-white-600 border-b-2 border-color"
                    : "text-active"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div>
            {/*  Driver Behaviour Tab */}
            <div>
              {activeTab === "Driver Behaviour" && (
                <>
                  {driverLoading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                  ) : driverError ? (
                    <div className="text-center text-red-500">
                      {driverError}
                    </div>
                  ) : (
                    <div className="p-4 overflow-auto">
                      <div className="p-4 bgprimary2 rounded">
                        <table className="ctable">
                          <thead>
                            <tr>
                              {[
                                "S.No",
                                "Behaviour Status",
                                "Time Stamp",
                                "Vehicle ID",
                              ].map((header, index) => (
                                <th key={index}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {driverData.length > 0 ? (
                              driverPaginatedData.map((item, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>
                                    {item.behaviourStatus ?? Behaviour[null]}
                                  </td>
                                  <td>{item.timeStamp ?? Time[null]}</td>
                                  <td>{item.vehicleId ?? vechicle[null]}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No Data Found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
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

            {/*  Vehicle Details Tab */}
            {activeTab === "Vehicle Details" && (
              <>
                {vehicleLoading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : vehicleError ? (
                  <div className="text-center text-red-500">{vehicleError}</div>
                ) : (
                  <div className="p-4">
                    <div className="overflow-auto bgprimary2 p-4 rounded">
                      <div className="bgprimary2 rounded">
                        <table className="ctable">
                          <thead>
                            <tr>
                              {[
                                "S.No",
                                // "ID",
                                "Date",
                                "Battery Status",
                                "Brake",
                                "Cruise",
                                "Drive Modes",
                                "Modes",
                                "Indicators",
                                // "Is Wake/Sleep",
                                // "Joystick Controls",
                                "Motor Speed",
                                "OdoValue",
                                "Regeneration",
                                "Side Stand",
                                "SOC",
                                "Trip Value",
                                // "Video Crash",
                              ].map((header, index) => (
                                <th key={index}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {vehiclePaginatedData.length > 0 ? (
                              vehiclePaginatedData.map((item, index) => {
                                const fc = item.file_content || {};
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    {/* <td>{ID[fc.ID || "-"]}</td> */}
                                    <td>
                                      {item.last_modified_date
                                        ? new Date(
                                            item.last_modified_date
                                          ).toLocaleString()
                                        : "-"}
                                    </td>
                                    <td>
                                      {batteryStates[fc.Battery_state] || "-"}
                                    </td>
                                    <td>{brakeStatus[fc.Brake] || "-"}</td>
                                    <td>{cruiseStatus[fc.Cruise] || "-"}</td>
                                    <td>{driveModes[fc.DriveModes] || "-"}</td>
                                    <td>{modeStatus[fc.Modes] || "-"}</td>
                                    <td>{indicators[fc.Indicators] || "-"}</td>
                                    {/* <td className="border px-2 py-1">
                              {ignitionStatus[fc.isWakeOrSleep] || "-"}
                            </td> */}
                                    {/* <td>
                                      {joystickControls[fc.JoystickControls] ||
                                        fc.JoystickControls ||
                                        "-"}
                                    </td> */}

                                    <td>{safeValue(fc.Motor_speed)}</td>
                                    <td>{safeValue(fc.odoValue)}</td>

                                    <td>
                                      {regenerationStatus[fc.Regeneration] ||
                                        "-"}
                                    </td>
                                    <td>
                                      {sideStandStatus[fc.Side_Stand] || "-"}
                                    </td>
                                    <td>{safeValue(fc.SOC)}</td>
                                    <td>{fc.tripValue || "-"}</td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="18" className="text-centerpy-4">
                                  No Data Found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
          {activeTab === "Vehicle Crash" && (
            <div>
              {videoLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : videoError ? (
                <div className="text-center text-gray-500">{videoError}</div>
              ) : (
                <div className="p-4">
                  <div className="p-4 bgprimary2 rounded">
                    <table className="ctable">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Timestamp</th>
                          <th className="text-center">Crash Video</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videoData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {item.date_time || "23-06-2025, 3:55:28 PM"}
                            </td>
                            <td>
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative block w-10 h-10 rounded mx-auto"
                              >
                                <div className="videosec relative rounded">
                                  <video
                                    src={item.file_url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                    onLoadedData={(e) =>
                                      e.currentTarget.pause()
                                    }
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/50 rounded-full p-0.5">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-2.5 w-2.5 text-white fill-current"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M6 4l10 6-10 6V4z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BikeDashboard;
