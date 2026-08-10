import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Send, AlertCircle } from 'lucide-react';

interface VoiceMessageRecorderProps {
  onSendVoice: (voiceUrl: string, durationSeconds: number) => void;
  disabled?: boolean;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onSendVoice,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleStartRecording = async () => {
    setPermissionError(null);
    setAudioUrl(null);

    // Verify browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('متصفحك لا يدعم تسجيل الصوت. يرجى كتابة الرسالة بدلاً من ذلك.');
      return;
    }

    try {
      // Explicit permission request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          setAudioUrl(base64Url);
        };
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone permission denied or error:', err);
      setPermissionError('تعذر الوصول إلى المايكروفون. يرجى السماح بالوصول أو كتابة الرسالة بدلاً من ذلك.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (audioUrl && recordingTime > 0) {
      onSendVoice(audioUrl, recordingTime);
      handleDiscard();
    }
  };

  const handleDiscard = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {permissionError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isRecording && !audioUrl && (
          <button
            type="button"
            onClick={handleStartRecording}
            disabled={disabled}
            className="p-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl transition flex items-center gap-2 text-xs font-bold"
            title="تسجيل رسالة صوتية (يتطلب إذن المايكروفون)"
          >
            <Mic className="w-4 h-4" />
            <span>تسجيل صوتي</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 p-2.5 rounded-xl w-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
              جاري التسجيل: {formatTime(recordingTime)}
            </span>
            <button
              type="button"
              onClick={handleStopRecording}
              className="mr-auto px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> إيقاف
            </button>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2 rounded-xl w-full">
            <button
              type="button"
              onClick={() => {
                if (audioPlayerRef.current) {
                  if (isPlaying) {
                    audioPlayerRef.current.pause();
                  } else {
                    audioPlayerRef.current.play();
                  }
                  setIsPlaying(!isPlaying);
                }
              }}
              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>

            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
              تسجيل صوتي ({formatTime(recordingTime)})
            </span>

            <div className="mr-auto flex items-center gap-1">
              <button
                type="button"
                onClick={handleSend}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> إرسال
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                title="حذف التسجيل"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
