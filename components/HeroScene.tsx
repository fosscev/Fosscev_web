"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows, useMatcapTexture, useIntersect } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";

// ─── lerp helper ──────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;




function useObjectBehavior(
    basePos: [number, number, number],
    baseRot: [number, number, number],
    opts: { floatSpeed?: number; tiltStrength?: number; floatAmp?: number; visibleRef?: React.MutableRefObject<boolean> } = {}
) {
    const { floatSpeed = 0.4, tiltStrength = 0.35, floatAmp = 0.08, visibleRef } = opts;
    const groupRef = useRef<THREE.Group>(null!);
    const origin = useRef(new THREE.Vector3(...basePos));
    const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if (visibleRef && !visibleRef.current) return;
        const g = groupRef.current;
        if (!g) return;

        // Apply a random phase offset so objects don't sync up perfectly
        const t = state.clock.elapsedTime * floatSpeed + randomOffset;

        // Complex randomized floating orbits using layered sine/cosine waves
        const tx = origin.current.x + Math.sin(t * 0.8) * (floatAmp * 2.5) + Math.cos(t * 0.4) * floatAmp;
        const ty = origin.current.y + Math.cos(t * 0.6) * (floatAmp * 2.5) + Math.sin(t * 0.3) * floatAmp;
        g.position.x = lerp(g.position.x, tx, 0.05);
        g.position.y = lerp(g.position.y, ty, 0.05);

        // Smooth randomized 3D rotation
        const targetRX = baseRot[0] + Math.sin(t * 0.4) * tiltStrength;
        const targetRY = baseRot[1] + Math.cos(t * 0.5) * tiltStrength;
        const targetRZ = baseRot[2] + Math.sin(t * 0.3) * (tiltStrength * 0.5);

        g.rotation.x = lerp(g.rotation.x, targetRX, 0.05);
        g.rotation.y = lerp(g.rotation.y, targetRY, 0.05);
        g.rotation.z = lerp(g.rotation.z, targetRZ, 0.05);
    });

    return groupRef;
}

// ─── Generic GLTF Model ───────────────────────────────────────────────────────
type GLTFModelProps = {
    path: string;
    initialPos: [number, number, number];
    baseRot?: [number, number, number];
    scale?: number | [number, number, number];
    floatSpeed?: number;
    tiltStrength?: number;
    floatAmp?: number;
};

function GLTFModel({
    path, initialPos, baseRot = [0, 0, 0],
    scale = 1, floatSpeed, tiltStrength, floatAmp,
}: GLTFModelProps) {
    const { scene } = useGLTF(path);
    const [matcap] = useMatcapTexture("1B1B1B_999999_575757_747474", 1024);

    const cloned = useMemo(() => scene.clone(true), [scene]);

    useEffect(() => {
        if (!matcap) return;
        cloned.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;

            const swapMaterial = (mat: THREE.Material) => {
                if (mat.type === "MeshStandardMaterial" || mat.type === "MeshPhysicalMaterial" || mat.type === "MeshLambertMaterial") {
                    const originalMat = mat as THREE.MeshStandardMaterial;
                    const m = new THREE.MeshMatcapMaterial();
                    m.name = originalMat.name;
                    if (originalMat.color) m.color.copy(originalMat.color);
                    if (originalMat.map) m.map = originalMat.map;

                    if (m.name === "android_green") {
                        m.color.set("#3DDC84");
                    }
                    m.color.multiplyScalar(0.55);
                    m.matcap = matcap;
                    m.needsUpdate = true;
                    return m;
                }
                return mat;
            };

            if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map((mat) => mat ? swapMaterial(mat) : mat);
            } else if (mesh.material) {
                mesh.material = swapMaterial(mesh.material);
            }
            mesh.castShadow = false;
            mesh.receiveShadow = false;
        });
    }, [cloned, matcap]);

    const isVisible = useRef(false);
    const intersectRef = useIntersect((visible) => (isVisible.current = visible));

    const groupRef = useObjectBehavior(initialPos, baseRot, { floatSpeed, tiltStrength, floatAmp, visibleRef: isVisible });

    return (
        <group
            ref={(node: THREE.Group | null) => {
                if (node) {
                    groupRef.current = node;
                    intersectRef.current = node;
                }
            }}
            position={initialPos}
            rotation={baseRot}
            scale={typeof scale === "number" ? [scale, scale, scale] : scale}
        >
            <primitive object={cloned} />
        </group>
    );
}

// Preload all
useGLTF.preload("/tux/tux.glb");
useGLTF.preload("/gaming_laptop/gaming_laptop.glb");
useGLTF.preload("/notebook/notebook.glb");
useGLTF.preload("/coffee_cup/coffee_cup.glb");
useGLTF.preload("/server_racking_system/server_racking_system.glb");
useGLTF.preload("/android_logo/android_logo.glb");
useGLTF.preload("/pen/pen.glb");

// ─── Particle field ───────────────────────────────────────────────────────────
function Particles() {
    const ptsRef = useRef<THREE.Points>(null!);
    const isVisible = useRef(false);
    const intersectRef = useIntersect((visible) => (isVisible.current = visible));
    const count = 160;

    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const palette = [
            new THREE.Color("#00e676"), new THREE.Color("#00b4d8"),
            new THREE.Color("#7c3aed"), new THREE.Color("#334155"),
        ];
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 28;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 6;
            const c = palette[Math.floor(Math.random() * palette.length)];
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        return g;
    }, []);

    useFrame((state) => {
        if (!isVisible.current || !ptsRef.current) return;
        const t = state.clock.elapsedTime;

        // Randomly drift and rotate the entire background cloud
        ptsRef.current.rotation.y = t * 0.02;
        ptsRef.current.rotation.x = Math.sin(t * 0.05) * 0.2;
        ptsRef.current.rotation.z = Math.cos(t * 0.04) * 0.1;

        ptsRef.current.position.x = Math.sin(t * 0.08) * 1.5;
        ptsRef.current.position.y = Math.cos(t * 0.06) * 1.5;
    });

    return (
        <points
            ref={(node: THREE.Points | null) => {
                if (node) {
                    ptsRef.current = node;
                    intersectRef.current = node;
                }
            }}
            geometry={geo}
        >
            <pointsMaterial size={0.04} vertexColors transparent opacity={0.45} sizeAttenuation />
        </points>
    );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene() {
    const { width } = useThree((state) => state.size);
    const isMobile = width < 768;

    return (
        <>
            <Particles />

            {/* Tux — center, DoF focal point */}
            <GLTFModel
                path="/tux/tux.glb"
                initialPos={[0, isMobile ? -0.2 : -0.5, 1.5]}
                baseRot={[0, 0, 0]}
                scale={isMobile ? 0.015 : 0.018}
                floatSpeed={0.45}
                tiltStrength={0.6}
                floatAmp={0.06}
            />

            {/* Gaming Laptop — left, facing viewer mostly */}
            <GLTFModel
                path="/gaming_laptop/gaming_laptop.glb"
                initialPos={isMobile ? [-1.6, 1.6, -0.8] : [-4.0, 0.8, 0]}
                baseRot={[0.2, 0.1, 0]}
                scale={isMobile ? 0.35 : 0.6}
                floatSpeed={0.38}
                tiltStrength={0.5}
                floatAmp={0.09}
            />

            {/* Notebook — right, facing user */}
            <GLTFModel
                path="/notebook/notebook.glb"
                initialPos={isMobile ? [1.6, 1.8, -0.5] : [3.8, 0.9, -0.2]}
                baseRot={[Math.PI * 0.06, 0.3, 0]}
                scale={isMobile ? 0.005 : 0.009}
                floatSpeed={0.35}
                tiltStrength={0.55}
                floatAmp={0.08}
            />

            {/* Coffee Cup — bottom-left */}
            <GLTFModel
                path="/coffee_cup/coffee_cup.glb"
                initialPos={isMobile ? [-1.4, -2.2, 0.2] : [-3.5, -2.0, 0.5]}
                baseRot={[0.1, 0.3, 0]}
                scale={isMobile ? 1.4 : 2.7}
                floatSpeed={0.52}
                tiltStrength={0.7}
                floatAmp={0.07}
            />

            {/* Server Rack — right-back, far for DoF blur */}
            <GLTFModel
                path="/server_racking_system/server_racking_system.glb"
                initialPos={isMobile ? [1.6, -1.0, -4.5] : [4.0, -1.6, -3.8]}
                baseRot={[0, -0.4, 0]}
                scale={isMobile ? 0.7 : 1.0}
                floatSpeed={0.28}
                tiltStrength={0.4}
                floatAmp={0.05}
            />

            {/* Android Logo — top-left */}
            <GLTFModel
                path="/android_logo/android_logo.glb"
                initialPos={isMobile ? [-1.0, 2.9, -1.2] : [-2.5, 2.6, -0.8]}
                baseRot={[0.1, 0.3, 0]}
                scale={isMobile ? 0.28 : 0.55}
                floatSpeed={0.48}
                tiltStrength={0.8}
                floatAmp={0.12}
            />

            {/* Pen — bottom-right */}
            <GLTFModel
                path="/pen/pen.glb"
                initialPos={isMobile ? [1.4, -2.4, 0.5] : [2.6, -1.8, 0.8]}
                baseRot={[0.6, -0.5, 0.2]}
                scale={isMobile ? 0.16 : 0.20}
                floatSpeed={0.35}
                tiltStrength={0.55}
                floatAmp={0.07}
            />

            {/* DoF — Tux is at z=1.5, camera at z=9, so focusDistance ≈ 1−(1.5/9) normalised */}
            <EffectComposer>
                <DepthOfField
                    focusDistance={0.015}
                    focalLength={0.15}
                    bokehScale={1.5}
                    height={700}
                />
            </EffectComposer>

            <ContactShadows
                position={[0, -1, 0]}
                resolution={512}
                blur={2}
                opacity={0.6}
                scale={10}
            />
        </>
    );
}

// ─── Canvas Export ────────────────────────────────────────────────────────────
export default function HeroScene({
    onReady,
    isInView = true,
}: {
    onReady?: () => void;
    isInView?: boolean;
}) {
    return (
        <Canvas
            frameloop={isInView ? "always" : "demand"}
            camera={{ position: [0, 0, 9], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.15,
            }}
            style={{ background: "transparent" }}
            onCreated={() => onReady?.()}
        >
            <Scene />
        </Canvas>
    );
}
