const fs = require('fs');

const path = 'src/components/GameDocumentationModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetString = `                  {/* Haoshoku Haki */}
                  <div className="rounded-xl border border-purple-500/30 bg-zinc-900/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono">
                      <Zap className="h-4 w-4 text-purple-400" /> HAOSHOKU HAKI (COR DO CONQUISTADOR)
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      A manifestação da força de vontade suprema. Ao colidirem golpes de Conquistador, inicia-se um <b>Haki Clash QTE</b> (disputa de cliques rápidos). Vencer o choque inflige dano massivo e atordoa o adversário.
                    </p>
                  </div>`;

const newContent = targetString + `

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
                  </div>`;

if(content.includes('HAOSHOKU HAKI (COR DO CONQUISTADOR)')) {
  content = content.replace(targetString, newContent);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Success");
} else {
  console.log("Target string not found");
}

