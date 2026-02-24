import { useState } from 'react';
import { CloudLightning, Cloud, Eye, Settings } from 'lucide-react';
import { parseStructuredCSV } from '../lib/data';
import { Card } from './ui/Card';

export const FileUploader = ({ supabase, onDataSaved, isMobile, isHomolog }) => {
    const [status, setStatus] = useState('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [manualDU, setManualDU] = useState('1'); 
    const [totalDays, setTotalDays] = useState('22'); 
    
    const handleFile = async (e, mode) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!manualDU || Number.parseInt(manualDU) < 1) {
            alert("Por favor, informe o Dia Útil atual (DU).");
            e.target.value = null; return;
        }
        if (!totalDays || Number.parseInt(totalDays) < Number.parseInt(manualDU)) {
            alert("Dias Úteis Totais inválido.");
            e.target.value = null; return;
        }
        
        setStatus('processing');
        setStatusMsg("Lendo arquivo...");

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const processed = parseStructuredCSV(text, manualDU, totalDays);
            
            if (!processed || processed.rawData.length === 0) {
                alert("Erro: CSV vazio ou inválido."); setStatus('idle'); return;
            }

            if (mode === 'cloud' && !isHomolog) {
                if (!supabase) { alert("Supabase não inicializado."); setStatus('idle'); return; }
                setStatusMsg("Enviando dados para o Supabase...");
                try {
                    const { error } = await supabase.from('dashboards').upsert({ id: 'latest', content: processed, updated_at: new Date().toISOString() });
                    if (error) throw error;
                    onDataSaved(processed); setStatus('success-cloud'); setStatusMsg("Sucesso! Base de dados atualizada.");
                } catch(err) {
                    console.error("Erro Supabase:", err); alert("Erro ao salvar: " + err.message); setStatus('idle');
                }
            } else {
                onDataSaved(processed); setStatus('success-local'); setStatusMsg("Simulação local carregada.");
            }
            setTimeout(() => { setStatus('idle'); setStatusMsg(''); }, 3000);
        };
        reader.readAsText(file, 'UTF-8'); 
    };

    return (
        <div className="max-w-2xl mx-auto pt-10 text-center pb-20">
            <Card className="p-10">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CloudLightning size={40} className="text-[#003366]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestão de Dados (Supabase)</h2>
                <p className="text-slate-500 mb-8">Importe o arquivo CSV completo para atualizar os indicadores.</p>
                
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 inline-block text-left w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-4 text-[#003366] font-bold border-b border-slate-200 pb-2">
                        <Settings size={18}/> Parâmetros do Mês Atual
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dia Útil (D.U.) Atual</label>
                            <input type="number" min="1" max="31" value={manualDU} onChange={(e) => setManualDU(e.target.value)}
                                className="p-3 w-full border border-slate-300 rounded-lg text-center font-bold text-[#003366] focus:outline-none focus:border-[#003366]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">D.U. Totais (Mês)</label>
                            <input type="number" min="1" max="31" value={totalDays} onChange={(e) => setTotalDays(e.target.value)}
                                className="p-3 w-full border border-slate-300 rounded-lg text-center font-bold text-[#003366] focus:outline-none focus:border-[#003366]" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 italic">* Usado para cálculo de projeção do mês corrente.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <label className={`cursor-pointer bg-[#003366] text-white px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isHomolog ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002244]'}`}>
                        <Cloud size={20} /> Publicar na Nuvem (Oficial)
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFile(e, 'cloud')} disabled={isHomolog} />
                    </label>
                    <label className="cursor-pointer bg-white border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                        <Eye size={20} /> Simular Visualização (Local)
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFile(e, 'local')} />
                    </label>
                </div>
                {status !== 'idle' && <p className={`mt-4 font-bold ${status.includes('success') ? 'text-green-600' : 'text-blue-600'}`}>{statusMsg}</p>}
            </Card>
        </div>
    );
};
