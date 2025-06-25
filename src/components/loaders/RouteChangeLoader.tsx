"use client";

import { useAppSelector } from "@/lib/hooks";
import FullPageLoader from "./FullPageLoader";

export default function RouteChangeLoader() {
  const loading = useAppSelector((state) => state.routeLoader.loading);
  return loading ? <FullPageLoader /> : null;
}
