import React, { useRef } from "react";
import * as THREE from "three";
import Frame from "./museum/Frame";
import Room from "./museum/Room";
import { calculateFramePositions } from "../utils/framePositioning";
import { defaultRoomDimensions } from "../config/roomConfig";
import { ImageMetadata } from "../types/museum";
import { BakeShadows, Text } from "@react-three/drei";
import { ZoomProvider } from "../contexts/ZoomContext";
import { CameraManager } from "./museum/CameraManager";
import SpotlightGroup from "./museum/SpotlightGroup";
import { useTour } from "../contexts/TourContext";
import CeilingLight from "./museum/CeilingLight";
import { drawingImages } from "../config/imagesConfig";

interface MuseumProps {
  images: ImageMetadata[];
}

const images = drawingImages;

const SharedArtworkPlaque: React.FC<{ artworks: ImageMetadata[] }> = ({
  artworks,
}) => (
  <group position={[0, 2, 0.17]}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.94, 1.72, 0.045]} />
      <meshStandardMaterial
        color="#101114"
        metalness={0.55}
        roughness={0.58}
      />
    </mesh>
    <mesh position={[0, 0, 0.032]} receiveShadow>
      <boxGeometry args={[0.91, 1.69, 0.012]} />
      <meshStandardMaterial color="#e9e7e1" roughness={0.92} />
    </mesh>

    {artworks.slice(0, 2).map((artwork, index) => {
      const top = index === 0 ? 0.75 : -0.02;
      const textX = -0.39;
      const textWidth = 0.78;

      return (
        <React.Fragment key={`${artwork.title}-${artwork.date}`}>
          {index === 1 && (
            <mesh position={[0, 0.02, 0.043]}>
              <planeGeometry args={[textWidth, 0.004]} />
              <meshBasicMaterial color="#b9b6b0" />
            </mesh>
          )}
          <Text
            position={[textX, top, 0.043]}
            fontSize={0.029}
            color="#8f252b"
            anchorX="left"
            anchorY="top"
            maxWidth={textWidth}
            lineHeight={1.15}
            font="/fonts/Inter_28pt-SemiBold.ttf"
          >
            {artwork.title}
          </Text>
          <Text
            position={[textX, top - 0.08, 0.043]}
            fontSize={0.018}
            color="#292929"
            anchorX="left"
            anchorY="top"
            maxWidth={textWidth}
            lineHeight={1.2}
            font="/fonts/Inter_28pt-SemiBold.ttf"
          >
            {artwork.medium}
          </Text>
          <Text
            position={[textX, top - 0.14, 0.043]}
            fontSize={0.022}
            color="#333333"
            anchorX="left"
            anchorY="top"
            maxWidth={textWidth}
            lineHeight={1.25}
            font="/fonts/Inter_28pt-SemiBold.ttf"
          >
            {artwork.plaqueDescription}
          </Text>
        </React.Fragment>
      );
    })}
  </group>
);

const Museum: React.FC<MuseumProps> = () => {
  const { currentFrameIndex, setCurrentFrameIndex, startTour, quitTour } =
    useTour();
  const frameRefs = useRef<(THREE.Mesh | null)[]>([]);

  React.useEffect(() => {
    frameRefs.current = frameRefs.current.slice(0, images.length);
    while (frameRefs.current.length < images.length) {
      frameRefs.current.push(null);
    }
  }, []);

  const { framePositions, frameRotations } = calculateFramePositions(
    defaultRoomDimensions,
    images.length
  );
  const centralWallArtworks = images.filter(
    (_, index) => Math.abs(frameRotations[index][1]) < 0.001
  );

  return (
    <ZoomProvider>
      <CameraManager
        onFrameChange={setCurrentFrameIndex}
        currentFrameIndex={currentFrameIndex}
        frameRefs={frameRefs as React.MutableRefObject<THREE.Mesh[]>}
        imagesCount={images.length}
      />
      <BakeShadows />

      <group>
        <Room
          width={defaultRoomDimensions.width}
          length={defaultRoomDimensions.length}
          height={defaultRoomDimensions.height}
          wallTiltAngle={defaultRoomDimensions.wallTiltAngle}
        />

        {images.map((image, index) => {
          if (index < framePositions.length) {
            return (
              <React.Fragment key={index}>
                <Frame
                  position={framePositions[index]}
                  rotation={frameRotations[index]}
                  image={image}
                  index={index}
                  showPlaque={
                    Math.abs(frameRotations[index][1]) >= 0.001
                  }
                  ref={(el) => {
                    frameRefs.current[index] = el;
                  }}
                  onFrameClick={(idx) => {
                    if (setCurrentFrameIndex) {
                      if (idx === currentFrameIndex) {
                        quitTour();
                        setCurrentFrameIndex(-1);
                      } else {
                        startTour();
                        setCurrentFrameIndex(idx);
                      }
                    }
                  }}
                />
              </React.Fragment>
            );
          }
          return null;
        })}

        {centralWallArtworks.length > 1 && (
          <SharedArtworkPlaque artworks={centralWallArtworks} />
        )}

        <ambientLight intensity={0.3} />
        <directionalLight intensity={2.5} position={[0, -100, 5]} />

        <SpotlightGroup roomHeight={defaultRoomDimensions.height} />
        <CeilingLight position={[-0.75, 3.95, 5]} />
        <CeilingLight position={[0.75, 3.95, 5]} />

        <CeilingLight position={[-0.95, 3.95, 8]} />
        <CeilingLight position={[0.95, 3.95, 8]} />

        <CeilingLight position={[-1.15, 3.95, 11]} />
        <CeilingLight position={[1.15, 3.95, 11]} />
      </group>
    </ZoomProvider>
  );
};

export default Museum;
