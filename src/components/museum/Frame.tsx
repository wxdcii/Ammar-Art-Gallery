import React, { useState, useRef, useContext, forwardRef } from "react";
import { useTexture, Text, useCursor, useFont } from "@react-three/drei";
import * as THREE from "three";
import { ImageMetadata } from "../../types/museum";
import { ZoomContext } from "../../contexts/ZoomContext";

interface FrameProps {
  position: [number, number, number];
  rotation: [number, number, number];
  image: ImageMetadata;
  index: number;
  showPlaque?: boolean;
  onFrameClick?: (index: number) => void;
}

useFont.preload("/fonts/Inter_28pt-SemiBold.ttf");

const Frame = forwardRef<THREE.Mesh, FrameProps>(
  (
    { position, rotation, image, index, showPlaque = true, onFrameClick },
    ref
  ) => {
    const [hovered, setHovered] = useState(false);

    const [error, setError] = useState(false);
    const internalRef = useRef<THREE.Mesh>(null);

    const { zoomedFrameId } = useContext(ZoomContext);
    const isZoomed = zoomedFrameId === index;

    useCursor(hovered);

    const texture = useTexture(image.url);

    React.useEffect(() => {
      const handleError = () => {
        console.warn(`Failed to load image ${index + 1}`);
        setError(true);
      };

      if (texture && texture.source) {
        texture.source.data.addEventListener("error", handleError);
        return () => {
          texture.source.data.removeEventListener("error", handleError);
        };
      }
    }, [texture, index]);

    if (texture) {
      texture.minFilter = THREE.LinearFilter;
    }

    const aspectRatio =
      texture && texture.image ? texture.image.width / texture.image.height : 1;
    const width = 1.5;
    const height = width / aspectRatio;
    const plaqueWidth = 0.62;
    const plaqueTextWidth = plaqueWidth - 0.13;
    const plaqueTextLeft = -plaqueTextWidth / 2;
    const plaqueOffsetX = width / 2 + 0.12 + plaqueWidth / 2;

    React.useEffect(() => {
      if (!internalRef.current) return;

      if (typeof ref === "function") {
        ref(internalRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<THREE.Mesh>).current =
          internalRef.current;
      }
    }, [ref]);

    const handleClick = () => {
      if (onFrameClick) {
        onFrameClick(index);
      }
    };

    return (
      <group position={position} rotation={rotation}>
        <mesh
          ref={internalRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + 0.1, height + 0.1, 0.1]} />
          <meshStandardMaterial color="#222" />

          <mesh position={[0, 0, 0.051]}>
            <planeGeometry args={[width, height]} />
            {error ? (
              <meshBasicMaterial color="#444">
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={0.1}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  font="Times New Roman"
                >
                  Image not available
                </Text>
              </meshBasicMaterial>
            ) : (
              <meshBasicMaterial map={texture} toneMapped={true} color="#ddd" />
            )}
          </mesh>
        </mesh>

        {showPlaque && (
          <group position={[plaqueOffsetX, 0, 0.07]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[plaqueWidth, 1.02, 0.045]} />
              <meshStandardMaterial
                color="#101114"
                metalness={0.55}
                roughness={0.58}
              />
            </mesh>

            <mesh position={[0, 0, 0.032]} receiveShadow>
              <boxGeometry args={[plaqueWidth - 0.03, 0.99, 0.012]} />
              <meshStandardMaterial
                color="#e9e7e1"
                metalness={0}
                roughness={0.92}
              />
            </mesh>

            <Text
              position={[plaqueTextLeft, 0.42, 0.043]}
              fontSize={0.034}
              color="#8f252b"
              anchorX="left"
              anchorY="top"
              maxWidth={plaqueTextWidth}
              textAlign="left"
              lineHeight={1.15}
              font="/fonts/Inter_28pt-SemiBold.ttf"
            >
              {image.title}
            </Text>

            <Text
              position={[plaqueTextLeft, 0.31, 0.043]}
              fontSize={0.021}
              color="#292929"
              anchorX="left"
              anchorY="top"
              maxWidth={plaqueTextWidth}
              textAlign="left"
              lineHeight={1.2}
              font="/fonts/Inter_28pt-SemiBold.ttf"
            >
              {image.medium}
            </Text>

            <mesh position={[0, 0.24, 0.043]}>
              <planeGeometry args={[plaqueTextWidth, 0.004]} />
              <meshBasicMaterial color="#b9b6b0" />
            </mesh>

            <Text
              position={[plaqueTextLeft, 0.19, 0.043]}
              fontSize={0.024}
              color="#333333"
              anchorX="left"
              anchorY="top"
              maxWidth={plaqueTextWidth}
              textAlign="left"
              lineHeight={1.35}
              font="/fonts/Inter_28pt-SemiBold.ttf"
            >
              {image.plaqueDescription}
            </Text>
          </group>
        )}

      </group>
    );
  }
);

export default Frame;
