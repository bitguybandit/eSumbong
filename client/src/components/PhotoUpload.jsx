import { useEffect, useRef, useState } from 'react';
import api from '../lib/api';

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4';
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Drag-and-drop / tap-to-upload photo input with live thumbnail preview
 * and a remove control. Uploads through POST /api/uploads and reports the
 * final URL back via `onChange`.
 */
export default function PhotoUpload({ onChange, onName, bucket = 'complaint-photos', showCamera = false }) {
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const blobRef = useRef('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  // Release the last object URL when the component unmounts.
  useEffect(() => () => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
  }, []);

  function clearBlob() {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = '';
    }
  }

  async function uploadFile(file) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('File is too large. Max size is 10MB.');
      return;
    }
    setError('');
    setUploading(true);
    onName?.(file.name);

    // Keep the preview on the local object URL. It shows instantly and never
    // depends on the stored file being reachable — swapping the <img> to the
    // remote URL is what left a broken "Photo preview" on mobile.
    clearBlob();
    const blobUrl = URL.createObjectURL(file);
    blobRef.current = blobUrl;
    setPreview(blobUrl);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', bucket);
      const res = await api.post('/uploads', fd);
      // Only the form needs the stored URL; the preview keeps the blob.
      onChange?.(res.data.url);
    } catch (err) {
      setError(err.message);
      clearBlob();
      setPreview('');
      onChange?.(null);
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    clearBlob();
    setPreview('');
    setError('');
    onChange?.(null);
    onName?.(null);
    if (inputRef.current) inputRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    uploadFile(e.dataTransfer?.files?.[0]);
  }

  return (
    <div>
      {preview ? (
        <div className="relative">
          {uploading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
              <span className="text-sm font-medium text-blue-700">Uploading…</span>
            </div>
          )}
          <img
            src={preview}
            alt="Photo preview"
            onError={() => setError('This photo could not be displayed. Try a JPG or PNG instead.')}
            className="max-h-64 w-full rounded-2xl border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={remove}
            aria-label="Remove photo"
            title="Remove photo"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-sm text-white shadow transition hover:bg-slate-900 active:scale-95"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
            dragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">
            📷
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {showCamera && (
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-95"
              >
                📸 Take Photo
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                showCamera
                  ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              🖼️ Upload Photo
            </button>
          </div>

          <span className="text-xs text-slate-400">Drag &amp; drop a file · max 10MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          uploadFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {showCamera && (
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            uploadFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
