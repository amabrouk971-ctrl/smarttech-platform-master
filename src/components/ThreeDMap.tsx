import React, { useState, useEffect } from 'react';
import { getPaymentSettings } from '../services/bookingService';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Building2, Phone, Navigation, Move3d, RotateCw, Compass, Eye, Layers, ShieldCheck } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface CameraControllerProps {
  center: { lat: number; lng: number };
  zoom: number;
  tilt: number;
  heading: number;
  mapTypeId: string;
}

const CameraController: React.FC<CameraControllerProps> = ({ center, zoom, tilt, heading, mapTypeId }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.moveCamera({ center, zoom, tilt, heading });
    if (mapTypeId) {
      map.setMapTypeId(mapTypeId);
    }
  }, [map, center, zoom, tilt, heading, mapTypeId]);

  return null;
};

export interface ThreeDMapProps {
  centerLat?: number;
  centerLng?: number;
  zoomLevel?: number;
  titleAr?: string;
  phoneNumbers?: string[];
}

export const ThreeDMap: React.FC<ThreeDMapProps> = ({
  centerLat = 31.2401598,
  centerLng = 29.9635953,
  zoomLevel = 18,
  titleAr,
  phoneNumbers
}) => {
  const [center, setCenter] = useState({ lat: centerLat, lng: centerLng });
  const [zoom, setZoom] = useState(zoomLevel);
  const [tilt, setTilt] = useState(65); // 3D tilt perspective angle
  const [heading, setHeading] = useState(38); // 3D rotational camera heading
  const [mapTypeId, setMapTypeId] = useState('hybrid'); // 3D Satellite Hybrid view
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const [dynamicPhones, setDynamicPhones] = useState<string[]>(phoneNumbers || ['01024434357', '01227811948']);
  const [dynamicTitle, setDynamicTitle] = useState<string>(titleAr || 'سمارتك للتدريب المتطور — المقر الرئيسي والسنتر التدريبي المعملي');

  useEffect(() => {
    getPaymentSettings().then(s => {
      if (!phoneNumbers) {
        setDynamicPhones([s.vodafoneCashNumber, s.instapayNumber].filter(Boolean));
      }
      if (!titleAr && s.centerName) {
        setDynamicTitle(s.centerName);
      }
      if (s.latitude && s.longitude) {
        setCenter({ lat: s.latitude, lng: s.longitude });
      }
    }).catch(console.error);
  }, [phoneNumbers, titleAr]);

  // 360 degree 3D flyover rotation loop
  useEffect(() => {
    if (!isOrbiting) return;
    const timer = setInterval(() => {
      setHeading((h) => (h + 1.2) % 360);
    }, 70);
    return () => clearInterval(timer);
  }, [isOrbiting]);

  const handleTiltMax = () => {
    setTilt(67.5);
    setZoom(18.5);
  };

  const handleTiltReset = () => {
    setTilt(0);
  };

  return (
    <div className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 dir-rtl text-right">
      {/* Component Title & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-black text-[10px] flex items-center gap-1">
              <Move3d className="w-3.5 h-3.5 text-red-500" /> GOOGLE MAPS 3D ENGINE
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> المقر المعتمد رسمياً
            </span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-500" />
            {titleAr}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>هواتف التواصل المباشر: {phoneNumbers.join(' - ')}</span>
          </p>
        </div>

        {/* 3D Camera Preset Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTiltMax}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              tilt > 45 ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Move3d className="w-3.5 h-3.5" /> إمالة 3D (67.5°)
          </button>
          <button
            onClick={() => setIsOrbiting(!isOrbiting)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isOrbiting ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isOrbiting ? 'animate-spin' : ''}`} />
            {isOrbiting ? 'إيقاف الدوران' : 'دوران طائر 360°'}
          </button>
        </div>
      </div>

      {/* Main Google Maps 3D Viewport */}
      <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner">
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
              <CameraController
                center={center}
                zoom={zoom}
                tilt={tilt}
                heading={heading}
                mapTypeId={mapTypeId}
              />

              <AdvancedMarker position={center} onClick={() => setInfoOpen(true)}>
                <Pin background="#DC2626" glyphColor="#FFFFFF" borderColor="#FFFFFF" scale={1.4} />
              </AdvancedMarker>

              {infoOpen && (
                <InfoWindow position={center} onCloseClick={() => setInfoOpen(false)}>
                  <div className="p-3 text-slate-900 dir-rtl text-right max-w-xs space-y-2">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black inline-block">
                      SmartTech Center 3D Mapped
                    </span>
                    <h4 className="font-black text-sm text-slate-900 leading-snug">
                      SmartTech Training & Testing Center
                    </h4>
                    <p className="text-xs text-slate-600">
                      603 طريق الحرية، أبراج الخليج، برج (ب) أعلى البنك الأهلي، بجوار جامع يحيى، زيزينيا، الإسكندرية.
                    </p>
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {dynamicPhones.join(' - ')}
                      </div>
                      <a
                        href="https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B1%D8%AA%D9%83+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D8%A7%D9%84%D9%8AA%D8%AA%D8%B7%D9%88%D8%B1%E2%80%AD%E2%80%AD/@31.2401598,29.9635953,17z/data=!4m2!3m1!1s0x14f5c513a27e37ed:0xee5386b29ced202e"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg transition inline-flex items-center gap-1 w-full justify-center"
                      >
                        <Navigation className="w-3 h-3" /> فتح في Google Maps
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Interactive 3D Vector Visualizer fallback when API Key is pending */
          <div className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-4 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-700"
              style={{
                backgroundImage:
                  'radial-gradient(#3b82f6 1.5px, transparent 1.5px), radial-gradient(#ef4444 1.5px, #0f172a 1.5px)',
                backgroundSize: '30px 30px',
                transform: `perspective(600px) rotateX(${tilt}deg) rotateZ(${heading}deg) scale(1.3)`
              }}
            />

            <div className="relative z-10 max-w-md bg-slate-950/90 border-2 border-slate-700 p-6 rounded-3xl backdrop-blur-md shadow-2xl space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                <Move3d className="w-6 h-6 animate-pulse" />
              </div>

              <h4 className="text-base font-black text-white">SmartTech Training & Testing Center 3D</h4>
              <p className="text-xs text-slate-300">
                603 طريق الحرية، أبراج الخليج، برج (ب) أعلى البنك الأهلي، بجوار جامع يحيى، زيزينيا، الإسكندرية.
              </p>

              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                <span>هاتف: {dynamicPhones.join(' - ')}</span>
              </div>

              <a
                href="https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B1%D8%AA%D9%83+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D8%A7%D9%84%D9%8AA%D8%AA%D8%B7%D9%88%D8%B1%E2%80%AD%E2%80%AD/@31.2401598,29.9635953,17z/data=!4m2!3m1!1s0x14f5c513a27e37ed:0xee5386b29ced202e"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" /> العرض المباشر على خريطة Google
              </a>
            </div>
          </div>
        )}

        {/* 3D Map Overlay Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl">
          <button
            onClick={handleTiltMax}
            title="إمالة المنظور 3D"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
          >
            <Move3d className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={handleTiltReset}
            title="إعادة العرض الرأسي 2D"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={() => setHeading((h) => (h - 30 + 360) % 360)}
            title="تدوير الكاميرا يساراً"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 -rotate-45" />
          </button>
          <button
            onClick={() => setHeading((h) => (h + 30) % 360)}
            title="تدوير الكاميرا يميناً"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 rotate-45" />
          </button>
          <button
            onClick={() => setMapTypeId((t) => (t === 'hybrid' ? 'roadmap' : 'hybrid'))}
            title="تبديل القمر الصناعي"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
