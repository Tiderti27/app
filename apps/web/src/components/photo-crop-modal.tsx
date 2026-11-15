"use client";

import { useCallback, useState } from "react";
import ReactCropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/image-crop";

// react-easy-crop wird im Monorepo an die Workspace-Root gehoben und loest
// dort gegen die React-19-Typen der Mobile-App auf (statt gegen die
// React-18-Typen von apps/web), was zu einem falschen JSX-Typfehler fuehrt.
// Laufzeit ist davon nicht betroffen -- nur der Typ wird hier entschaerft.
const Cropper = ReactCropper as unknown as (props: any) => JSX.Element;

export function PhotoCropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 14 }}>
        <span className="form-section-title">Foto zuschneiden</span>
        <div style={{ position: "relative", width: "100%", height: 280, background: "#000", borderRadius: 12 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={2 / 1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="button-primary" type="button" onClick={handleConfirm} disabled={processing} style={{ minWidth: 120 }}>
            {processing ? "..." : "Übernehmen"}
          </button>
          <button type="button" className="pill-button" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
