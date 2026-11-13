import React from "react";
import { Instagram } from "lucide-react";
import Controls from "./Controls";
import TourControls from "./TourControls";
import { useAnimation } from "../../contexts/AnimationContext";
import TitleScreen from "./TitleOverlay";

const UIElements: React.FC = () => {
  const {
    currentScreen,
    assetsReady,
    handleTitleFading,
    handleTitleComplete,
  } = useAnimation();

  return (
    <>
      {currentScreen === "title" && (
        <TitleScreen
          assetsReady={assetsReady}
          onFading={handleTitleFading}
          onComplete={handleTitleComplete}
        />
      )}

      {/* UI controls (visible only in scene mode) */}
      {currentScreen === "scene" && (
        <>
          <a
            className="absolute top-0 left-0 p-4 text-white flex items-center hover:scale-105 transition-all duration-300 z-40"
            href="https://www.instagram.com/ammaralhawamdehh/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              animation: "fadeIn 1s ease-out forwards",
            }}
          >
            <Instagram className="mr-2" />
            <h1 className="text-xl font-bold">Ammar Alhawamdeh</h1>
          </a>

          <Controls
            style={{
              animation: "fadeIn 1s ease-out forwards",
            }}
          />

          <TourControls
            style={{
              animation: "fadeIn 1s ease-out forwards",
            }}
          />
        </>
      )}
    </>
  );
};

export default UIElements;
