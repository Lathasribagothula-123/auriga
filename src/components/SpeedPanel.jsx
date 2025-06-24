function SpeedPanel({ speed = 0, soc = 100, odo = 0 }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (speed / 100) * circumference;

  return (

    <>

      <div className="cborder cradius text-center bgprimary2 text-white">
        <p className="text-sm">Odometer</p>
        <p className="text-2xl mt-1">{odo.toLocaleString()} km</p>
      </div>



      <div className="p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 md:space-x-6">
        {/* Odometer */}


        {/* Speed Meter */}
        <div className="p-4 bgprimary2 rounded minh-150">
        <div className="relative flex flex-col items-center justify-center">
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#5932EA"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#5932EA"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl font-semibold text-white">{speed} km/h</p>
          </div>
        </div>
        </div>

        {/* Battery / SOC */}
        <div className="p-4 bgprimary2 rounded minh-150 flex items-center">
        <div className="w-full md:w-24 text-center font-semibold space-y-2">
          <p className="text-sm">Battery</p>
          <div className="w-full battery-bg h-2 rounded-full">
            <div
              className="h-2 rounded-full bg-green-400 transition-all duration-500 ease-in-out"
              style={{ width: `${soc}%` }}
            />
          </div>
          <p className="text-sm">{soc}%</p>
        </div>
        </div>
      </div>
    </>
  );
}

export default SpeedPanel;
