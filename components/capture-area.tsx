'use client';

import { useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ViewfinderIcon, CameraIcon, UploadIcon, SearchIcon } from './icons';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.heic,.heif';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface CaptureAreaProps {
  onIdentify: (imageData: string) => void;
  isLoading: boolean;
}

export function CaptureArea({ onIdentify, isLoading }: CaptureAreaProps) {
  const { t } = useLanguage();
  const [imageData, setImageData] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const handleCamera = useCallback(() => {
    // On mobile, use file input with capture
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      cameraInputRef.current?.click();
      return;
    }

    // If camera is active, snap a photo
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')!.drawImage(video, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.85);
      setImageData(data);
      setFileError(null);
      stopCamera();
      return;
    }

    // Start camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setImageData(null);
      })
      .catch(() => {
        cameraInputRef.current?.click();
      });
  }, [cameraActive, stopCamera]);

  const handleIdentify = () => {
    if (imageData) {
      onIdentify(imageData);
    }
  };

  const [fileError, setFileError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setFileError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError(t(
          'Unsupported file type. Please use JPEG, PNG, or WebP images.',
          'Tipo de archivo no soportado. Usa imagenes JPEG, PNG o WebP.'
        ));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError(t(
          'Image too large (max 20MB). Try a smaller image or reduce the resolution.',
          'Imagen demasiado grande (max 20MB). Intenta una imagen mas pequeña o reduce la resolucion.'
        ));
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as string;
        setImageData(data);
        stopCamera();
      };
      reader.readAsDataURL(file);
    },
    [stopCamera, t]
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const hasImage = !!imageData;

  return (
    <div className="capture-area">
      <div
        className={`preview-box ${hasImage ? 'has-image' : ''} ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!hasImage && !cameraActive) fileInputRef.current?.click();
        }}
        style={{ cursor: !hasImage && !cameraActive ? 'pointer' : undefined }}
      >
        {!hasImage && !cameraActive && (
          <div className="placeholder">
            <ViewfinderIcon className="icon icon-lg" />
            <p>
              {t(
                'Drag & drop a photo here, or click to upload\nMammals, birds, reptiles, amphibians \u2014 wild or domestic',
                'Arrastra una foto aqui, o haz clic para subir\nMamiferos, aves, reptiles, anfibios \u2014 silvestres o domesticos'
              )}
            </p>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={previewRef}
          src={imageData || ''}
          alt="Preview"
          className={hasImage ? 'active' : ''}
        />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={cameraActive ? 'active' : ''}
        />
      </div>

      <div className="actions">
        <button className="btn" onClick={handleCamera}>
          <CameraIcon />
          {cameraActive ? t('Snap', 'Capturar') : t('Camera', 'Camara')}
        </button>
        <button className="btn" onClick={() => fileInputRef.current?.click()}>
          <UploadIcon />
          {t('Upload', 'Subir')}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleIdentify}
          disabled={!hasImage || isLoading}
        >
          <SearchIcon />
          {t('Identify', 'Identificar')}
        </button>
      </div>

      {fileError && (
        <div className="capture-error">
          <p>{fileError}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}
