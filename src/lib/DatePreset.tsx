import dayjs from "dayjs";
import { DatePresetProps, DateRangePreset } from "@/lib/types";

const getLastMonthRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
  const startOfCurrentMonth = dayjs().startOf("month");
  const startOfLastMonth = startOfCurrentMonth.subtract(1, "month");
  const endOfLastMonth = startOfCurrentMonth.subtract(1, "day");

  return [startOfLastMonth, endOfLastMonth] as [dayjs.Dayjs, dayjs.Dayjs];
};

const getLast12MonthsRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
  const startOfCurrentMonth = dayjs().startOf("month");
  const startOfLast12Months = startOfCurrentMonth
    .subtract(12, "month")
    .startOf("month");
  const endOfLast12Months = dayjs().endOf("month");

  return [startOfLast12Months, endOfLast12Months] as [dayjs.Dayjs, dayjs.Dayjs];
};

const getLastYearRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
  const startOfLastYear = dayjs().subtract(1, "year").startOf("year");
  const endOfLastYear = dayjs().subtract(1, "year").endOf("year");

  return [startOfLastYear, endOfLastYear] as [dayjs.Dayjs, dayjs.Dayjs];
};
const rangePresets: DateRangePreset[] = [
  {
    label: "Today",
    value: {
      from: dayjs().startOf("day").toDate(),
      to: dayjs().endOf("day").toDate(),
    },
  },
  {
    label: "Yesterday",
    value: {
      from: dayjs().subtract(1, "day").startOf("day").toDate(),
      to: dayjs().subtract(1, "day").endOf("day").toDate(),
    },
  },
  {
    label: "Last 7 Days",
    value: {
      from: dayjs().subtract(7, "day").startOf("day").toDate(),
      to: dayjs().endOf("day").toDate(),
    },
  },
  {
    label: "Last 14 Days",
    value: {
      from: dayjs().subtract(14, "day").startOf("day").toDate(),
      to: dayjs().endOf("day").toDate(),
    },
  },
  {
    label: "Last 30 Days",
    value: {
      from: dayjs().subtract(30, "day").startOf("day").toDate(),
      to: dayjs().endOf("day").toDate(),
    },
  },
  {
    label: "Last 90 Days",
    value: {
      from: dayjs().subtract(90, "day").startOf("day").toDate(),
      to: dayjs().endOf("day").toDate(),
    },
  },
  {
    label: "Last 365 Days",
    value: {
      from: dayjs().subtract(365, "day").startOf("day").toDate(),
      to: dayjs().endOf("day").toDate(),
    },
  },
  {
    label: "Last Month",
    value: (() => {
      const [from, to] = getLastMonthRange();
      return { from: from.toDate(), to: to.toDate() };
    })(),
  },
  {
    label: "Last 12 Months",
    value: (() => {
      const [from, to] = getLast12MonthsRange();
      return { from: from.toDate(), to: to.toDate() };
    })(),
  },
  {
    label: "Last Year",
    value: (() => {
      const [from, to] = getLastYearRange();
      return { from: from.toDate(), to: to.toDate() };
    })(),
  },
];

const DatePreset: React.FC<DatePresetProps> = ({
  isActive,
  handlePresetClick,
}) => {
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
