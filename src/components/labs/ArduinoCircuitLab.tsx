import React, { useState } from 'react';
import {
  Zap,
  Play,
  RotateCcw,
  Cpu,
  Code2,
  CheckCircle2,
  Radio,
  Sliders,
  Tv,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ArduinoCircuitLabProps {
  onAwardXp?: (amount: number) => void;
}

interface CircuitComponent {
  id: string;
  nameAr: string;
  type:
    | 'arduino'
    | 'esp32'
    | 'led'
    | 'button'
    | 'buzzer'
    | 'servo'
    | 'ultrasonic'
    | 'ldr'
    | 'lcd'
    | 'relay'
    | 'potentiometer';
  pin: string;
  isActive?: boolean;
  value?: number;
}

export const ArduinoCircuitLab: React.FC<ArduinoCircuitLabProps> = ({ onAwardXp }) => {
  const componentCatalog: { type: CircuitComponent['type']; nameAr: string; defaultPin: string; icon: string }[] = [
    { type: 'arduino', nameAr: 'Arduino Uno Board', defaultPin: 'USB Power', icon: '💻' },
    { type: 'esp32', nameAr: 'ESP32 WiFi IoT Board', defaultPin: 'USB Power', icon: '📡' },
    { type: 'led', nameAr: 'Red LED Light', defaultPin: 'D13', icon: '💡' },
    { type: 'ultrasonic', nameAr: 'Ultrasonic Sensor (HC-SR04)', defaultPin: 'D2 / D3', icon: '🦇' },
    { type: 'servo', nameAr: 'Servo Motor (SG90)', defaultPin: 'D9', icon: '⚙️' },
    { type: 'buzzer', nameAr: 'Piezo Buzzer', defaultPin: 'D8', icon: '🔔' },
    { type: 'ldr', nameAr: 'LDR Light Sensor', defaultPin: 'A0', icon: '☀️' },
    { type: 'lcd', nameAr: 'LCD Display 16x2', defaultPin: 'I2C A4/A5', icon: '📟' },
    { type: 'relay', nameAr: '5V Relay Module', defaultPin: 'D7', icon: '🔌' },
    { type: 'potentiometer', nameAr: 'Potentiometer Knob', defaultPin: 'A1', icon: '🎛️' }
  ];

  const [placedComponents, setPlacedComponents] = useState<CircuitComponent[]>([
    { id: 'c1', nameAr: 'Arduino Uno Board', type: 'arduino', pin: 'Power 5V/GND' },
    { id: 'c2', nameAr: 'Ultrasonic Sensor', type: 'ultrasonic', pin: 'Trig:D2 / Echo:D3', value: 45 },
    { id: 'c3', nameAr: 'Red LED Light', type: 'led', pin: 'D13', isActive: false },
    { id: 'c4', nameAr: 'Servo Motor', type: 'servo', pin: 'D9', value: 0 }
  ]);

  const [codeSnippet, setCodeSnippet] = useState<string>(`// SmartTech Arduino Simulator 2026
#include <Servo.h>

const int trigPin = 2;
const int echoPin = 3;
const int ledPin = 13;
Servo myServo;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  myServo.attach(9);
}

void loop() {
  long duration = getDistance();
  if (duration < 30) {
    digitalWrite(ledPin, HIGH); // Light up LED
    myServo.write(90);         // Rotate Servo
  } else {
    digitalWrite(ledPin, LOW);
    myServo.write(0);
  }
}`);

  const [isSimulating, setIsSimulating] = useState(false);
  const [distanceCm, setDistanceCm] = useState(25);
  const [lcdText, setLcdText] = useState('SmartTech Lab');

  const addComponent = (catalogItem: (typeof componentCatalog)[0]) => {
    const newComp: CircuitComponent = {
      id: `c-${Date.now()}`,
      nameAr: catalogItem.nameAr,
      type: catalogItem.type,
      pin: catalogItem.defaultPin,
      isActive: false,
      value: catalogItem.type === 'ultrasonic' ? 25 : 0
    };
    setPlacedComponents((prev) => [...prev, newComp]);
  };

  const removeComponent = (id: string) => {
    setPlacedComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);

    // Simulate circuit logic
    setPlacedComponents((prev) =>
      prev.map((c) => {
        if (c.type === 'led') {
          return { ...c, isActive: distanceCm < 30 };
        }
        if (c.type === 'servo') {
          return { ...c, value: distanceCm < 30 ? 90 : 0 };
        }
        return c;
      })
    );

    if (distanceCm < 30) {
      setLcdText('OBSTACLE ALERT!');
    } else {
      setLcdText('PATH CLEAR');
    }

    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    if (onAwardXp) onAwardXp(150);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl dir-rtl text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-400" /> Arduino & Electronics Circuit Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            صمم الدوائر الكترونية، صِل المكونات بـ Arduino/ESP32، اكتب الكود وشغّل المحاكاة!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            إيقاف المحاكاة 🛑
          </button>
          <button
            onClick={handleRunSimulation}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" /> تشغيل الدائرة (Run Circuit) ⚡
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Component Catalog */}
        <div className="lg:col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            المكونات الإلكترونية (انقر للإضافة):
          </h3>
          <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1">
            {componentCatalog.map((item) => (
              <button
                key={item.type}
                onClick={() => addComponent(item)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-right text-xs font-bold text-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.nameAr}</span>
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                  {item.defaultPin}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Breadboard Canvas */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 mb-4">
              <span>لوحة التجارب التفاعلية (Breadboard Canvas)</span>
              <span className="text-amber-400 font-bold">{placedComponents.length} مكونات متصلة</span>
            </div>

            {/* Distance Slider Control for Ultrasonic simulation */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 mb-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">محاكاة مسافة العائق (Ultrasonic Distance):</span>
                <span className="text-amber-400 font-black">{distanceCm} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={distanceCm}
                onChange={(e) => setDistanceCm(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Placed Components Grid */}
            <div className="grid grid-cols-2 gap-3">
              {placedComponents.map((comp) => (
                <div
                  key={comp.id}
                  className={`p-3 rounded-xl border transition-all ${
                    comp.isActive
                      ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-200">{comp.nameAr}</span>
                    <button
                      onClick={() => removeComponent(comp.id)}
                      className="text-slate-500 hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Pin: {comp.pin}</span>
                    {comp.type === 'led' && (
                      <span
                        className={`w-3 h-3 rounded-full ${
                          comp.isActive ? 'bg-red-500 animate-ping shadow-lg shadow-red-500' : 'bg-slate-700'
                        }`}
                      />
                    )}
                    {comp.type === 'servo' && (
                      <span className="text-amber-400 font-bold">زاوية: {comp.value}°</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LCD Simulator Screen output */}
          <div className="mt-4 p-3 bg-emerald-950 border-2 border-emerald-500/60 rounded-xl font-mono text-emerald-400 text-xs text-center tracking-widest uppercase">
            [ LCD 16x2 Output ]: {lcdText}
          </div>
        </div>

        {/* C++ / Arduino Code Editor */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 mb-3">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" /> Arduino C++ Editor
              </span>
              <span className="text-emerald-400 text-[10px]">Syntax OK</span>
            </div>

            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              rows={14}
              className="w-full bg-slate-900 text-amber-300 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed dir-ltr"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Arduino Uno Board (COM3)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Simulated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
