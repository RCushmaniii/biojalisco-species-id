'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ViewfinderIcon, CameraIcon, UploadIcon, SearchIcon, MapPinIcon, CrosshairIcon } from './icons';
import { extractExif, stripExif, type ExifMetadata } from '@/lib/exif';
import type { GpsSource } from '@/lib/types';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.heic,.heif';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface IdentifyPayload {
  imageData: string;
  exifLatitude: number | null;
  exifLongitude: number | null;
  userLatitude: number | null;
  userLongitude: number | null;
  userLocationName: string | null;
  gpsSource: GpsSource;
  environmentNotes: string | null;
  dateTaken: string | null;
  cameraMake: string | null;
  cameraModel: string | null;
}

interface CaptureAreaProps {
  onIdentify: (payload: IdentifyPayload) => void;
  isLoading: boolean;
}

interface GeocodeSuggestion {
  latitude: number;
  longitude: number;
  displayName: string;
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
      setExifData(null);
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

  const [exifData, setExifData] = useState<ExifMetadata | null>(null);

  // Location search state
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GeocodeSuggestion | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Environment notes
  const [environmentNotes, setEnvironmentNotes] = useState('');

  // Show location search when image has no EXIF GPS
  useEffect(() => {
    if (imageData && exifData && exifData.latitude == null && exifData.longitude == null) {
      setShowLocationSearch(true);
    } else if (imageData && exifData && exifData.latitude != null) {
      setShowLocationSearch(false);
      setSelectedLocation(null);
    }
  }, [imageData, exifData]);

  // Debounced forward geocode search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (locationQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(locationQuery.trim())}`);
        if (res.ok) {
          const data: GeocodeSuggestion[] = await res.json();
          setSuggestions(data);
        }
      } catch {
        // Geocode search failed — not fatal
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [locationQuery]);

  const handleSelectLocation = useCallback((suggestion: GeocodeSuggestion) => {
    setSelectedLocation(suggestion);
    setSuggestions([]);
    setLocationQuery('');
  }, []);

  const handleClearLocation = useCallback(() => {
    setSelectedLocation(null);
    setLocationQuery('');
    setSuggestions([]);
  }, []);

  const handleIdentify = () => {
    if (imageData) {
      const hasExifGps = exifData?.latitude != null && exifData?.longitude != null;
      const hasUserLocation = selectedLocation != null;

      let gpsSource: GpsSource = null;
      if (hasExifGps) gpsSource = 'exif';
      else if (hasUserLocation) gpsSource = 'user';
      // 'browser' is determined by the identify page when it falls back to browser geolocation

      onIdentify({
        imageData,
        exifLatitude: exifData?.latitude ?? null,
        exifLongitude: exifData?.longitude ?? null,
        userLatitude: selectedLocation?.latitude ?? null,
        userLongitude: selectedLocation?.longitude ?? null,
        userLocationName: selectedLocation?.displayName ?? null,
        gpsSource,
        environmentNotes: environmentNotes.trim() || null,
        dateTaken: exifData?.dateTaken ?? null,
        cameraMake: exifData?.cameraMake ?? null,
        cameraModel: exifData?.cameraModel ?? null,
      });
    }
  };

  const [fileError, setFileError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setFileError(null);
      setExifData(null);
      setSelectedLocation(null);
      setLocationQuery('');
      setSuggestions([]);
      setEnvironmentNotes('');

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

      // Extract EXIF metadata (GPS, camera, date) before stripping
      const exif = await extractExif(file);
      setExifData(exif);

      // Read the file, then strip EXIF via canvas re-render for privacy
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const rawData = ev.target?.result as string;
        try {
          const cleanData = await stripExif(rawData);
          setImageData(cleanData);
        } catch {
          // Fallback: use raw data if stripping fails
          setImageData(rawData);
        }
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

      {/* Location search — shown when image lacks EXIF GPS */}
      {hasImage && showLocationSearch && !selectedLocation && (
        <div className="location-search">
          <div className="location-search-header">
            <MapPinIcon className="icon" />
            <span>
              {t(
                'No GPS found in photo. Where was this taken?',
                'No se encontro GPS en la foto. ¿Donde fue tomada?'
              )}
            </span>
          </div>
          <div className="location-search-input-wrap">
            <input
              type="text"
              className="location-search-input"
              placeholder={t('Search for a location...', 'Buscar una ubicacion...')}
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              autoComplete="off"
              aria-label={t('Search for a location', 'Buscar una ubicacion')}
            />
            {isSearching && <span className="location-search-spinner" />}
          </div>
          {suggestions.length > 0 && (
            <ul className="location-suggestions">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    className="location-suggestion-btn"
                    onClick={() => handleSelectLocation(s)}
                  >
                    <MapPinIcon className="icon icon-sm" />
                    <span>{s.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="location-search-hint">
            {t(
              'You can also identify without location, but results may be less accurate.',
              'Tambien puedes identificar sin ubicacion, pero los resultados pueden ser menos precisos.'
            )}
          </p>
        </div>
      )}

      {/* Selected user location badge */}
      {hasImage && selectedLocation && (
        <div className="location-selected">
          <CrosshairIcon className="icon icon-sm" />
          <span className="location-selected-name">{selectedLocation.displayName}</span>
          <button className="location-selected-clear" onClick={handleClearLocation}>
            {t('Change', 'Cambiar')}
          </button>
        </div>
      )}

      {/* EXIF GPS detected badge */}
      {hasImage && exifData?.latitude != null && (
        <div className="location-detected">
          <MapPinIcon className="icon icon-sm" />
          <span>
            {t('GPS from photo metadata', 'GPS de metadatos de foto')}
            {' \u2014 '}
            {exifData.latitude.toFixed(4)}, {exifData.longitude!.toFixed(4)}
          </span>
        </div>
      )}

      {/* Environment notes — optional habitat context */}
      {hasImage && (
        <div className="environment-notes">
          <textarea
            className="environment-notes-input"
            placeholder={t(
              'Describe the environment (optional): vegetation type, habitat, elevation zone, weather...',
              'Describe el entorno (opcional): tipo de vegetacion, habitat, zona de elevacion, clima...'
            )}
            value={environmentNotes}
            onChange={(e) => setEnvironmentNotes(e.target.value)}
            rows={2}
            maxLength={300}
            aria-label={t('Environment description', 'Descripcion del entorno')}
          />
        </div>
      )}

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
