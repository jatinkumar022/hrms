import React from "react";
import { metrics } from "../data";
import { Info } from "lucide-react";

function DataSummery() {
  return (
    <div className="flex overflow-x-auto border-b  bg-white p-1 text-xs w-[calc(100vw-5rem)] ">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="whitespace-nowrap px-3 py-1 border-r last:border-r-0 flex flex-col "
        >
          <div
            className={`font-semibold ${
              metric.color || "text-gray-800 "
            } text-start`}
          >
            {metric.value}
          </div>
          <div className="text-gray-500 flex items-center gap-1 whitespace-nowrap ">
            <span>{metric.label}</span>
            {metric.info && (
              <Info size={12} className="text-gray-400 cursor-pointer" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DataSummery;
