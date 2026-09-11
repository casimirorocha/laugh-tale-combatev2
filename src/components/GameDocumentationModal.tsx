import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Swords,
  Shield,
  Eye,
  Zap,
  Activity,
  Award,
  HelpCircle,
  X,
  ChevronRight,
  Flame,
  Sparkles,
  Layers,
  Clock,
  Target,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Brain,
  Wind,
  BatteryCharging,
  Gauge,
  RefreshCw,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface GameDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: DocSection;
}

export type DocSection = 'combat' | 'attributes' | 'haki' | 'transformations' | 'defense' | 'strategy';

export const GameDocumentationModal: React.FC<GameDocumentationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'combat',
}) => {
  const [activeSection, setActiveSection] = useState<DocSection>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveSection(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const sections = [
    {
      id: 'combat' as DocSection,
      title: 'Sistema de Combate',
      subtitle: 'Lógica de luta, cálculo de dano e combos',
      icon: Swords,
      color: 'text-red-400',
      badgeBg: 'bg-red-950/70 border-red-500/40',
    },
    {
      id: 'attributes' as DocSection,
      title: 'Atributos e Barras',
      subtitle: 'HP, Stamina, Haki, Foco e Recursos',
      icon: Activity,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/70 border-amber-500/40',
    },
    {
      id: 'haki' as DocSection,
      title: 'Mecânicas de Haki',
      subtitle: 'Armamento, Observação e Conquistador',
      icon: Zap,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-950/70 border-purple-500/40',
    },
    {
      id: 'transformations' as DocSection,
      title: 'Transformações & Formas',
      subtitle: 'Hierarquia Anti-Loop, Cooldown e IA de Decisão',
      icon: Sparkles,
      color: 'text-yellow-400',
      badgeBg: 'bg-yellow-950/70 border-yellow-500/40',
    },
    {
      id: 'defense' as DocSection,
      title: 'Defesa e Movimentação',
      subtitle: 'Bloqueio, Esquiva e Janelas de Timing',
      icon: Shield,
      color: 'text-blue-400',
      badgeBg: 'bg-blue-950/70 border-blue-500/40',
    },
    {
      id: 'strategy' as DocSection,
      title: 'Guia Estratégico',
      subtitle: 'Dicas fundamentais para iniciantes',
      icon: Award,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/70 border-emerald-500/40',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/90 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Cinzel'] text-base sm:text-lg md:text-xl font-bold text-white tracking-wide">
                    COMO FUNCIONA: GUIA
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    MANUAL DO JOGO
                  </span>
                </div>
                <p className="font-mono text-[11px] text-zinc-400 hidden sm:block">
                  Manual completo de combate, mecânicas de Haki e estratégias da Grand Line
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:border-red-500 hover:bg-red-950/60 hover:text-red-300 transition"
              title="Fechar Guia"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Bar (Tabs) */}
          <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2.5 bg-zinc-950 border-b border-zinc-800/80 overflow-x-auto no-scrollbar">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    soundManager.playUiClick();
                    setActiveSection(sec.id);
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? `bg-zinc-800 border-2 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]`
                      : 'bg-zinc-900/60 border border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${sec.color}`} />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
            {/* SECTION 1: SISTEMA DE COMBATE */}
            {activeSection === 'combat' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Intro Hero Banner */}
                <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase font-mono tracking-wider mb-1">
                    <Swords className="h-4 w-4" /> 1. Arquitetura de Combate
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white mb-2">
                    Lógica de Turnos em Tempo Real & Prioridades
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    O combate combina a velocidade de um jogo de luta arcade estilo KOF com o rigor tático de gerenciamento de recursos. A cada momento, você decide entre golpear, contra-atacar, defender ou prever movimentos através do Haki.
                  </p>
                </div>

                {/* Grid 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Cálculo de Dano */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                      <Target className="h-4 w-4" /> CÁLCULO DE DANO (DAMAGE MATH)
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      O dano final infligido a um oponente depende de múltiplos fatores multiplicativos calculados na engine:
                    </p>
                    <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 font-mono text-[11px] space-y-1.5 text-zinc-300">
                      <div className="text-amber-400 font-bold">Dano Final = (DanoBase + Escala) × ModHaki × MultCombo × ModDefesa</div>
                      <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[10px] pt-1">
                        <li><b className="text-zinc-200">Dano Base:</b> Determinado pelo golpe selecionado (Light, Heavy, EX, Super).</li>
                        <li><b className="text-purple-300">Multiplicador de Haki:</b> Hasta +40% de bônus se infundido com Armamento ou Conquistador.</li>
                        <li><b className="text-amber-300">Multiplicador de Combo:</b> Escala de 1.0x até 1.45x conforme hits consecutivos se conectam.</li>
                        <li><b className="text-blue-300">Modificador de Defesa:</b> Redução de até 70% caso o oponente esteja em bloqueio ativo.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Card 2: Tipos de Golpes */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs font-mono">
                      <Flame className="h-4 w-4" /> HIERARQUIA DE GOLPES
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[9px] font-bold">ATK 1 & 2</span>
                        <div className="text-[11px]">
                          <strong className="text-white">Golpes Normais:</strong> Rápidos, consomem pouca Stamina e iniciam cadeias de combo.
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80">
                        <span className="px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-300 font-mono text-[9px] font-bold">EX MOVE</span>
                        <div className="text-[11px]">
                          <strong className="text-white">Golpe EX Especial:</strong> Consome 1 barra de Super/EX; possui propriedades de quebra de guarda.
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80">
                        <span className="px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-300 font-mono text-[9px] font-bold">SUPER / FINISHER</span>
                        <div className="text-[11px]">
                          <strong className="text-white">Técnicas Secretas:</strong> Animações cinemáticas com dano massivo e pausas de impacto (Hit-Stop).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Combo System & Hit-Stop */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                  <h4 className="font-bold text-xs text-amber-400 font-mono uppercase flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Sistema de Combos, Cancelamentos e Hit-Stops
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Golpes conectados dentro de uma janela de 2.8 segundos mantêm o medidor de combo ativo. Atingir marcas como <b>5 Hits</b>, <b>10 Hits</b> e <b>20 Hits</b> desbloqueia conquistas imediatas, aumenta o multiplicador de dano acumulado e aciona falas exclusivas do narrador e dos lutadores.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 2: ATRIBUTOS E BARRAS */}
            {activeSection === 'attributes' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono tracking-wider mb-1">
                    <Activity className="h-4 w-4" /> 2. Gestão de Recursos e Barras
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white mb-2">
                    Compreendendo os 4 Medidores Vitais
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Dominar a batalha exige monitorar não apenas sua vida, mas o fôlego, a energia espiritual do Haki e a sua estabilidade psicológica (Foco).
                  </p>
                </div>

                {/* 4 Meters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* HP Bar */}
                  <div className="rounded-xl border border-emerald-500/30 bg-zinc-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-emerald-400 font-mono text-xs">
                        <Activity className="h-4 w-4" /> HP (PONTOS DE VIDA)
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400">Verde $\to$ Amarelo $\to$ Vermelho</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-full rounded-full" />
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Sua sobrevivência na arena. Ao cair abaixo de <b>25% de HP</b>, seu personagem entra no estado de <b>Crise / Despertar</b>, liberando acesso ao <i>Desperation Finisher</i> e auras despertadas.
                    </p>
                  </div>

                  {/* Stamina Bar */}
                  <div className="rounded-xl border border-amber-500/30 bg-zinc-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-amber-400 font-mono text-xs">
                        <BatteryCharging className="h-4 w-4" /> STAMINA (FÔLEGO)
                      </div>
                      <span className="font-mono text-[10px] text-amber-300">0 a 100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 w-3/4 rounded-full" />
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Consumida a cada ataque desferido. Se a Stamina chegar a 0, você entra em <b>Fadiga Severa (Fatigued)</b>: seus golpes causam dano mínimo. <b>Dica de Ouro:</b> Ficar em Defesa (Guard) recupera Stamina rapidamente.
                    </p>
                  </div>

                  {/* Haki Meter */}
                  <div className="rounded-xl border border-purple-500/30 bg-zinc-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-purple-400 font-mono text-xs">
                        <Zap className="h-4 w-4" /> HAKI METER (ENERGIA)
                      </div>
                      <span className="font-mono text-[10px] text-purple-300">0 a 300 ⚡</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 w-1/2 rounded-full" />
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Energia espiritual acumulada ao acertar golpes ou receber dano. Alimenta infuões de Armamento, Golpes Especiais e ativações de Visão do Futuro.
                    </p>
                  </div>

                  {/* Focus Meter */}
                  <div className="rounded-xl border border-red-500/30 bg-zinc-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-red-400 font-mono text-xs">
                        <Brain className="h-4 w-4" /> FOCO (ESTABILIDADE MENTAL)
                      </div>
                      <span className="font-mono text-[10px] text-red-300">0% a 100% 🎯</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-gradient-to-r from-red-600 to-rose-400 w-4/5 rounded-full" />
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Mede a calma emocional. Foco alto garante máxima precisão e baixo custo de Haki. Provocações inimigas drenam seu Foco; se cair abaixo de <b>25%</b>, seu Haki da Observação é <b>completamente bloqueado</b>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: MECÂNICAS DE HAKI */}
            {activeSection === 'haki' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-950 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase font-mono tracking-wider mb-1">
                    <Zap className="h-4 w-4" /> 3. Os Três Poderes do Haki
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white mb-2">
                    Armamento, Observação & Conquistador
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    O Haki é o sistema decisivo que separa os novatos dos verdadeiros soberanos do mar. Cada tipo possui mecânicas e custos específicos integrados à engine.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Busoshoku Haki */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                      <Shield className="h-4 w-4 text-amber-400" /> BUSOSHOKU HAKI (COR DO ARMAMENTO)
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Reveste o corpo ou armas com armadura invisível/endurecida. Concede bônus de dano de até +35% nos ataques, penetra defesas e fortalece a guarda do lutador contra quebras de bloqueio.
                    </p>
                  </div>

                  {/* Kenbunshoku Haki & Future Sight */}
                  <div className="rounded-xl border border-red-500/40 bg-zinc-900/90 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-400 font-bold text-xs font-mono">
                        <Eye className="h-4 w-4 text-red-400" /> KENBUNSHOKU HAKI (OBSERVAÇÃO & VISÃO DO FUTURO)
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300">
                        SISTEMA MODULADO POR FOCO
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Permite prever os movimentos do oponente e executar esquivas com precisão cirúrgica. Funciona sob as 4 regras canônicas de balanceamento:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <strong className="text-red-400 block mb-1">1. Precisão Proporcional ao Foco</strong>
                        <span className="text-zinc-400 text-[10px]">
                          Foco a 100% = 100% de eficácia preditiva. Foco a 50% reduz a utilidade em mais de 65%.
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <strong className="text-red-400 block mb-1">2. Custo Dinâmico de Haki</strong>
                        <span className="text-zinc-400 text-[10px]">
                          Mente calma gasta apenas 28⚡ de Haki. Mente perturbada (Foco 25%) gasta até 67⚡ por uso!
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <strong className="text-red-400 block mb-1">3. Trava Canônica de Foco (&lt; 25%)</strong>
                        <span className="text-zinc-400 text-[10px]">
                          Se o Foco cair abaixo de 25%, a Observação é BLOQUEADA, mesmo com a barra de Haki em 100%.
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <strong className="text-red-400 block mb-1">4. Maestria Superior</strong>
                        <span className="text-zinc-400 text-[10px]">
                          Mestres (Katakuri, Shanks, Enel) têm teto alto de esquiva, mas também perdem a previsão se desestabilizados.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Haoshoku Haki */}
                  <div className="rounded-xl border border-purple-500/30 bg-zinc-900/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono">
                      <Zap className="h-4 w-4 text-purple-400" /> HAOSHOKU HAKI (COR DO CONQUISTADOR)
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      A manifestação da força de vontade suprema. Ao colidirem golpes de Conquistador, inicia-se um <b>Haki Clash QTE</b> (disputa de cliques rápidos). Vencer o choque inflige dano massivo e atordoa o adversário.
                    </p>
                  </div>

                  {/* Tabela de Distribuição de Haki */}
                  <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 space-y-3 overflow-hidden">
                    <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm font-mono border-b border-zinc-800 pb-2">
                      <Layers className="h-4 w-4 text-zinc-400" /> DISTRIBUIÇÃO E ESCALA OFICIAL (CANÔNICA)
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Com base em intensa pesquisa na obra original, os status de Haki foram recalibrados. O <strong>Haki do Rei</strong> é tratado como o atributo mais raro, reservado a uma elite. A <strong>Observação</strong> escala em níveis (básico, predição e leitura futura), enquanto o <strong>Armamento</strong> é o mais comum, mas diverge fortemente em força (redução de dano / quebra de guarda).
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] sm:text-xs text-zinc-300 font-mono">
                        <thead className="bg-zinc-950/50 text-zinc-400">
                          <tr>
                            <th className="p-2 border-b border-zinc-800 font-semibold">Personagem</th>
                            <th className="p-2 border-b border-zinc-800 font-semibold text-purple-400">H. Rei (0-100)</th>
                            <th className="p-2 border-b border-zinc-800 font-semibold text-red-400">H. Observação</th>
                            <th className="p-2 border-b border-zinc-800 font-semibold text-amber-400">H. Armamento</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-2 font-bold text-white">Gol D. Roger</td>
                            <td className="p-2 text-purple-300">100 (Supremo)</td>
                            <td className="p-2 text-red-300">95 (Avançado)</td>
                            <td className="p-2 text-amber-300">98 (Avançado)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/40">
                            <td className="p-2 font-bold text-white">Shanks</td>
                            <td className="p-2 text-purple-300">100 (Supremo)</td>
                            <td className="p-2 text-red-300">100 (Assassino)</td>
                            <td className="p-2 text-amber-300">95 (Avançado)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-2 font-bold text-white">Monkey D. Luffy</td>
                            <td className="p-2 text-purple-300">95 (Avançado)</td>
                            <td className="p-2 text-red-300">95 (Prev. Futuro)</td>
                            <td className="p-2 text-amber-300">98 (Ryuo Interno)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/40">
                            <td className="p-2 font-bold text-white">Monkey D. Garp</td>
                            <td className="p-2 text-purple-300">95 (Avançado)</td>
                            <td className="p-2 text-red-300">85 (Reflexos)</td>
                            <td className="p-2 text-amber-300">100 (Pico Supremo)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-2 font-bold text-white">Kaido das Feras</td>
                            <td className="p-2 text-purple-300">95 (Avançado)</td>
                            <td className="p-2 text-red-300">85 (Prev. Ocasional)</td>
                            <td className="p-2 text-amber-300">95 (Pele Dracônica)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/40">
                            <td className="p-2 font-bold text-white">Dracule Mihawk</td>
                            <td className="p-2 text-zinc-500">0 (N/C)</td>
                            <td className="p-2 text-red-300">95 (Clarividência)</td>
                            <td className="p-2 text-amber-300">100 (Lâmina Negra)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-2 font-bold text-white">Roronoa Zoro</td>
                            <td className="p-2 text-purple-300">85 (Despertando)</td>
                            <td className="p-2 text-red-300">75 (Boa Reação)</td>
                            <td className="p-2 text-amber-300">95 (Domínio Enma)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/40">
                            <td className="p-2 font-bold text-white">Charlotte Katakuri</td>
                            <td className="p-2 text-purple-300">80 (Básico)</td>
                            <td className="p-2 text-red-300">98 (Prev. Futuro)</td>
                            <td className="p-2 text-amber-300">85 (Mochi Endurecido)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-2 font-bold text-white">Vinsmoke Sanji</td>
                            <td className="p-2 text-zinc-500">0 (Não possui)</td>
                            <td className="p-2 text-red-300">90 (Natural)</td>
                            <td className="p-2 text-amber-300">80 (Ifrit Jambe)</td>
                          </tr>
                          <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/40">
                            <td className="p-2 font-bold text-white">Buggy, o Palhaço</td>
                            <td className="p-2 text-zinc-500">0 (Não possui)</td>
                            <td className="p-2 text-red-300">20 (Pífio)</td>
                            <td className="p-2 text-zinc-500">0 (Não possui)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex items-start gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800/60 mt-2">
                      <HelpCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-zinc-400 font-sans">
                        <strong className="text-zinc-200">Fonte de Pesquisa:</strong> Dados extraídos dos Vivre Cards (Databooks oficiais), mangá canon (capítulos 1 ao 1100+) e análise direta de confrontos de Haki. O design desta tabela foi construído usando métricas de balanceamento para combates assimétricos da nossa engine.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: TRANSFORMAÇÕES & FORMAS DESPERTADAS */}
            {activeSection === 'transformations' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Intro Hero Banner */}
                <div className="rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-yellow-950/40 via-zinc-900 to-zinc-950 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase font-mono tracking-wider mb-1">
                    <Sparkles className="h-4 w-4" /> 4. Arquitetura de Transformações & Formas
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white mb-2">
                    Hierarquia Linear, Triggers, Cooldowns e IA Preditiva
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    As transformações representam o pico de poder de um guerreiro na Grand Line. Nossa engine de combate calcula em tempo real triggers de vida, contagem de ações, afinidade com o oponente e telemetria tática para acionar a forma ideal, com proteções estruturais contra regressões indevidas.
                  </p>
                </div>

                {/* 3 Core Technical Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pillar 1: Hierarquia Linear */}
                  <div className="rounded-xl border border-amber-500/40 bg-zinc-900/80 p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                        <ShieldCheck className="h-4 w-4" /> HIERARQUIA LINEAR (NO-DOWNGRADE)
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Garante que um personagem <strong>nunca regrida de nível</strong> e elimina loops infinitos de animação (ex: transição cíclica entre Gear 4 e Gear 5).
                      </p>
                      <div className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800 font-mono text-[10px] text-zinc-400 space-y-1">
                        <div className="text-amber-400 font-bold">Safe Progression Rule:</div>
                        <code>currentFormIndex = roster.findIndex(...)</code>
                        <div className="text-emerald-400">if (candidateIndex &lt;= currentFormIndex) ignore;</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400/90 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/20">
                      ✓ Bloqueio definitivo de regressão
                    </span>
                  </div>

                  {/* Pillar 2: Cooldown de Cadência */}
                  <div className="rounded-xl border border-purple-500/40 bg-zinc-900/80 p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono">
                        <Clock className="h-4 w-4" /> COOLDOWN MÍNIMO (3 AÇÕES)
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Mesmo que um dano massivo satisfaça os requisitos da forma seguinte, o motor impõe um intervalo mínimo de <strong>3 turnos/ações</strong> desde a última transformação.
                      </p>
                      <div className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800 font-mono text-[10px] text-zinc-400 space-y-1">
                        <div className="text-purple-400 font-bold">Cadence Telemetry:</div>
                        <code>turnsElapsed = currentTurn - lastTransformTurn</code>
                        <div className="text-purple-300">if (turnsElapsed &lt; 3) return null;</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300/90 bg-purple-950/40 px-2 py-1 rounded border border-purple-500/20">
                      ✓ Tempo para áudio, animação e moveset
                    </span>
                  </div>

                  {/* Pillar 3: Algoritmo de Decisão Inteligente */}
                  <div className="rounded-xl border border-yellow-500/40 bg-zinc-900/80 p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs font-mono">
                        <Cpu className="h-4 w-4" /> ALGORITMO PREDITIVO (SCORING)
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Se múltiplas formas estiverem disponíveis, a IA pontua a melhor escolha avaliando atributos, crise de HP, fraqueza do oponente e momento do combate.
                      </p>
                      <div className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800 font-mono text-[10px] text-zinc-400 space-y-1">
                        <div className="text-yellow-400 font-bold">Scoring Formula:</div>
                        <code>Score = (Atk*10) + (Spd*10) + (Def*8)</code>
                        <div className="text-yellow-300">+ Telemetria Tática & Contra-Medida</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-yellow-300/90 bg-yellow-950/40 px-2 py-1 rounded border border-yellow-500/20">
                      ✓ Seleção da melhor resposta tática
                    </span>
                  </div>
                </div>

                {/* New Feature Deep Dive: Visual Overlay & Audio Engine */}
                <div className="rounded-2xl border border-amber-500/50 bg-zinc-950 p-4 sm:p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Gauge className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-['Cinzel'] font-bold text-sm sm:text-base text-amber-300">
                          Visual Overlay de Batalha & Sistema de Áudio (audioManager)
                        </h4>
                        <p className="text-[10px] font-mono text-zinc-400">
                          Feedback em tempo real na arena de combate com telemetria e sonorização dinâmica
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      LIVE COMBAT HUD
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual Overlay Mechanics */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                        <Target className="h-4 w-4" /> RECURSOS DO VISUAL OVERLAY (ARENA)
                      </div>
                      <ul className="text-xs text-zinc-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">1.</span>
                          <span><strong>Active Form & Tier:</strong> Exibe a forma em uso, insígnia de cor e distinção entre Base, Formas Intermediárias e <i>Apex Form</i>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">2.</span>
                          <span><strong>Contador de Duração (Actions):</strong> Conta quantas ações o lutador realizou na forma ativa para controle tático do ritmo de luta.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">3.</span>
                          <span><strong>Medidor de Cooldown (3 Segmentos):</strong> Sinaliza visualmente quando a cadência energética está estabilizada e pronta (<i>READY</i>).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">4.</span>
                          <span><strong>Botões SHIFT & REVERT:</strong> Permite ao jogador comandar o salto de forma ou reverter voluntariamente à forma base.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Audio Engine Integration */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                        <BatteryCharging className="h-4 w-4" /> SISTEMA DE ÁUDIO & VOZES (audioManager)
                      </div>
                      <ul className="text-xs text-zinc-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">✦</span>
                          <span><strong>Entrada em Forma (Enter SFX + Quote):</strong> Ao acionar uma transformação, o <code>audioManager</code> sintetiza a ressonância de aura no tom temático do lutador, dispara trovões de Haki e reproduz o grito de guerra ou fala canônica.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">✦</span>
                          <span><strong>Saída da Forma (Exit SFX + Fatigue):</strong> Ao reverter ou sofrer um K.O. enquanto transformado, toca o som de dissipação de energia, descompressão e fala de desgaste vocal.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">✦</span>
                          <span><strong>BGM & Drums of Liberation:</strong> Em despertares supremos (como Gear 5), a trilha sonora se sincroniza dinamicamente aos tambores da libertação.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Telemetry Detail Box */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <h4 className="font-bold text-xs text-amber-400 font-mono uppercase flex items-center gap-1.5">
                    <Brain className="h-4 w-4" /> Telemetria de Combate e Adaptação em Tempo Real
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-red-400 font-bold font-mono text-[11px]">Sobrevivência & Desespero</div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Se a própria vida cair abaixo de <b>40% HP</b>, o algoritmo concede bônus maciço para formas com defesa elevada e cura percentual instantânea.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-blue-400 font-bold font-mono text-[11px]">Contra Oponentes Tanques</div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Contra oponentes com Defesa &gt; 130 ou HP &gt; 3000 (ex: Kaido), prioriza multiplicadores de Ataque para romper a armadura e penetrar a guarda.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-emerald-400 font-bold font-mono text-[11px]">Contra Oponentes Velozes</div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Se o rival tiver Velocidade superior ou acima de 130, o sistema favorece formas com alta agilidade para reter taxa de esquiva e iniciativa.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-purple-400 font-bold font-mono text-[11px]">Instinto de Finalização</div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Quando o adversário estiver abaixo de <b>30% HP</b>, a IA seleciona as formas mais devastadoras para desferir um K.O. imediato.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proportional HP Math Card */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs font-mono">
                    <Activity className="h-4 w-4 text-emerald-400" /> CÁLCULO PROPORCIONAL DE VIDA (HP MATH)
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Quando uma forma aumenta o HP Máximo do personagem através de bônus de defesa, a engine recalcula a vida atual proporcionalmente antes de aplicar curas adicionais:
                  </p>
                  <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1">
                    <div className="text-emerald-400 font-bold">Novo HP Atual = (HP Anterior / HP Máximo Anterior) × Novo HP Máximo + Bônus de Cura</div>
                    <p className="text-zinc-500 text-[10px]">
                      Isso garante que um lutador não sofra perdas injustas de porcentagem de vida ao se transformar nem receba curas desmedidas.
                    </p>
                  </div>
                </div>

                {/* Roster Table */}
                <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm font-mono">
                      <Layers className="h-4 w-4 text-amber-400" /> PERSONAGENS COM TRANSFORMAÇÕES CANÔNICAS
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
                      ROSTER MULTI-TIER
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] sm:text-xs text-zinc-300 font-mono">
                      <thead className="bg-zinc-950/50 text-zinc-400">
                        <tr>
                          <th className="p-2 border-b border-zinc-800 font-semibold">Guerreiro</th>
                          <th className="p-2 border-b border-zinc-800 font-semibold text-amber-400">Forma 1 (Intermediária)</th>
                          <th className="p-2 border-b border-zinc-800 font-semibold text-yellow-400">Forma 2 (Despertar Supremo)</th>
                          <th className="p-2 border-b border-zinc-800 font-semibold text-emerald-400">Gatilho de Ativação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-2 font-bold text-white">Monkey D. Luffy</td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-amber-300 font-semibold">Gear 4: Boundman</span>
                            <div className="text-[10px] text-zinc-400">+45% ATK, +30% DEF (Kong Gun, Leo Bazooka)</div>
                          </td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-yellow-300 font-semibold">Gear 5: Sun God Nika</span>
                            <div className="text-[10px] text-zinc-400">+75% ATK, +50% SPD, +25% Cura (Dawn Rocket, Bajrang Gun)</div>
                          </td>
                          <td className="p-2 text-emerald-400 text-[10px]">
                            G4: HP ≤ 70% & Ações ≥ 2<br />
                            G5: HP ≤ 35% (Despertar Nika)
                          </td>
                        </tr>
                        <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/40">
                          <td className="p-2 font-bold text-white">Rob Lucci (CP0)</td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-amber-300 font-semibold">Human-Leopard Hybrid</span>
                            <div className="text-[10px] text-zinc-400">+35% ATK, +40% SPD (Rokushiki Aprimorado)</div>
                          </td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-red-400 font-semibold">Awakened Leopard (CP0)</span>
                            <div className="text-[10px] text-zinc-400">+70% ATK, +60% SPD, +25% DEF (Chamas Negras e Rokuogan)</div>
                          </td>
                          <td className="p-2 text-emerald-400 text-[10px]">
                            Híbrido: HP ≤ 75% & Ações ≥ 1<br />
                            Despertar: HP ≤ 50% & Ações ≥ 2
                          </td>
                        </tr>
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-2 font-bold text-white">Marco (A Fênix)</td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-blue-300 font-semibold">Hybrid Phoenix Form</span>
                            <div className="text-[10px] text-zinc-400">+30% ATK, +35% SPD, Regeneração Passiva</div>
                          </td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-cyan-300 font-semibold">Full Phoenix Form</span>
                            <div className="text-[10px] text-zinc-400">+50% ATK, +40% DEF, +35% Cura Instantânea</div>
                          </td>
                          <td className="p-2 text-emerald-400 text-[10px]">
                            Híbrido: HP ≤ 75% & Ações ≥ 2<br />
                            Fênix Total: HP ≤ 35%
                          </td>
                        </tr>
                        <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/40">
                          <td className="p-2 font-bold text-white">Kaido das Feras</td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-amber-300 font-semibold">Hybrid Dragon Form</span>
                            <div className="text-[10px] text-zinc-400">+60% ATK, +50% DEF (Thunder Bagua, Kosanze Ragnerok)</div>
                          </td>
                          <td className="p-2 text-zinc-500">Forma Suprema Única</td>
                          <td className="p-2 text-emerald-400 text-[10px]">
                            HP ≤ 50% ou Oponente com Observação ≥ 85
                          </td>
                        </tr>
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-2 font-bold text-white">Cavendish</td>
                          <td className="p-2 text-zinc-300">
                            <span className="text-purple-300 font-semibold">Hakuba (Awakening)</span>
                            <div className="text-[10px] text-zinc-400">+80% SPD, +50% ATK (Cortes Rápidos Invisíveis)</div>
                          </td>
                          <td className="p-2 text-zinc-500">Forma Única</td>
                          <td className="p-2 text-emerald-400 text-[10px]">
                            HP ≤ 40% & Ações ≥ 4
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800/60 mt-2">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-400 font-sans">
                      <strong className="text-zinc-200">Nota Tática:</strong> Durante a transformação, o jogo executa um <i>Hit-Freeze</i> cinemático com anúncio de áudio e troca de tema musical canônico (como o <i>Drums of Liberation</i> de Luffy no Gear 5).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: DEFESA E MOVIMENTAÇÃO */}
            {activeSection === 'defense' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-zinc-900 to-zinc-950 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase font-mono tracking-wider mb-1">
                    <Shield className="h-4 w-4" /> 5. Defesa, Esquiva & Timings
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white mb-2">
                    Como Mitigar e Anular Golpes Adversários
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Saber quando recuar ou erguer o escudo de Armamento é a diferença entre a vitória e um K.O. fulminante.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Defesa Ativa */}
                  <div className="rounded-xl border border-blue-500/40 bg-zinc-900/80 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-mono">
                      <Shield className="h-4 w-4" /> DEFESA ATIVA (ARMAMENT GUARD)
                    </div>
                    <div className="flex items-center gap-3 bg-blue-950/40 p-3 rounded-xl border border-blue-500/30">
                      <div className="h-10 w-10 rounded-full border-2 border-blue-400 bg-blue-600/30 flex items-center justify-center text-blue-200">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="text-xs">
                        <strong className="text-white block">Efeito Visual Azul & Som Amortecido</strong>
                        <span className="text-blue-300 text-[11px]">Reduz até 70% do dano e recupera +20 de Stamina.</span>
                      </div>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                      <li>Use quando sua Stamina estiver baixa para regenerar fôlego em segurança.</li>
                      <li>Cuidado com golpes EX pesados, que podem causar <i>Guard Crush</i>.</li>
                    </ul>
                  </div>

                  {/* Esquiva */}
                  <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs font-mono">
                      <Wind className="h-4 w-4 text-zinc-400" /> ESQUIVA (DODGE / RECÚO)
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <div className="h-10 w-10 rounded-xl border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-300 scale-90 opacity-70">
                        <Wind className="h-5 w-5" />
                      </div>
                      <div className="text-xs">
                        <strong className="text-white block">Redução de Escala & Translação</strong>
                        <span className="text-zinc-400 text-[11px]">Desvio rápido de recuo com rastro e som de deslocamento de ar.</span>
                      </div>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                      <li>Custo zero de Haki na esquiva comum.</li>
                      <li>Ideal para punir golpes lentos com tempos de recuperação prolongados.</li>
                    </ul>
                  </div>

                  {/* Estado Atordoado (Stunned / Guard Crush) */}
                  <div className="rounded-xl border border-yellow-500/40 bg-zinc-900/80 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs font-mono">
                      <Sparkles className="h-4 w-4 text-yellow-400" /> ESTADO ATORDOADO (STUNNED)
                    </div>
                    <div className="flex items-center gap-3 bg-yellow-950/40 p-3 rounded-xl border border-yellow-500/30">
                      <div className="h-10 w-10 rounded-full border-2 border-yellow-400 bg-yellow-500/30 flex items-center justify-center text-yellow-200">
                        <Sparkles className="h-6 w-6 animate-spin" />
                      </div>
                      <div className="text-xs">
                        <strong className="text-white block">Aura Amarela Pulsante & Espiral Giratória</strong>
                        <span className="text-yellow-300 text-[11px]">Incapaz de atacar ou defender com ressonância sonora contínua.</span>
                      </div>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                      <li>Ocorre após Guard Crush ou choque de Haki do Conquistador perdido.</li>
                      <li>Fique atento ao contador de turnos de recuperação de atordoamento.</li>
                    </ul>
                  </div>
                </div>

                {/* Timing Tips */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
                  <h4 className="font-bold text-xs text-amber-300 font-mono uppercase flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Dicas de Timing & Leitura de Ações
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Observe as citações nos balões de fala dos adversários. Quando um oponente preparar um golpe especial (brilho roxo ou dourado), acione a <b>Visão do Futuro</b> ou a <b>Defesa</b> imediatamente antes do impacto para anular o dano de forma perfeita.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 6: GUIA ESTRATÉGICO */}
            {activeSection === 'strategy' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono tracking-wider mb-1">
                    <Award className="h-4 w-4" /> 6. Recomendações Estratégicas
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white mb-2">
                    Como Vencer Batalhas na Grand Line
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Combinações práticas e táticas essenciais para novos jogadores superarem chefes lendários e outros oponentes.
                  </p>
                </div>

                {/* Strategy Steps */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Quebre o Foco de Especialistas com Taunts</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Lutadores como Katakuri e Shanks têm esquivas quase impenetráveis. Use o botão <b>PROVOCAÇÃO (TAUNT)</b> para irritá-los. Quando o Foco deles cair para menos de 25%, a Visão do Futuro deles quebrará e você poderá acertar combos livremente!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Nunca Deixe sua Stamina Esgotar Totalmente</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Se sua barra de Stamina zerar, seu lutador fica fadigado. Alterne entre sequências de 2 a 3 ataques normais e use a <b>Defesa</b> por 1 turno para recarregar o fôlego e manter a pressão.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Ative o MAX Mode em Momentos Cruciais</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Ao encher a barra de EX, ative o <b>MAX Mode</b> para obter cancelamentos livres de golpes e aumento maciço de velocidade de combo, ideal para virar partidas perdidas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">
                      4
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Treine no Dojo / Sala de Treinamento</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Use o modo <b>TRAINING ROOM</b> no menu principal para testar rotas de combo específicas para cada personagem e aperfeiçoar seu timing contra bonecos de treino.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-950 text-xs">
            <span className="font-mono text-zinc-500 text-[11px] hidden sm:inline">
              Pressione ESC ou clique em fechar para voltar
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl border border-amber-500 bg-amber-500/20 font-bold text-amber-300 hover:bg-amber-500/30 transition text-xs font-mono"
              >
                ENTENDIDO, VAMOS LUTAR! ⚔️
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
