import "./App.css";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function App() {
  const mountRef = useRef(null);
  const [model, setModel] = useState(null);
  const [textures, setTextures] = useState({});
  const [mouseDown, setMouseDown] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.physicallyCorrectLights = true; // Покращення освітлення

    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const loader = new FBXLoader();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.dampingFactor = 0.15;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;

    loader.load(
      "Vorota2.fbx",
      (object) => {
        setModel(object);
        scene.add(object);
        object.position.y -= 100; // Опустіть об'єкт

        // Calculate the bounding box of the model
        const box = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        camera.position.set(center.x, center.y + 299, center.z + 300);
        camera.lookAt(center);

        object.traverse((child) => {
          if (child.isMesh && child.name === "Ворота") {
            child.material = new THREE.MeshStandardMaterial({
              map: textures.texture2,
              side: THREE.DoubleSide,
            });
          }
        });

        controls.update();
        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();

        setIsModelLoaded(true); // Встановлюємо стан, що модель завантажена
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(hemisphereLight);

    const loadTextures = () => {
      const texture1 = "./text1.jpg";
      const texture2 = "./text2.jpg";
      const texture3 = "./text3.jpg";
      const texture4 = "./text4.jpg";
      const texture5 = "./text5.jpg";

      setTextures({ texture1, texture2, texture3, texture4, texture5 });
    };

    loadTextures();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Force a resize event after initial render
    setTimeout(() => {
      handleResize();
    }, 100);

    // Mouse event handlers
    const onMouseDown = (event) => {
      setMouseDown(true);
      setLastMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    const onMouseMove = (event) => {
      if (!mouseDown || !model) return;

      const deltaX = event.clientX - lastMousePosition.x;
      const deltaY = event.clientY - lastMousePosition.y;

      const movementScale = 0.01; // Adjust this scale to control the speed of movement

      model.position.x += deltaX * movementScale;
      model.position.y -= deltaY * movementScale;

      setLastMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    const onMouseUp = () => {
      setMouseDown(false);
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      if (!mountRef.current) return;
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (isModelLoaded) {
      changeTexture("texture2"); // Викликаємо changeTexture після завантаження моделі
    }
  }, [isModelLoaded]);

  const changeTexture = (texture) => {
    console.log("Changing texture to", texture);
    if (model) {
      const textureLoader = new THREE.TextureLoader();
      const newTexture = textureLoader.load(textures[texture]);
      model.traverse((child) => {
        if (child.isMesh && child.name === "Ворота") {
          child.material.map = newTexture;
          child.material.needsUpdate = true;
        }
      });
    }
  };

  return (
    <div className="w-full h-full bg-white flex">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col p-4 space-y-2">
        <button
          onClick={() => changeTexture("texture1")}
          className="w-12 h-12 border border-gray-300"
          style={{
            backgroundImage: `url(${textures.texture1})`,
            backgroundSize: "cover",
          }}
        ></button>
        <button
          onClick={() => changeTexture("texture2")}
          className="w-12 h-12 border border-gray-300"
          style={{
            backgroundImage: `url(${textures.texture2})`,
            backgroundSize: "cover",
          }}
        ></button>
        <button
          onClick={() => changeTexture("texture3")}
          className="w-12 h-12 border border-gray-300"
          style={{
            backgroundImage: `url(${textures.texture3})`,
            backgroundSize: "cover",
          }}
        ></button>
        <button
          onClick={() => changeTexture("texture4")}
          className="w-12 h-12 border border-gray-300"
          style={{
            backgroundImage: `url(${textures.texture4})`,
            backgroundSize: "cover",
          }}
        ></button>
        <button
          onClick={() => changeTexture("texture5")}
          className="w-12 h-12 border border-gray-300"
          style={{
            backgroundImage: `url(${textures.texture5})`,
            backgroundSize: "cover",
          }}
        ></button>
      </div>
      <div
        ref={mountRef}
        className="w-full h-full bg-transparent flex items-center justify-center"
      ></div>
    </div>
  );
}

export default App;
