import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Compass, Eye, Layers, RotateCw, Navigation, Building2, Phone, Clock, Key, Sparkles, Move3d, ShieldCheck } from 'lucide-react';
import { Branch } from '../types';
import { INITIAL_BRANCHES } from '../data/seedData';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface MapCameraControllerProps {
  center: { lat: number; lng: number };
  zoom: number;
  tilt: number;
  heading: number;
  mapTypeId: string;
}

// Inner helper component to apply camera perspective changes on map instance
const MapCameraController: React.FC<MapCameraControllerProps> = ({ center, zoom, tilt, heading, mapTypeId }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.moveCamera({
      center,
      zoom,
      tilt,
      heading
    });
    if (mapTypeId) {
      map.setMapTypeId(mapTypeId);
    }
  }, [map, center, zoom, tilt, heading, mapTypeId]);

  return null;
};

export const GoogleMap3DView: React.FC = () => {
  const branches = INITIAL_BRANCHES;
  const [selectedBranch, setSelectedBranch] = useState<Branch>(branches[0]);
  
  // 3D Camera State
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: branches[0]?.lat || 31.2401598,
    lng: branches[0]?.lng || 29.9635953
  });
  const [zoom, setZoom] = useState<number>(17.5);
  const [tilt, setTilt] = useState<number>(62); // 3D tilt perspective angle
  const [heading, setHeading] = useState<number>(35); // 3D rotation angle
  const [mapTypeId, setMapTypeId] = useState<string>('hybrid'); // Satellite Hybrid or Roadmap
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(branches[0].id);

  // 3D Flyover Orbit animation effect
  useEffect(() => {
    if (!isOrbiting) return;
    const interval = setInterval(() => {
      setHeading((prev) => (prev + 1.5) % 360);
    }, 80);
    return () => clearInterval(interval);
  }, [isOrbiting]);

  const handleSelectBranch = (b: Branch) => {
    setSelectedBranch(b);
    setActiveInfoWindowId(b.id);
    if (b.lat && b.lng) {
      setCenter({ lat: b.lat, lng: b.lng });
      setZoom(17.5);
      setTilt(62);
      setHeading(40);
    }
  };

  const handleTiltMax = () => {
    setTilt(67.5); // Max 3D tilt in Google Maps JS API
    setZoom(18);
  };

  const handleTiltReset = () => {
    setTilt(0); // Standard 2D top-down view
  };

  const handleRotateLeft = () => setHeading((h) => (h - 30 + 360) % 360);
  const handleRotateRight = () => setHeading((h) => (h + 30) % 360);

  return (
    <div className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-6 dir-rtl text-right">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-black text-[10px] flex items-center gap-1">
              <Move3d className="w-3.5 h-3.5" /> 3D VECTOR CAMERA VIEW
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px]">
              طريقة العرض ثلاثية الأبعاد الحية 🏢
            </span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-500" />
            استكشاف مقرات وفروع SmartTech برؤية 3D التفاعلية
          </h2>
          <p className="text-xs text-slate-400">
            يمكنك تدوير الخريطة زاويّاً، الإمالة بـ 67.5 درجة لمشاهدة المبان ثلاثية الأبعاد، والتحليق الطائر حول الفروع.
          </p>
        </div>

        {/* Quick Branch Switcher Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {branches.map((b) => {
            const isSelected = selectedBranch.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => handleSelectBranch(b)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-red-400'}`} />
                <span>{b.nameAr.split('—')[1] || b.nameAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Map Container & Custom Control Deck */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner group">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={center}
              defaultZoom={zoom}
              defaultTilt={tilt}
              defaultHeading={heading}
              mapId="DEMO_MAP_ID"
              mapTypeId={mapTypeId}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <MapCameraController
                center={center}
                zoom={zoom}
                tilt={tilt}
                heading={heading}
                mapTypeId={mapTypeId}
              />

              {/* Advanced Markers for All Branches */}
              {branches.map((b) => {
                if (!b.lat || !b.lng) return null;
                const isSel = selectedBranch.id === b.id;
                return (
                  <React.Fragment key={b.id}>
                    <AdvancedMarker
                      position={{ lat: b.lat, lng: b.lng }}
                      onClick={() => handleSelectBranch(b)}
                      title={b.nameAr}
                    >
                      <Pin
                        background={isSel ? '#DC2626' : '#2563EB'}
                        glyphColor="#FFFFFF"
                        borderColor="#FFFFFF"
                        scale={isSel ? 1.4 : 1.1}
                      />
                    </AdvancedMarker>

                    {activeInfoWindowId === b.id && (
                      <InfoWindow
                        position={{ lat: b.lat, lng: b.lng }}
                        onCloseClick={() => setActiveInfoWindowId(null)}
                      >
                        <div className="p-3 text-slate-900 dir-rtl text-right max-w-xs space-y-2">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black inline-block">
                            مقر سمارتك Mapped 3D
                          </span>
                          <h4 className="font-black text-sm text-slate-900 leading-snug">{b.nameAr}</h4>
                          <p className="text-xs text-slate-600">{b.addressAr}</p>
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {b.phone}
                            </span>
                            <a
                              href={b.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg transition inline-flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3" /> الاتجاهات
                            </a>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </React.Fragment>
                );
              })}
            </Map>
          </APIProvider>
        ) : (
          /* Live Embedded Google Map Iframe + Info Bar */
          <div className="relative w-full h-full bg-slate-900 overflow-hidden">
            <iframe
              title="SmartTech Alexandria Zizinia Branch Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${selectedBranch.lat || 31.2401598},${selectedBranch.lng || 29.9635953}&t=m&z=17&ie=UTF8&iwloc=&output=embed`}
            />

            <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl backdrop-blur-md text-xs font-bold text-white shadow-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>خريطة التحديد المباشر — المقر الرئيسي بزيزينيا الإسكندرية</span>
            </div>
          </div>
        )}

        {/* Floating 3D Control Deck Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-slate-950/85 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl">
          <button
            onClick={handleTiltMax}
            title="منظور 3D مائل (Tilt 67.5°)"
            className={`p-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer ${
              tilt > 45 ? 'bg-red-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Move3d className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">إمالة 3D (67°)</span>
          </button>

          <button
            onClick={handleTiltReset}
            title="عرض مسطح 2D (Tilt 0°)"
            className={`p-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer ${
              tilt === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">مسطح 2D</span>
          </button>

          <div className="h-px bg-slate-800 my-1" />

          <button
            onClick={() => setIsOrbiting(!isOrbiting)}
            title="طيران ودوران 360 درجة طائر"
            className={`p-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isOrbiting ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isOrbiting ? 'animate-spin' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">{isOrbiting ? 'إيقاف التحليق' : 'تحليق 360°'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRotateLeft}
              title="تدوير يساراً"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer flex-1"
            >
              <Compass className="w-4 h-4 -rotate-45" />
            </button>
            <button
              onClick={handleRotateRight}
              title="تدوير يميناً"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer flex-1"
            >
              <Compass className="w-4 h-4 rotate-45" />
            </button>
          </div>

          <div className="h-px bg-slate-800 my-1" />

          <button
            onClick={() => setMapTypeId((prev) => (prev === 'hybrid' ? 'roadmap' : 'hybrid'))}
            title="تبديل القمر الصناعي والخريطة المتجهة"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{mapTypeId === 'hybrid' ? 'خريطة متجهة' : 'قمر صناعي 3D'}</span>
          </button>
        </div>

        {/* Bottom Floating Branch Quick Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-20 max-w-sm bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl dir-rtl text-right space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black">
              الموقع المحدد حالياً
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              إمالة: {tilt}° | زاوية: {heading}°
            </span>
          </div>

          <h3 className="text-sm font-black text-white">{selectedBranch.nameAr}</h3>

          <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
            <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{selectedBranch.addressAr}</span>
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{selectedBranch.workingHoursAr}</span>
            </div>
            <a
              href={selectedBranch.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              <Navigation className="w-3.5 h-3.5" /> الاتجاهات المباشرة
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
