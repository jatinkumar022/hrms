"use client";
import dynamic from "next/dynamic";
import FullPageLoader from "@/components/loaders/FullPageLoader";

const MyEarlyOutPage = dynamic(() => import("./MyEarlyOutPage"), {
  loading: () => <FullPageLoader show />,
});

export default function Page() {
  return <MyEarlyOutPage />;
}
