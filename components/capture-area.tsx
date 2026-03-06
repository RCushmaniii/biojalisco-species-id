'use client';

import { useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ViewfinderIcon, CameraIcon, UploadIcon, SearchIcon } from './icons';

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

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as string;
        setImageData(data);
        stopCamera();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [stopCamera]
  );

  const handleIdentify = () => {
    if (imageData) {
      onIdentify(imageData);
    }
  };

  const hasImage = !!imageData;

  return (
    <div className="capture-area">
      <div className={`preview-box ${hasImage ? 'has-image' : ''}`}>
        {!hasImage && !cameraActive && (
          <div className="placeholder">
            <ViewfinderIcon className="icon icon-lg" />
            <p>
              {t(
                'Any plant, animal, insect, or fungus\n\u2014 wild or domestic',
                'Cualquier planta, animal, insecto u hongo\n\u2014 silvestre o domestico'
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}
