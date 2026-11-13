import React, { useEffect, useState } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDetectGPU } from "@react-three/drei";
import { useTour } from "../../contexts/TourContext";
import { drawingImages } from "../../config/imagesConfig";

const TourControls: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { isMobile: isMobileGpu } = useDetectGPU();
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  const [isMeaningExpanded, setIsMeaningExpanded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateScreenSize = () => setIsNarrowScreen(mediaQuery.matches);

    updateScreenSize();
    mediaQuery.addEventListener("change", updateScreenSize);
    return () => mediaQuery.removeEventListener("change", updateScreenSize);
  }, []);

  const isMobile = isMobileGpu || isNarrowScreen;

  const {
    isTourStarted,
    currentFrameIndex,
    totalFrames,
    startTour,
    nextFrame,
    previousFrame,
    quitTour,
  } = useTour();

  const currentArtwork = drawingImages[currentFrameIndex];

  useEffect(() => {
    setIsMeaningExpanded(false);
  }, [currentFrameIndex]);

  // Keyboard controls management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTourStarted) {
        // If tour hasn't started, space or enter to start
        if (event.key === " " || event.key === "Enter") {
          startTour();
        }
      } else {
        // If tour is in progress
        switch (event.key) {
          case "ArrowRight":
          case "d":
            if (currentFrameIndex < totalFrames - 1) {
              nextFrame();
            }
            break;
          case "ArrowLeft":
          case "q":
          case "a":
            if (currentFrameIndex > 0) {
              previousFrame();
            }
            break;
          case "Escape":
            quitTour();
            break;
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isTourStarted,
    currentFrameIndex,
    totalFrames,
    startTour,
    nextFrame,
    previousFrame,
    quitTour,
  ]);

  if (!isTourStarted) {
    return (
      <div style={style}>
        <div className="fixed bottom-8 md:bottom-16 left-1/2 transform -translate-x-1/2 flex gap-4 items-center">
          <button
            onClick={startTour}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 md:px-10 md:py-4 rounded-full text-white flex items-center gap-3 shadow-lg"
          >
            <Play size={isMobile ? 18 : 24} />
            <span className="text-md md:text-lg font-semibold">
              Start the Tour
            </span>
          </button>
          <div className="text-white/60 text-xs mt-2 absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            {isMobile ? "Tap to start" : "Press Space or Enter to start"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={style}>
      {isMobile && currentArtwork && (
        <section
          aria-label={`${currentArtwork.title} meaning`}
          className="fixed bottom-[7.25rem] left-3 right-3 z-30 mx-auto max-w-xl rounded-xl border border-white/15 bg-black/85 p-3 text-white shadow-xl backdrop-blur-md"
          style={{
            maxHeight: isMeaningExpanded ? "30dvh" : undefined,
            overflowY: isMeaningExpanded ? "auto" : undefined,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold leading-5">
              {currentArtwork.title}
            </h2>
            <button
              type="button"
              onClick={() => setIsMeaningExpanded((expanded) => !expanded)}
              aria-expanded={isMeaningExpanded}
              aria-label={
                isMeaningExpanded
                  ? "Show less of the artwork meaning"
                  : "Read the full artwork meaning"
              }
              className="shrink-0 rounded px-1 text-xs font-medium text-white/75 underline underline-offset-2"
            >
              {isMeaningExpanded ? "Show less" : "Read full meaning"}
            </button>
          </div>
          <p
            className="mt-1 text-xs leading-relaxed text-white/85"
            style={
              isMeaningExpanded
                ? undefined
                : {
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                  }
            }
          >
            {currentArtwork.plaqueDescription}
          </p>
        </section>
      )}
      <div
        className="fixed bottom-8 md:bottom-16 left-1/2 transform -translate-x-1/2 flex gap-4 items-center bg-black/40 backdrop-blur-md p-2 rounded-full shadow-lg"
        style={{ width: "auto", height: "auto" }}
      >
        <button
          onClick={previousFrame}
          disabled={currentFrameIndex === 0}
          aria-label="Previous artwork"
          className={`bg-white/20 p-2 rounded-full text-white w-11 h-11 flex items-center justify-center
          ${
            currentFrameIndex === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-white/30"
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-white bg-white/10 px-4 py-1 rounded-full text-sm font-medium min-w-[80px] text-center">
          {currentFrameIndex + 1} / {totalFrames}
        </div>

        <button
          onClick={nextFrame}
          disabled={currentFrameIndex === totalFrames - 1}
          aria-label="Next artwork"
          className={`bg-white/20 p-2 rounded-full text-white w-11 h-11 flex items-center justify-center
          ${
            currentFrameIndex === totalFrames - 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-white/30"
          }`}
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={quitTour}
          className="bg-white/10 hover:bg-white/20 px-1 py-1 rounded-full text-white flex items-center gap-1 ml-2"
          title="Exit tour (Esc)"
          aria-label="Exit tour"
        >
          <X size={14} />
        </button>

        <div className="text-white/60 text-xs absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {isMobile ? "Tap or swipe to navigate " : "← Q/A → D | Esc to exit"}
        </div>
      </div>
    </div>
  );
};

export default TourControls;
