import dayjs from "dayjs";
const getLastMonthRange = () => {
  const startOfCurrentMonth = dayjs().startOf("month");
  const startOfLastMonth = startOfCurrentMonth.subtract(1, "month");
  const endOfLastMonth = startOfCurrentMonth.subtract(1, "day");

  return [startOfLastMonth, endOfLastMonth];
};

const getLast12MonthsRange = () => {
  const startOfCurrentMonth = dayjs().startOf("month");
  const startOfLast12Months = startOfCurrentMonth
    .subtract(12, "month")
    .startOf("month");
  const endOfLast12Months = dayjs().endOf("month");

  return [startOfLast12Months, endOfLast12Months];
};
const getLastYearRange = () => {
  const startOfLastYear = dayjs().subtract(1, "year").startOf("year");
  const endOfLastYear = dayjs().subtract(1, "year").endOf("year");

  return [startOfLastYear, endOfLastYear];
};
const rangePresets = [
  {
    label: "Today",
    value: [dayjs().startOf("day"), dayjs().endOf("day")],
  },
  {
    label: "Yesterday",
    value: [
      dayjs().subtract(1, "day").startOf("day"),
      dayjs().subtract(1, "day").endOf("day"),
    ],
  },
  {
    label: "Last 7 Days",
    value: [dayjs().add(-7, "d"), dayjs()],
  },
  {
    label: "Last 14 Days",
    value: [dayjs().add(-14, "d"), dayjs()],
  },
  {
    label: "Last 30 Days",
    value: [dayjs().add(-30, "d"), dayjs()],
  },
  {
    label: "Last 90 Days",
    value: [dayjs().add(-90, "d"), dayjs()],
  },
  {
    label: "Last 365 Days",
    value: [dayjs().add(-365, "d"), dayjs()],
  },
  {
    label: "Last Month",
    value: getLastMonthRange(),
  },
  {
    label: "Last 12 Months",
    value: getLast12MonthsRange(),
  },
  {
    label: "Last Year",
    value: getLastYearRange(),
  },
];

const DatePreset = ({ isActive, handlePresetClick }) => {
  return (
    <div className="ant-picker-presets">
      <ul>
        {rangePresets.map((preset) => (
          <li
            key={preset.label}
            className={
              preset.label === isActive ? "ant-picker-preset-active" : ""
            }
            onClick={() => handlePresetClick(preset)}
          >
            {preset.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DatePreset;
