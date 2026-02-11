import { useState, useEffect } from "react";
import { useApplication } from "@pixi/react";

export function useScreenSize() {
  const { app } = useApplication();
  const [size, setSize] = useState({
    width: app.screen.width,
    height: app.screen.height,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({ width: app.screen.width, height: app.screen.height });
    };

    app.renderer.on("resize", onResize);
    return () => {
      app.renderer.off("resize", onResize);
    };
  }, [app]);

  return size;
}
