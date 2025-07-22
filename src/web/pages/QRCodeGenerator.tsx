import { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import Default from "../layouts/Default";

const SIZES = [
  { label: "100x100", value: "100x100" },
  { label: "200x200 (padrão)", value: "200x200" },
  { label: "300x300", value: "300x300" },
  { label: "400x400", value: "400x400" },
  { label: "500x500", value: "500x500" },
];

export default function QRCodeGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState("200x200");
  const [showQR, setShowQR] = useState(false);
  const [qrText, setQrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [margin, setMargin] = useState(1);
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const qrSVGRef = useRef<HTMLDivElement>(null);

  const width = parseInt(size.split("x")[0]);
  const height = parseInt(size.split("x")[1]);

  const handleGenerate = () => {
    setShowQR(false);
    setLoading(true);
    setQrText(text);
    setTimeout(() => {
      setLoading(false);
      setShowQR(true);
    }, 300); // Simula carregamento
  };

  const handleDownload = async (format: string) => {
    if (format === "png" || format === "webp") {
      if (!qrCanvasRef.current) return;
      const qrNode = qrCanvasRef.current.querySelector("canvas");
      if (!qrNode) return;
      const canvas = qrNode as HTMLCanvasElement;
      const url = canvas.toDataURL(format === "webp" ? "image/webp" : "image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else if (format === "svg") {
      if (!qrSVGRef.current) return;
      const qrNode = qrSVGRef.current.querySelector("svg");
      if (!qrNode) return;
      const svg = qrNode as SVGElement;
      const source = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([source], { type: "image/svg+xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <Default pageTitle="Gerador de QR Code">
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-6 text-center">Gerador de QR Code</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Texto ou link para gerar o QR Code</label>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Digite o texto ou link aqui..."
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tamanho</label>
            <select
              value={size}
              onChange={e => setSize(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
            >
              {SIZES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tamanho da margem</label>
            <input
              type="number"
              value={margin}
              onChange={e => setMargin(parseInt(e.target.value) || 0)}
              placeholder="0"
              min={0}
              max={5}
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!text.trim()}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200 text-lg font-semibold disabled:opacity-60"
          >
            Gerar QR Code
          </button>
        </div>

        {(loading || (showQR && qrText.trim())) && (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-center">QR Code Gerado</h3>
            {loading && (
              <div className={`flex flex-col items-center justify-center mb-4 h-full w-full`}>
                <svg className="animate-spin h-8 w-8 text-blue-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="text-blue-300">Carregando QR Code...</span>
              </div>
            )}
            {qrText.trim() && (
              <>
                {/* Canvas para PNG/WebP */}
                <div ref={qrCanvasRef} style={{ display: 'none' }}>
                  <QRCodeCanvas
                    value={qrText}
                    size={width}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q"
                    marginSize={margin}
                    includeMargin={true}
                  />
                </div>
                {/* SVG para SVG */}
                <div ref={qrSVGRef} style={{ display: 'none' }}>
                  <QRCodeSVG
                    value={qrText}
                    size={width}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q"
                    marginSize={margin}
                    includeMargin={true}
                  />
                </div>
                {/* Exibição normal (Canvas) */}
                <div className={` mb-5 ${loading ? 'hidden' : ''}`}
                  style={{ width, height, display: loading ? 'none' : undefined }}>
                  <QRCodeCanvas
                    value={qrText}
                    size={width}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q"
                    marginSize={margin}
                    includeMargin={true}
                  />
                </div>
              </>
            )}
            {!loading && showQR && qrText.trim() && (
              <>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => handleDownload("svg")}
                    className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer transition-colors duration-200 text-lg font-semibold"
                  >
                    Baixar SVG
                  </button>
                  <button
                    onClick={() => handleDownload("webp")}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition-colors duration-200 text-lg font-semibold"
                  >
                    Baixar WebP
                  </button>
                  <button
                    onClick={() => handleDownload("png")}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200 text-lg font-semibold"
                  >
                    Baixar PNG
                  </button>
                </div>
                <div className="text-center text-gray-300 text-sm break-all">
                  <span className="font-semibold">Este QR Code leva para:</span><br />
                  {qrText}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Default>
  );
} 