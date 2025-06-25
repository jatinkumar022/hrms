// components/custom/RouteEventsListener.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { startLoading, stopLoading } from "@/redux/slices/routeLoaderSlice";

export default function RouteEventsListener() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleStart = () => dispatch(startLoading());
    const handleEnd = () => dispatch(stopLoading());

    // @ts-ignore - because `events` isn't typed in App Router yet
    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleEnd);
    router.events?.on("routeChangeError", handleEnd);

    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleEnd);
      router.events?.off("routeChangeError", handleEnd);
    };
  }, [router, dispatch]);

  return null;
}
