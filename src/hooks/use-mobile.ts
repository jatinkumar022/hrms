"use client";

import * as React from "react";

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    // This check ensures the code only runs on the client
    if (typeof window !== "undefined") {
      const result = window.matchMedia(query);
      setValue(result.matches); // Set initial value
      result.addEventListener("change", onChange);
      return () => result.removeEventListener("change", onChange);
    }
  }, [query]);

  return value;
}

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
