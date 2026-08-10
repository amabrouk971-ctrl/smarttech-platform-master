import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Award, CheckCircle2, Zap, Trophy, Lock, Sparkles, RefreshCw, Box, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { motion } from 'motion/react';

interface GameZoneProps {
  onAwardXp?: (amount: number) => void;
  userEnrolledCourseIds?: string[];
}

// Three.js Interactive 3D Canvas
const ThreeDGameCanvas: React.FC<{ type: 'robot' | 'circuit' | 'ai_cube' }> = ({ type }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || 400;
    const height = 260;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd97706, 2, 10);
    pointLight.position.set(2, 4, 3);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x2563eb, 2, 10);
    blueLight.position.set(-2, -2, -2);
    scene.add(blueLight);

    // Create 3D Objects based on type
    const group = new THREE.Group();

    if (type === 'robot') {
      // 3D Robot Arm Base
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.4, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      group.add(baseMesh);

      // Arm joint
      const jointGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const jointMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.1 });
      const jointMesh = new THREE.Mesh(jointGeo, jointMat);
      jointMesh.position.y = 0.6;
      group.add(jointMesh);

      // Arm limb
      const limbGeo = new THREE.BoxGeometry(0.3, 1.8, 0.3);
      const limbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
      const limbMesh = new THREE.Mesh(limbGeo, limbMat);
      limbMesh.position.set(0, 1.5, 0);
      limbMesh.rotation.z = 0.3;
      group.add(limbMesh);
    } else if (type === 'circuit') {
      // 3D PCB Board
      const pcbGeo = new THREE.BoxGeometry(3, 0.15, 2);
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x047857, metalness: 0.3, roughness: 0.4 });
      const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
      group.add(pcbMesh);

      // Microchip IC
      const icGeo = new THREE.BoxGeometry(0.8, 0.25, 0.8);
      const icMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
      const icMesh = new THREE.Mesh(icGeo, icMat);
      icMesh.position.y = 0.15;
      group.add(icMesh);
    } else {
      // 3D AI Neural Cube
      const cubeGeo = new THREE.IcosahedronGeometry(1.4, 1);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        wireframe: true,
        emissive: 0x4c1d95,
        emissiveIntensity: 0.8
      });
      const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
      group.add(cubeMesh);
    }

    scene.add(group);

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      group.rotation.y += 0.012;
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [type]);

  return <div ref={mountRef} className="w-full h-[260px] rounded-2xl overflow-hidden shadow-inner border border-slate-800" />;
};

export const GameZone: React.FC<GameZoneProps> = ({ onAwardXp, userEnrolledCourseIds = [] }) => {
  const games = [
    {
      id: 'g-robotics-3d',
      titleAr: 'تحدي تجميع الروبوت الثلاثي الأبعاد 🤖 (3D Robot Lab)',
      descriptionAr: 'برمج مفصل المحرك والسيرفو واختبر زاوية الدوران في معمل الروبوتات 3D!',
      xpReward: 200,
      icon: '🤖',
      threeType: 'robot' as const,
      requiredCourseId: 'junior-engineer',
      category: 'ROBOTICS'
    },
    {
      id: 'g-circuit-3d',
      titleAr: 'محاكاة الدوائر الإلكترونية ⚡ (3D Circuit Board)',
      descriptionAr: 'ركّب المعالج والمقاومات الكهربائية على اللوحة الإلكترونية لمنع حرق المكونات.',
      xpReward: 180,
      icon: '⚡',
      threeType: 'circuit' as const,
      category: 'ELECTRONICS'
    },
    {
      id: 'g-ai-neural-3d',
      titleAr: 'مكعب شبكات الذكاء الاصطناعي 🧠 (AI Neural Matrix)',
      descriptionAr: 'تدريب مصفوفة العصبونات الاصطناعية وتمييز الأشكال الهندسية في الأبعاد الثلاثية.',
      xpReward: 220,
      icon: '🧠',
      threeType: 'ai_cube' as const,
      requiredCourseId: 'junior-ai',
      category: 'AI'
    }
  ];

  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameSuccess, setGameSuccess] = useState(false);

  const activeGame = games.find((g) => g.id === activeGameId);

  const handleAnswerQuiz = (index: number) => {
    setSelectedAnswer(index);
    if (index === 0) {
      setGameSuccess(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      if (onAwardXp && activeGame) onAwardXp(activeGame.xpReward);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl dir-rtl text-right space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Gamification Zone</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-amber-400" /> SmartTech Game Zone 3D 🎮
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ألعاب وتحديات تفاعلية ثلاثية الأبعاد (3D WebGL): نفّذ التجارب، اكسب XP وارتقِ بمستواك التدريبي!
          </p>
        </div>
      </div>

      {!activeGameId ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((g) => {
            const isLocked = g.requiredCourseId && !userEnrolledCourseIds.includes(g.requiredCourseId);

            return (
              <motion.div
                key={g.id}
                whileHover={{ y: -4 }}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* 3D Model Preview */}
                <div className="relative">
                  <ThreeDGameCanvas type={g.threeType} />
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-4 space-y-2">
                      <Lock className="w-8 h-8 text-amber-400" />
                      <span className="text-xs font-black text-white">مغلق • يتطلب التسجيل بالكورس</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 font-bold text-xs rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> +{g.xpReward} XP
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{g.category}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition">
                    {g.titleAr}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{g.descriptionAr}</p>
                </div>

                <button
                  disabled={isLocked}
                  onClick={() => {
                    setActiveGameId(g.id);
                    setSelectedAnswer(null);
                    setGameSuccess(false);
                  }}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer ${
                    isLocked
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white shadow-red-600/20'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isLocked ? 'يتطلب التسجيل بالكورس' : 'ابدأ التحدي الـ 3D الآن 🚀'}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <span>{activeGame?.icon}</span>
              <span>{activeGame?.titleAr}</span>
            </span>
            <button
              onClick={() => setActiveGameId(null)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
            >
              العودة لقائمة الألعاب ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {activeGame && <ThreeDGameCanvas type={activeGame.threeType} />}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm font-bold text-slate-100">
                {activeGame?.id === 'g-robotics-3d'
                  ? 'سؤال التحدي: ما هي الزاوية الموصى بها في محرك السيرفو لإرجاع ذراع الروبوت للوضع الأصلي (Zero Position)؟'
                  : activeGame?.id === 'g-circuit-3d'
                  ? 'سؤال التحدي: ما هو العنصر الذي ينظم الجهد ويمنع التلف الناتج عن ارتداد التيار الكهرومغناطيسي؟'
                  : 'سؤال التحدي: ما اسم الخوارزمية المستخدمة لتعديل أوزان العصبونات في مصفوفة الذكاء الاصطناعي الـ 3D؟'}
              </div>

              <div className="space-y-2">
                {[
                  activeGame?.id === 'g-robotics-3d'
                    ? 'الزاوية 0 درجة (0 Degrees)'
                    : activeGame?.id === 'g-circuit-3d'
                    ? 'دايود الحماية (Flyback Diode)'
                    : 'الانتشار الخلفي (Backpropagation)',
                  'الزاوية 180 درجة',
                  'المقاومة الضوئية LDR'
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerQuiz(idx)}
                    disabled={gameSuccess}
                    className={`w-full p-3 text-right rounded-xl text-xs font-bold border transition cursor-pointer ${
                      selectedAnswer === idx
                        ? idx === 0
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                          : 'bg-red-950 border-red-500 text-red-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {gameSuccess && (
                <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold space-y-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>إجابة صحيحة! تم إضافة +{activeGame?.xpReward} XP إلى حسابك! 🎉</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
