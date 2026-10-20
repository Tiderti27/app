"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { readFileAsDataUrl } from "@/lib/image-crop";
import { PhotoCropModal } from "@/components/photo-crop-modal";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function PhotoManager({
  spotId,
  photos,
  onPhotosChange,
}: {
  spotId: string | null;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}) {
  const [queue, setQueue] = useState<File[]>([]);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    // Erst in ein eigenstaendiges Array kopieren, DANACH das Input-Feld
    // zuruecksetzen -- in Safari teilt sich event.target.value = "" sonst
    // dasselbe FileList-Objekt und leert es sofort mit, bevor wir die
    // Dateien ueberhaupt auslesen konnten.
    const list = Array.from(event.target.files ?? []);
    event.target.value = "";
    setStatus(`onChange ausgelöst, ${list.length} Datei(en) erkannt.`);

    if (list.length === 0 || !spotId) {
      setStatus((s) => `${s} Abgebrochen (spotId: ${spotId ?? "fehlt"}).`);
      return;
    }

    setError(null);
    const [first, ...rest] = list;
    setQueue(rest);
    setStatus((s) => `${s} Lese "${first.name}" (${first.type || "unbekannter Typ"})...`);
    try {
      const dataUrl = await readFileAsDataUrl(first);
      setStatus((s) => `${s} Gelesen, öffne Zuschneiden-Ansicht.`);
      setCropSrc(dataUrl);
    } catch (err) {
      setStatus((s) => `${s} Fehler beim Lesen.`);
      setError(err instanceof Error ? err.message : "Datei konnte nicht gelesen werden.");
    }
  }

  async function advanceQueue() {
    const [next, ...rest] = queue;
    setQueue(rest);
    if (!next) {
      setCropSrc(null);
      return;
    }
    try {
      setCropSrc(await readFileAsDataUrl(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Datei konnte nicht gelesen werden.");
      setCropSrc(null);
    }
  }

  async function handleCropConfirm(blob: Blob) {
    if (!spotId) return;
    setUploading(true);
    setError(null);
    setStatus(`Zuschneiden übernommen (${blob.size} Bytes), lade hoch...`);

    try {
      const path = `${spotId}/${generateId()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("spot-photos").upload(path, blob, {
        contentType: "image/jpeg",
      });
      if (uploadError) {
        setStatus((s) => `${s} Storage-Upload fehlgeschlagen.`);
        setError(uploadError.message);
      } else {
        setStatus((s) => `${s} Storage-Upload ok, speichere Foto-Liste...`);
        const { data } = supabase.storage.from("spot-photos").getPublicUrl(path);
        const updatedPhotos = [...photos, data.publicUrl];
        const { error: updateError } = await supabase.from("spots").update({ photos: updatedPhotos }).eq("id", spotId);
        if (updateError) {
          setStatus((s) => `${s} Speichern fehlgeschlagen.`);
          setError(updateError.message);
        } else {
          setStatus((s) => `${s} Fertig.`);
          onPhotosChange(updatedPhotos);
        }
      }
    } catch (err) {
      setStatus((s) => `${s} Unerwarteter Fehler.`);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler beim Hochladen.");
    } finally {
      setUploading(false);
      await advanceQueue();
    }
  }

  async function handleCropCancel() {
    await advanceQueue();
  }

  async function handleRemove(url: string) {
    if (!spotId) return;
    try {
      const updatedPhotos = photos.filter((p) => p !== url);
      const { error: updateError } = await supabase.from("spots").update({ photos: updatedPhotos }).eq("id", spotId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      onPhotosChange(updatedPhotos);
      const path = url.split("/spot-photos/")[1];
      if (path) await supabase.storage.from("spot-photos").remove([path]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler beim Entfernen.");
    }
  }

  async function handleReorder(url: string, direction: -1 | 1) {
    if (!spotId) return;
    const index = photos.indexOf(url);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = [...photos];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const { error: updateError } = await supabase.from("spots").update({ photos: reordered }).eq("id", spotId);
    if (updateError) setError(updateError.message);
    else onPhotosChange(reordered);
  }

  if (!spotId) {
    return <span className="form-section-hint">Speichere zuerst die Grunddaten, um Fotos hochzuladen.</span>;
  }

  return (
    <>
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((url, index) => (
            <div key={url} className="photo-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
              {index === 0 && <span className="photo-cover-badge">Cover</span>}
              <button type="button" onClick={() => handleRemove(url)} className="photo-thumb-remove">
                ×
              </button>
              <div className="photo-thumb-reorder">
                <button type="button" onClick={() => handleReorder(url, -1)} disabled={index === 0}>
                  ‹
                </button>
                <button type="button" onClick={() => handleReorder(url, 1)} disabled={index === photos.length - 1}>
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="photo-dropzone">
        <input type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={uploading} />
        <span className="photo-dropzone-title">{uploading ? "Lädt hoch..." : "Fotos hinzufügen"}</span>
        <span className="photo-dropzone-hint">
          Klicken und aus deinen Dateien/Galerie auswählen · erstes Foto ist das Cover in der App
        </span>
      </label>
      {error && <span className="error-text">{error}</span>}
      {status && (
        <span className="form-section-hint" style={{ fontFamily: "monospace" }}>
          Status: {status}
        </span>
      )}

      {cropSrc && <PhotoCropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />}
    </>
  );
}
