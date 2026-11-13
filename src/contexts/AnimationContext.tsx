import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

type ScreenState = "title" | "scene";

interface AnimationContextType {
  currentScreen: ScreenState;
  assetsReady: boolean;
  sceneOpacity: number;
  sceneBlur: number;
  setCurrentScreen: (screen: ScreenState) => void;
  handleTitleFading: () => void;
  handleTitleComplete: () => void;
  handleAssetsLoaded: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
);

export const AnimationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("title");
  const [assetsReady, setAssetsReady] = useState(false);
  const [sceneOpacity, setSceneOpacity] = useState(0);
  const [sceneBlur, setSceneBlur] = useState(8);

  useEffect(() => {
    if (currentScreen === "title") {
      setSceneOpacity(1);
      setSceneBlur(8);
    } else if (currentScreen === "scene") {
      setSceneOpacity(1);
      setSceneBlur(0);
    }
  }, [currentScreen]);

  const handleTitleFading = useCallback(() => {
    setSceneBlur(0);
  }, []);

  const handleTitleComplete = useCallback(() => {
    setCurrentScreen("scene");
  }, []);

  const handleAssetsLoaded = useCallback(() => {
    setAssetsReady(true);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        currentScreen,
        assetsReady,
        sceneOpacity,
        sceneBlur,
        setCurrentScreen,
        handleTitleFading,
        handleTitleComplete,
        handleAssetsLoaded,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};
