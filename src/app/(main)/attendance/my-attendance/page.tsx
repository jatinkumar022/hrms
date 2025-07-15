"use client";
import dynamic from "next/dynamic";
import FullPageLoader from "@/components/loaders/FullPageLoader";

const MyAttendancePage = dynamic(() => import("./MyAttendancePage"), {
  ssr: false,
  loading: () => <FullPageLoader show />,
});

export default function Page() {
  return <MyAttendancePage />;
}
