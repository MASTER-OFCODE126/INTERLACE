import React, { act, use, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { CameraControls, Environment, OrbitControls, useAnimations, useGLTF, useTexture } from '@react-three/drei'
import { normalMap, texture } from 'three/tsl'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const Dog = () => {

    gsap.registerPlugin(useGSAP);
    gsap.registerPlugin(ScrollTrigger);

    const model = useGLTF("/models/dog.drc.glb")

    useThree(({ camera, scene, gl }) => {
        // console.log(camera.position)
        camera.position.z = 0.55;
        gl.toneMapping = THREE.ReinhardToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
    })

    const { actions } = useAnimations(model.animations, model.scene);
    useEffect(() => {
        actions["Take 001"].play();
    }, [actions])
    // const textures = useTexture({
    //     normalMap:"/dog_normals.jpg",
    //     sampleMatCap:"/matcap/mat-2.png"
    // })

    // textures.normalMap.flipY = false;
    // textures.sampleMatCap.colorSpace = THREE.SRGBColorSpace;
    const [normalMap] = (useTexture(["/dog_normals.jpg"])).map(texture => {
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    });

    const [branchMap, branchNormalMap] = (useTexture(["/branches_diffuse.jpeg", "/branches_normals.jpeg"])).map(texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    });
    // Creating material2
    // Texture
    const [
        mat1,
        mat2,
        mat3,
        mat4,
        mat5,
        mat6,
        mat7,
        mat8,
        mat9,
        mat10,
        mat11,
        mat12,
        mat13,
        mat14,
        mat15,
        mat16,
        mat17,
        mat18,
        mat19,
        mat20
    ] = (useTexture([
        "/matcap/mat-1.png",
        "/matcap/mat-2.png",
        "/matcap/mat-3.png",
        "/matcap/mat-4.png",
        "/matcap/mat-5.png",
        "/matcap/mat-6.png",
        "/matcap/mat-7.png",
        "/matcap/mat-8.png",
        "/matcap/mat-9.png",
        "/matcap/mat-10.png",
        "/matcap/mat-11.png",
        "/matcap/mat-12.png",
        "/matcap/mat-13.png",
        "/matcap/mat-14.png",
        "/matcap/mat-15.png",
        "/matcap/mat-16.png",
        "/matcap/mat-17.png",
        "/matcap/mat-18.png",
        "/matcap/mat-19.png",
        "/matcap/mat-20.png"
    ])).map(texture => {
        // texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    });
    // Texure 
    const material = useRef({
        uMatcap1: { value: mat19 },
        uMatcap2: { value: mat2 },
        uProgress: { value: 1.0 }
    });
    const dogMaterial = new THREE.MeshMatcapMaterial({
        normalMap: normalMap,
        matcap: mat2
    })
    // Branch Material
    const branchMaterial = new THREE.MeshMatcapMaterial({
        normalMap: branchNormalMap,
        map: branchMap,
    })
    //Function
    function onBeforeCompile(shader) {
        shader.uniforms.uMatcapTexture1 = material.current.uMatcap1
        shader.uniforms.uMatcapTexture2 = material.current.uMatcap2
        shader.uniforms.uProgress = material.current.uProgress

        // Store reference to shader uniforms for GSAP animation

        shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `
        )

        shader.fragmentShader = shader.fragmentShader.replace(
            "vec4 matcapColor = texture2D( matcap, uv );",
            `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `
        )
    }
    dogMaterial.onBeforeCompile = onBeforeCompile;
    // Traverse
    model.scene.traverse((child) => {
        if (child.name.includes("DOG")) {
            child.material = dogMaterial;
        }
        else {
            child.material = branchMaterial;
        }
    })
    const dogModel = useRef(model);
    // GSAP
    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#section-1",
                endTrigger: "#section-3",
                start: "top top",
                end: "bottom bottom",
                markers: true,
                scrub: true
            }
        });
        tl
            .to(dogModel.current.scene.position, {
                z: "-=0.4",
                y: "+=0.1"

            })
            .to(dogModel.current.scene.rotation, {
                x: `+=${Math.PI / 12}`,
            })
            .to(dogModel.current.scene.rotation, {
                y: `-=${Math.PI}`,
            }, "third")
            .to(dogModel.current.scene.position, {
                x: "-=0.45",
                z: "+=0.3",
                y: "-=0.05"
            }, "third")

    }, [])
    useEffect(() => {

        // 1
        document.querySelector(`.contain-1`).addEventListener("mouseenter", () => {
            gsap.killTweensOf(material.current.uProgress);

            material.current.uProgress.value = 1; // IMPORTANT *7=&
            material.current.uMatcap1.value = mat19;

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        document.querySelector(`.contain-1`).addEventListener("mouseleave", () => {
            gsap.killTweensOf(material.current.uProgress);

            gsap.to(material.current.uProgress, {
                value: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        // 2  
        document.querySelector(`.contain-2`).addEventListener("mouseenter", () => {
            gsap.killTweensOf(material.current.uProgress);

            material.current.uProgress.value = 1; // IMPORTANT
            material.current.uMatcap1.value = mat8;

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        document.querySelector(`.contain-2`).addEventListener("mouseleave", () => {
            gsap.killTweensOf(material.current.uProgress);

            gsap.to(material.current.uProgress, {
                value: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        // 3
        document.querySelector(`.contain-3`).addEventListener("mouseenter", () => {
            gsap.killTweensOf(material.current.uProgress);

            material.current.uProgress.value = 1; // IMPORTANT
            material.current.uMatcap1.value = mat9;

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        document.querySelector(`.contain-3`).addEventListener("mouseleave", () => {
            gsap.killTweensOf(material.current.uProgress);

            gsap.to(material.current.uProgress, {
                value: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        // 4
      document.querySelector(`.contain-4`).addEventListener("mouseenter", () => {
            gsap.killTweensOf(material.current.uProgress);

            material.current.uProgress.value = 1; // IMPORTANT
            material.current.uMatcap1.value = mat14;

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        document.querySelector(`.contain-4`).addEventListener("mouseleave", () => {
            gsap.killTweensOf(material.current.uProgress);

            gsap.to(material.current.uProgress, {
                value: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        // 5
        document.querySelector(`.contain-5`).addEventListener("mouseenter", () => {
            gsap.killTweensOf(material.current.uProgress);
            material.current.uProgress.value = 1; // IMPORTANT
            material.current.uMatcap1.value = mat10;
            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        document.querySelector(`.contain-5`).addEventListener("mouseleave", () => {
            gsap.killTweensOf(material.current.uProgress);
            gsap.to(material.current.uProgress, {
                value: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        // 6
        document.querySelector(`.contain-6`).addEventListener("mouseenter", () => {
            gsap.killTweensOf(material.current.uProgress);
            material.current.uProgress.value = 1; // IMPORTANT
            material.current.uMatcap1.value = mat17;
            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        document.querySelector(`.contain-6`).addEventListener("mouseleave", () => {
            gsap.killTweensOf(material.current.uProgress);
            gsap.to(material.current.uProgress, {
                value: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        // 7
        document.querySelector(`.contain-7`).addEventListener("mouseenter", () => {
            gsap.killTweensOf(material.current.uProgress);
            material.current.uProgress.value = 1; // IMPORTANT
            material.current.uMatcap1.value = mat13;
            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        document.querySelector(`.contain-7`).addEventListener("mouseleave", () => {
            gsap.killTweensOf(material.current.uProgress);
            gsap.to(material.current.uProgress, {
                value: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });

    }, [])


    return (
        <>

            <directionalLight position={[0, 0, 2]} color={0xFFFFFF} intensity={3} />
            <directionalLight
                position={[-4, 2, -2]}
                intensity={1.5}
                color="#88aaff"
            />

            <directionalLight
                position={[-4, 2, -2]}
                intensity={1.5}
                color="#88aaff"
            />
            <primitive object={model.scene} position={[0.2, -0.55, 0]} rotation={[0, Math.PI / 4.5, 0]} />
            <ambientLight intensity={1.2} />
            <Environment preset="studio" intensity={1.2} />

            {/* <OrbitControls /> */}
        </>
    )
}

export default Dog
