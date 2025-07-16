"use client";
import dynamic from "next/dynamic";
import FullPageLoader from "@/components/loaders/FullPageLoader";

const MyEarlyOutPage = dynamic(() => import("./MyEarlyOutPage"), {
  ssr: false,
  loading: () => <FullPageLoader />,
});

export default function page() {
  return <MyEarlyOutPage />;
}
