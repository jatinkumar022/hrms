"use client";
import dynamic from "next/dynamic";
import FullPageLoader from "@/components/loaders/FullPageLoader";

const MyLateInPage = dynamic(() => import("./MyLateInPage"), {
  ssr: false,
  loading: () => <FullPageLoader />,
});

export default function page() {
  return <MyLateInPage />;
}
