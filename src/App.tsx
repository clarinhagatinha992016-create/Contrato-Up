import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Music, 
  Calendar, 
  Users, 
  Award, 
  User, 
  Printer, 
  FileText,
  CheckCircle2,
  DollarSign,
  PenTool
} from 'lucide-react';

type PlanType = 'Básico' | 'Intermediário' | 'Avançado' | 'Premium' | 'Personalizado';

export default function App() {
  const [artistName, setArtistName] = useState('');
  const [plan, setPlan] = useState<PlanType>('Básico');
  const [promotersCount, setPromotersCount] = useState<number | string>(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [contractValue, setContractValue] = useState('');
  
  const sigPad = useRef<SignatureCanvas>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const clearSignature = () => {
    sigPad.current?.clear();
    setSignatureUrl(null);
  };

  const saveSignature = () => {
    if (sigPad.current?.isEmpty()) {
      setSignatureUrl(null);
    } else {
      setSignatureUrl(sigPad.current?.getCanvas().toDataURL('image/png') || null);
    }
  };

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      // Find the hidden signature and temporarily make it visible for the canvas
      const signatureContainer = element.querySelector('.print-only');
      if (signatureContainer) {
        signatureContainer.classList.remove('hidden');
        signatureContainer.classList.add('grid');
      }

      // Add PDF mode class to apply white background, black colored text, etc.
      element.classList.add('pdf-mode');

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Cleanup DOM changes
      element.classList.remove('pdf-mode');
      if (signatureContainer) {
        signatureContainer.classList.add('hidden');
        signatureContainer.classList.remove('grid');
      }

      // We calculate sizes to keep it roughly A4 portrait sized relative to width
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`contrato-${artistName.trim().replace(/\s+/g, '-').toLowerCase() || 'up-music'}.pdf`);

    } catch (error) {
      console.error("Error generating PDF", error);
      // Ensure cleanup if fails
      element.classList.remove('pdf-mode');
      const signatureContainer = element.querySelector('.print-only');
      if (signatureContainer) {
        signatureContainer.classList.add('hidden');
        signatureContainer.classList.remove('grid');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDateFallback = (dateString: string) => {
    if (!dateString) return 'Não definida';
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans p-4 md:p-8 flex flex-col">
      
      {/* Header - Hidden on Print */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-[#222] pb-6 no-print w-full max-w-6xl mx-auto gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-white tracking-tighter flex items-center gap-3">
            <Music className="w-8 h-8 text-[#D4AF37]" />
            UP Music Agency
          </h1>
          <p className="text-[#888] text-xs uppercase tracking-[0.2em] mt-1">Gerador de Contratos e Promoção</p>
        </div>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={`flex items-center justify-center gap-2 bg-transparent border border-[#444] text-[#888] font-bold px-6 py-3 rounded uppercase text-[10px] tracking-widest transition-colors ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:text-white hover:border-white'}`}
        >
          <Printer className="w-4 h-4" />
          <span>{isGenerating ? 'Gerando...' : 'Download PDF Automático'}</span>
        </button>
      </header>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        
        {/* Editor Form - Hidden on Print */}
        <div className="bg-[#141414] border border-[#222] rounded-lg p-6 md:p-8 no-print flex flex-col gap-6">
          <h2 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Detalhes do Contrato
          </h2>
          
          <div className="space-y-6">
            {/* Artista */}
            <div>
              <label className="text-[10px] text-[#555] uppercase block mb-1 flex items-center gap-2">
                <User className="w-3 h-3" />
                Nome do Artista / Banda
              </label>
              <input 
                type="text" 
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Ex: Marina Vicenzo"
                className="w-full bg-transparent border-b border-[#333] py-2 text-xl font-serif focus:outline-none focus:border-[#D4AF37] placeholder-[#333] text-white transition-colors"
              />
            </div>

            {/* Plano */}
            <div>
              <label className="text-[10px] text-[#555] uppercase block mb-1 flex items-center gap-2">
                <Award className="w-3 h-3" />
                Plano Selecionado
              </label>
              <div className="relative">
                <select 
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanType)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#D4AF37] transition-all"
                >
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Premium">Premium</option>
                  <option value="Personalizado">Personalizado</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#555]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="text-[10px] text-[#555] uppercase block mb-1 flex items-center gap-2">
                <DollarSign className="w-3 h-3" />
                Valor do Contrato (Opcional)
              </label>
              <input 
                type="text" 
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
                placeholder="Ex: R$ 5.000,00"
                className="w-full bg-[#0A0A0A] border border-[#333] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
              />
            </div>

            {/* Divulgadores */}
            <div>
              <label className="text-[10px] text-[#555] uppercase block mb-1 flex items-center gap-2">
                <Users className="w-3 h-3" />
                Quantidade de Divulgadores
              </label>
              <input 
                type="number" 
                min="1"
                value={promotersCount}
                onChange={(e) => setPromotersCount(e.target.value)}
                placeholder="Ex: 25"
                className="w-full bg-[#0A0A0A] border border-[#333] p-3 text-xl font-mono text-[#D4AF37] focus:outline-none focus:border-[#D4AF37] rounded transition-colors"
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#555] uppercase block mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Data de Início
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] p-3 text-sm rounded text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#555] uppercase block mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Data de Término
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] p-3 text-sm rounded text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            {/* Assinatura */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] text-[#555] uppercase flex items-center gap-2">
                  <PenTool className="w-3 h-3" />
                  Assinatura Digital (Cliente)
                </label>
                <button onClick={clearSignature} className="text-[10px] text-[#888] hover:text-white uppercase px-2 py-1 rounded transition-colors border border-transparent hover:border-[#333]">
                  Limpar
                </button>
              </div>
              <div className="bg-white rounded border border-[#333] overflow-hidden">
                <SignatureCanvas 
                  ref={sigPad}
                  penColor="black"
                  canvasProps={{className: "w-full h-32"}}
                  onEnd={saveSignature}
                />
              </div>
              <p className="text-[#555] text-[10px] mt-2 italic text-right">Opcional - Assine na área branca acima</p>
            </div>
          </div>
        </div>

        {/* Contract Preview - Displayed on Print */}
        <div ref={pdfRef} className="bg-[#141414] border border-[#222] text-[#E0E0E0] rounded-lg p-8 lg:p-10 shadow-2xl print-container relative overflow-hidden flex flex-col">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-4 opacity-5 no-print pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Preview Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#222] pb-6 mb-8 print-border-dark">
              <div>
                <p className="text-[#D4AF37] font-bold tracking-widest text-[10px] uppercase mb-1">Resumo Executivo</p>
                <h2 className="text-3xl font-serif italic text-white tracking-tighter">UP Music Agency</h2>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <p className="text-[#666] text-[10px] uppercase tracking-widest">Emissão</p>
                <p className="font-mono text-[#D4AF37] text-sm">{format(new Date(), "dd/MM/yyyy")}</p>
              </div>
            </div>

            {/* Contract Info */}
            <div className="space-y-8 flex-grow">
              
              <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded print-bg-transparent print-border-dark">
                <p className="text-[#555] text-[10px] uppercase mb-1">Contratante / Artista</p>
                <p className="text-2xl font-serif text-white">
                  {artistName || <span className="text-[#333] italic">Nome não informado</span>}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1 text-[#666]">
                    <Award className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-widest">Plano Contratado</span>
                  </div>
                  <p className="text-lg font-medium text-white">
                    {plan}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 text-[#666]">
                    <Users className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-widest">Equipe Alocada</span>
                  </div>
                  <p className="text-lg font-mono text-[#D4AF37]">
                    {promotersCount || 0} <span className="text-sm font-sans text-[#888]">{Number(promotersCount) === 1 ? 'membro' : 'membros'}</span>
                  </p>
                </div>

                {contractValue && (
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t border-[#222] print-border-dark">
                    <div className="flex items-center gap-2 mb-1 text-[#666]">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-widest">Investimento / Valor do Serviço</span>
                    </div>
                    <p className="text-2xl font-mono text-[#D4AF37]">
                      {contractValue}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#222] pt-6 print-border-dark">
                <h3 className="text-[10px] text-[#888] uppercase tracking-widest mb-4">Vigência</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[#555] text-[10px] uppercase tracking-widest mb-1">Início</p>
                    <p className="text-sm font-medium text-white">
                      {formatDateFallback(startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#555] text-[10px] uppercase tracking-widest mb-1">Término</p>
                    <p className="text-sm font-medium text-white">
                      {formatDateFallback(endDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#1A1812] border border-[#D4AF37]/30 p-5 rounded flex items-start gap-4 print-bg-transparent print-border-dark">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#D4AF37] text-sm mb-1 uppercase tracking-wider">Aprovação Pendente</h4>
                  <p className="text-[#888] text-xs leading-relaxed italic font-serif">
                    As condições descritas acima representam o acordo de prestação de serviços de divulgação da UP Music Agency. Aguardando assinatura para efetivação do contrato.
                  </p>
                </div>
              </div>

            </div>
            
            {/* Signature lines */}
            <div className="mt-auto pt-16 grid grid-cols-2 gap-8 text-center text-xs print-only hidden">
              <div>
                {signatureUrl ? (
                  <div className="flex flex-col items-center justify-end h-16 w-full mb-2">
                    <img src={signatureUrl} alt="Assinatura" className="max-h-16 object-contain filter invert opacity-90 print:filter-none print:opacity-100 mix-blend-screen print:mix-blend-normal" />
                    <div className="border-t border-[#444] w-full print-border-dark mt-1"></div>
                  </div>
                ) : (
                  <div className="border-t border-[#222] w-full mb-2 print-border-dark mt-16"></div>
                )}
                <p className="font-bold text-white print:text-black">{artistName || 'Contratante'}</p>
                <p className="text-[#666] tracking-widest uppercase text-[10px] mt-1">Artista Representado</p>
              </div>
              <div>
                <div className="border-t border-[#222] w-full mb-2 print-border-dark mt-16"></div>
                <p className="font-bold text-white print:text-black">UP Music Agency</p>
                <p className="text-[#666] tracking-widest uppercase text-[10px] mt-1">Gestão e Promoção</p>
              </div>
            </div>
            
          </div>
        </div>

      </div>
      
      <footer className="mt-8 flex justify-between items-center text-[10px] text-[#444] tracking-widest uppercase max-w-6xl mx-auto w-full no-print">
        <div>UP Music Agency &copy; {new Date().getFullYear()}</div>
        <div className="flex gap-6">
          <span className="hover:text-white transition-colors cursor-pointer">Termos</span>
          <span className="hover:text-white transition-colors cursor-pointer">Privacidade</span>
        </div>
      </footer>
    </div>
  );
}
