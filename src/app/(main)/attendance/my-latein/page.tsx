"use client";
import dynamic from "next/dynamic";
import FullPageLoader from "@/components/loaders/FullPageLoader";

const MyLateInPage = dynamic(() => import("./MyLateInPage"), {
  loading: () => <FullPageLoader show />,
});

export default function Page() {
  return <MyLateInPage />;
}
