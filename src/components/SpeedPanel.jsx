function SpeedPanel({ speed = 0, soc = 100, odo = 0 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (speed / 100) * circumference;

  return (
    <div className="w-full flex justify-center px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center justify-items-center">

        {/* Battery */}

<div className="w-[110px] h-[200px] bgprimary2 rounded-xl flex flex-col items-center justify-center text-white text-center shadow mt-32">
  <p className="text-sm mb-2">Battery</p>

  <div className="relative flex flex-col items-center mt-2">


    <div className="w-6 h-1.5 bg-white rounded-t-sm mb-1"></div>

    {/* Battery Body */}
    <div className="w-6 h-24 border-2 border-white rounded-sm flex flex-col-reverse overflow-hidden">
      {Array.from({ length: 5 }).map((_, idx) => {
        const filledSegments = Math.floor(soc / 20); // 5 segments, 20% each
        const isFilled = idx < filledSegments;

        return (
          <div
            key={idx}
            className={`flex-1 border-t border-white last:border-t-0 ${
              isFilled ? 'bg-battery' : 'bg-gray-300'
            }`}
          ></div>
        );
      })}
    </div>
  </div>

  <p className="text-sm mt-2">{soc}%</p>
</div>


{/* Speedometer */}
<div className="w-[220px] h-[250px] bgprimary2 rounded-xl relative flex items-center justify-center text-white shadow -mt-8">
  <svg width="180" height="180" className="transform -rotate-90">
    <circle
      cx="90"
      cy="90"
      r="70"
      stroke="#858194"
      strokeWidth="12"
      fill="none"
    />
    <circle
      cx="90"
      cy="90"
      r="70"
      stroke="#5932EA"
      strokeWidth="12"
      fill="none"
      strokeLinecap="round"
      strokeDasharray={2 * Math.PI * 70}
      strokeDashoffset={2 * Math.PI * 70 - (speed / 100) * 2 * Math.PI * 70}
      className="transition-all duration-500 ease-in-out"
    />
  </svg>

  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <p className="text-base font-medium">Speed</p>
    <p className="text-3xl font-bold">{speed} km/h</p>
  </div>
</div>



        {/* Odometer */}
       <div className="w-[110px] h-[200px] bgprimary2 rounded-xl flex flex-col items-center justify-center text-white text-center shadow mt-28">
  <p className="text-sm">Odometer</p>
  <p className="text-lg font-semibold mt-1">{odo.toLocaleString()} km</p>
</div>
      </div>
    </div>
  );
}

export default SpeedPanel;
