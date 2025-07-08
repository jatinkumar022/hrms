"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { fetchMe } from "@/redux/slices/loginSlice";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return null;
}
