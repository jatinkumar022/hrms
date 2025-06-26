"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { format } from "date-fns";

type TimeData = {
  date: string;
  beforeBreak: number;
  break: number;
  afterBreak: number;
  missing: number;
};

type DailyTimeChartProps = {
  data: TimeData[];
};

export default function DailyTimeChart({ data }: DailyTimeChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Detect Tailwind dark mode changes
  useEffect(() => {
    const updateTheme = () => {
      const tailwindDark = document.documentElement.classList.contains("dark");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(tailwindDark || prefersDark);
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Colors based on dark mode
  const textColor = darkMode ? "#d4d4d8" : "#1e1e1e";
  const gridColor = darkMode ? "#3f3f46" : "#e5e5e5";
  const borderColor = darkMode ? "#52525b" : "#cccccc";

  const groupPadding = Math.max(0.02, 0.25 - data.length * 0.006);
  const pointPadding = Math.max(0, 0.15 - data.length * 0.004);
  const month = new Date(); // or pass it as a prop
  const dynamicTitle = `My Timelogs – ${format(month, "MMM yyyy")}`;
  const baseOptions = useMemo((): Highcharts.Options => {
    return {
      chart: {
        type: "column",
        backgroundColor: "transparent",
        style: { fontFamily: "inherit" },
        spacing: [8, 4, 4, 4],
        height: "300px",
      },
      title: {
        text: dynamicTitle,
        align: "left",
        style: { fontSize: "16px", color: textColor },
      },
      xAxis: {
        categories: data.map((d) => d.date),
        crosshair: true,
        labels: {
          style: {
            fontSize: data.length > 16 ? "10px" : "12px",
            color: textColor,
          },
          rotation: data.length > 20 ? -60 : data.length > 14 ? -45 : 0,
        },
        lineColor: borderColor,
        tickColor: borderColor,
      },
      yAxis: {
        min: 0,
        max: 10,
        title: { text: "Hours", style: { color: textColor } },
        gridLineColor: gridColor,
        labels: { style: { color: textColor } },
      },
      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "top",
        itemStyle: {
          whiteSpace: "nowrap",
          fontSize: "12px",
          color: textColor,
        },
        itemHoverStyle: {
          color: darkMode ? "#ffffff" : "#000000",
        },
      },
      tooltip: {
        shared: true,
        backgroundColor: darkMode ? "#18181b" : "#f9f9f9",
        borderColor: gridColor,
        style: { color: textColor },
      },
      plotOptions: {
        column: {
          stacking: "normal",
          groupPadding,
          pointPadding,
          borderWidth: 0,
        },
      },
      series: [
        {
          name: "Before Break",
          data: data.map((d) => d.beforeBreak),
          color: "#4caf50",
          type: "column",
          borderRadius: 10,
        },
        {
          name: "Break",
          data: data.map((d) => d.break),
          color: "#f59e0b",
          type: "column",
          borderRadius: 10,
        },
        {
          name: "After Break",
          data: data.map((d) => d.afterBreak),
          color: "#15803d",
          type: "column",
          borderRadius: 10,
        },
        {
          name: "Missing",
          data: data.map((d) => d.missing),
          color: "#ef4444",
          type: "column",
          borderRadius: 10,
        },
      ],
    };
  }, [
    darkMode,
    data,
    textColor,
    gridColor,
    borderColor,
    groupPadding,
    pointPadding,
    dynamicTitle,
  ]);

  // Update chart when dark mode changes
  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (chart) {
      chart.update(baseOptions as Highcharts.Options, true, true);
    }
  }, [darkMode, data, baseOptions]);

  return (
    <section className="text-black dark:text-white w-full">
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={baseOptions}
        containerProps={{ style: { width: "100%", height: "100%" } }}
      />
    </section>
  );
}
