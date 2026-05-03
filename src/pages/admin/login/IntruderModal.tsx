import { useEffect, useMemo, useState } from 'react';
import { Skull, X } from 'lucide-react';
import { MatrixRain } from './MatrixRain';

export interface IntruderInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  org: string;
  lat: string;
  lon: string;
  userAgent: string;
  platform: string;
  language: string;
  languages: string;
  screenRes: string;
  viewportSize: string;
  colorDepth: string;
  timezone: string;
  timezoneOffset: string;
  cores: number;
  memory: string;
  gpu: string;
  gpuVendor: string;
  connectionType: string;
  downlink: string;
  timestamp: string;
  fingerprint: string;
  attemptCount: number;
  referrer: string;
  cookiesEnabled: boolean;
  doNotTrack: string;
  online: boolean;
  plugins: string[];
  touchSupport: boolean;
  maxTouchPoints: number;
  webdriver: boolean;
  pdfViewerEnabled: boolean;
  canvasFingerprint: string;
  audioFingerprint: string;
  webglVendor: string;
  batteryLevel: string;
  charging: string;
  localTime: string;
}

interface Props {
  info: IntruderInfo;
  onClose: () => void;
}

export const IntruderModal = ({ info, onClose }: Props) => {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [showData, setShowData] = useState(false);
  const [glitch, setGlitch] = useState(false);

  const terminalLines = useMemo(
    () => [
      '> INICIANDO VARREDURA DE SEGURANÇA...',
      '> SISTEMA DE DEFESA ATIVADO',
      '> RASTREANDO CONEXÃO...',
      `> IP DETECTADO: ${info.ip}`,
      '> COLETANDO DADOS DO DISPOSITIVO...',
      '> FINGERPRINT GERADO COM SUCESSO',
      '> ⚠️ TENTATIVA DE INVASÃO REGISTRADA',
      '> DADOS DO INVASOR CAPTURADOS:',
    ],
    [info.ip],
  );

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < terminalLines.length) {
        setTypedLines((prev) => [...prev, terminalLines[i]]);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setGlitch(true);
          setTimeout(() => {
            setGlitch(false);
            setShowData(true);
          }, 300);
        }, 500);
      }
    }, 350);
    return () => clearInterval(timer);
  }, [terminalLines]);

  const dataRows: [string, string][] = [
    ['ENDEREÇO IP', info.ip],
    ['CIDADE', info.city],
    ['ESTADO/REGIÃO', info.region],
    ['PAÍS', info.country],
    ['PROVEDOR (ISP)', info.isp],
    ['ORGANIZAÇÃO', info.org],
    ['LATITUDE', info.lat],
    ['LONGITUDE', info.lon],
    ['HORA LOCAL', info.localTime],
    ['NAVEGADOR', info.userAgent.slice(0, 80)],
    ['PLATAFORMA', info.platform],
    ['IDIOMA', info.language],
    ['IDIOMAS', info.languages],
    ['RESOLUÇÃO TELA', info.screenRes],
    ['VIEWPORT', info.viewportSize],
    ['PROF. CORES', info.colorDepth],
    ['FUSO HORÁRIO', info.timezone],
    ['OFFSET UTC', info.timezoneOffset],
    ['NÚCLEOS CPU', String(info.cores)],
    ['MEMÓRIA RAM', info.memory],
    ['GPU', info.gpu],
    ['GPU VENDOR', info.gpuVendor],
    ['WEBGL VENDOR', info.webglVendor],
    ['CONEXÃO', info.connectionType],
    ['VELOCIDADE', info.downlink],
    ['CANVAS FP', info.canvasFingerprint],
    ['AUDIO FP', info.audioFingerprint],
    ['DEVICE FP', info.fingerprint],
    ['BATERIA', info.batteryLevel],
    ['CARREGANDO', info.charging],
    ['WEBDRIVER', info.webdriver ? '⚠ DETECTADO (BOT)' : 'NÃO'],
    ['TOUCH', info.touchSupport ? `SIM (${info.maxTouchPoints} pontos)` : 'NÃO'],
    ['PDF VIEWER', info.pdfViewerEnabled ? 'SIM' : 'NÃO'],
    ['TENTATIVAS', String(info.attemptCount)],
    ['COOKIES', info.cookiesEnabled ? 'ATIVO' : 'INATIVO'],
    ['DO NOT TRACK', info.doNotTrack],
    ['ONLINE', info.online ? 'SIM' : 'NÃO'],
    ['REFERRER', info.referrer],
    ['PLUGINS', info.plugins.length > 0 ? info.plugins.join(', ') : 'NENHUM'],
    ['TIMESTAMP', info.timestamp],
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0">
        <MatrixRain />
      </div>
      <div className="absolute inset-0 bg-black/70" />

      <div
        className={`relative z-10 w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#00ff41]/30 bg-black/95 shadow-[0_0_80px_rgba(0,255,65,0.15)] ${
          glitch ? 'animate-pulse' : ''
        }`}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[#00ff41]/20 bg-black/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[#00ff41] text-sm font-bold tracking-widest">
              ⚠ INTRUSION DETECTION SYSTEM
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#00ff41]/50 hover:text-[#00ff41] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="font-mono text-xs space-y-1">
            {typedLines.map((line, i) => {
              const safeLine = line ?? '';
              return (
                <div
                  key={i}
                  className={`${
                    safeLine.includes('⚠')
                      ? 'text-red-400'
                      : safeLine.includes('IP DETECTADO')
                        ? 'text-yellow-400'
                        : 'text-[#00ff41]'
                  } ${i === typedLines.length - 1 ? 'animate-pulse' : ''}`}
                >
                  {line}
                  {i === typedLines.length - 1 && !showData && (
                    <span className="animate-pulse">█</span>
                  )}
                </div>
              );
            })}
          </div>

          {showData && (
            <div className="animate-fade-in space-y-4">
              <div className="border border-[#00ff41]/20 rounded-lg overflow-hidden">
                {dataRows.map(([label, value], i) => (
                  <div
                    key={i}
                    className={`flex ${
                      i % 2 === 0 ? 'bg-[#00ff41]/[0.03]' : 'bg-transparent'
                    } border-b border-[#00ff41]/10 last:border-b-0`}
                  >
                    <div className="w-[140px] shrink-0 px-4 py-2 font-mono text-[10px] text-[#00ff41]/60 font-bold tracking-wider">
                      {label}
                    </div>
                    <div className="px-4 py-2 font-mono text-[11px] text-[#00ff41] break-all">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-red-500/30 rounded-xl bg-red-500/5 p-4 text-center space-y-2">
                <Skull className="w-8 h-8 text-red-500 mx-auto" />
                <p className="font-mono text-red-400 text-xs font-bold tracking-wide">
                  TODOS OS DADOS ACIMA FORAM REGISTRADOS PERMANENTEMENTE
                </p>
                <p className="font-mono text-red-400/60 text-[10px]">
                  TENTATIVAS ADICIONAIS RESULTARÃO EM BLOQUEIO PERMANENTE E NOTIFICAÇÃO ÀS AUTORIDADES
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-[#00ff41]/30 bg-[#00ff41]/5 text-[#00ff41] font-mono text-xs font-bold tracking-widest hover:bg-[#00ff41]/10 transition-all"
              >
                ENTENDIDO — ENCERRAR SESSÃO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
