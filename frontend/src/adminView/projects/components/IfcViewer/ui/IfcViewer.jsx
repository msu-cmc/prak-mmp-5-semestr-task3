import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import "./IfcViewer.css";

let IfcViewerAPIPromise = null;

const IfcViewer = ({ file, url = null, highlightIds = [], dark = false }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const modelIdRef = useRef(null);
    const lastMeshRef = useRef(null);
    const [viewerReady, setViewerReady] = useState(false);

    const wasmPath =
        (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_IFC_WASM_PATH) ||
        (typeof process !== "undefined" && process.env && process.env.REACT_APP_IFC_WASM_PATH) ||
        "/ifc/";

    const fitToObject = useCallback(async (viewer, obj) => {
        const cam = viewer.context.getCamera();
        const controls = viewer.context?.ifcCamera?.cameraControls;
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z || 0.001);
        const fov = (cam.fov ?? 45) * (Math.PI / 180);
        const dist = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;
        const pos = center.clone().add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(dist));
        if (controls?.setLookAt) {
            controls.setLookAt(pos.x, pos.y, pos.z, center.x, center.y, center.z, true);
        } else {
            cam.position.copy(pos);
            cam.lookAt(center);
            cam.updateProjectionMatrix();
        }
    }, []);

    const clearIfcs = useCallback((viewer) => {
        try { viewer.IFC.loader.ifcManager.close(0); } catch {}
        const scene = viewer.context.getScene();
        const toRemove = [];
        scene.traverse((child) => {
            if (child?.userData?.ifcjsModelId != null) toRemove.push(child);
        });
        toRemove.forEach((m) => m.parent?.remove(m));
    }, []);

    const updateViewport = useCallback(() => {
        const v = viewerRef.current;
        const el = containerRef.current;
        if (!v || !el) return;
        const r = v.context.getRenderer();
        const cam = v.context.getCamera();
        const rect = el.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (r.getPixelRatio() !== dpr) r.setPixelRatio(dpr);
        r.setSize(w, h, false);
        const aspect = w / h;
        if (cam.aspect !== aspect) {
            cam.aspect = aspect;
            cam.updateProjectionMatrix();
        }
        r.render(v.context.getScene(), cam);
    }, []);

    const loadFile = useCallback(async (f) => {
        const v = viewerRef.current;
        if (!v || !f) return;
        clearIfcs(v);
        let model;
        try {
            model = await v.IFC.loadIfc(f, false);
        } catch (error) {
            console.error("IfcViewer loadFile error:", error);
            return;
        }
        if (!model?.mesh) return;
        modelIdRef.current = model.modelID;
        lastMeshRef.current = model.mesh;
        updateViewport();
        await fitToObject(v, model.mesh);
    }, [clearIfcs, fitToObject, updateViewport]);

    const loadUrl = useCallback(async (u) => {
        const v = viewerRef.current;
        if (!v || !u) return;
        clearIfcs(v);
        let model;
        try {
            model = await v.IFC.loadIfcUrl(u, false);
        } catch (error) {
            console.error("IfcViewer loadUrl error:", error);
            return;
        }
        if (!model?.mesh) return;
        modelIdRef.current = model.modelID;
        lastMeshRef.current = model.mesh;
        updateViewport();
        await fitToObject(v, model.mesh);
    }, [clearIfcs, fitToObject, updateViewport]);

    const refit = useCallback(() => {
        const v = viewerRef.current;
        const mesh = lastMeshRef.current;
        if (v && mesh) fitToObject(v, mesh);
    }, [fitToObject]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (!IfcViewerAPIPromise) {
                    IfcViewerAPIPromise = import("web-ifc-viewer")
                        .then(m => m.IfcViewerAPI);
                }
                const IfcViewerAPI = await IfcViewerAPIPromise;
                if (cancelled) return;

                const v = new IfcViewerAPI({
                    container: containerRef.current,
                    backgroundColor: new THREE.Color(dark ? 0x232323 : 0xffffff)
                });

                v.context.renderer.postProduction.active = false;
                const renderer = v.context.getRenderer();
                if (typeof renderer.outputEncoding !== "undefined") {
                    renderer.outputEncoding = THREE.sRGBEncoding;
                }
                renderer.toneMapping = THREE.NoToneMapping;
                renderer.toneMappingExposure = 1;
                renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

                const im = v.IFC.loader.ifcManager;
                im.setWasmPath(wasmPath);
                im.useWebWorkers(false);

                viewerRef.current = v;
                updateViewport();
                setViewerReady(true);

                const onWinResize = () => updateViewport();
                window.addEventListener("resize", onWinResize);
                const cleanup = () => {
                    window.removeEventListener("resize", onWinResize);
                    v?.dispose();
                };
                viewerRef.current.__cleanup = cleanup;
            } catch (error) {
                console.error("IfcViewer initialization error:", error);
            }
        })();
        return () => {
            cancelled = true;
            const v = viewerRef.current;
            if (v && v.__cleanup) v.__cleanup();
            viewerRef.current = null;
        };
    }, [updateViewport, wasmPath]);

    useEffect(() => {
        if (!viewerReady || !viewerRef.current) return;
        if (file) {
            loadFile(file);
        } else if (url) {
            loadUrl(url);
        }
    }, [file, url, loadFile, loadUrl, viewerReady]);

    useEffect(() => {
        const v = viewerRef.current;
        if (!v || !viewerReady) return;
        const color = new THREE.Color(dark ? 0x414141 : 0xffffff);
        const r = v.context.getRenderer();
        v.context.getScene().background = color;
        if (r.setClearColor) r.setClearColor(color, 1);
        updateViewport();
    }, [dark, updateViewport, viewerReady]);

    useEffect(() => {
        const v = viewerRef.current;
        const mid = modelIdRef.current;
        if (!v || mid == null) return;
        try {
            v.IFC.selector.unpickIfcItems();
            if (highlightIds?.length) {
                v.IFC.selector.highlightIfcItemsByID(mid, highlightIds.map(Number));
            }
        } catch {}
    }, [highlightIds]);

    useEffect(() => {
        if (!containerRef.current) return;
        let rafId = 0;
        let refitTimer = 0;
        let lastW = 0;
        let lastH = 0;
        const ro = new ResizeObserver((entries) => {
            const el = entries[0]?.target;
            if (!el) return;
            const { width, height } = el.getBoundingClientRect();
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                updateViewport();
            });
            const dw = Math.abs(width - lastW);
            const dh = Math.abs(height - lastH);
            lastW = width;
            lastH = height;
            clearTimeout(refitTimer);
            if (dw > 16 || dh > 16) {
                refitTimer = setTimeout(() => {
                    refit();
                }, 180);
            }
        });
        ro.observe(containerRef.current);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            clearTimeout(refitTimer);
            ro.disconnect();
        };
    }, [updateViewport, refit]);

    return (
        <div
            ref={containerRef}
            className="ifc-viewer"
            onDoubleClick={refit}
        />
    );
};

export default IfcViewer;