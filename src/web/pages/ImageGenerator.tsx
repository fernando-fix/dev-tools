import React, { useState, useRef } from "react";
import Default from "../layouts/Default";

const EXTENSOES = ["webp", "png", "jpg", "jpeg", "svg"];
const COR_PADRAO_BG = "#cccccc";
const COR_PADRAO_TEXTO = "#222222";

export default function ImageGenerator() {
    const [largura, setLargura] = useState(200);
    const [altura, setAltura] = useState(200);
    const [bgColor, setBgColor] = useState(COR_PADRAO_BG);
    const [textColor, setTextColor] = useState(COR_PADRAO_TEXTO);
    const [extensao, setExtensao] = useState("webp");
    const [quality, setQuality] = useState(100);
    const [downloadSize, setDownloadSize] = useState<string>("0 KB");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Cálculo proporcional do tamanho da fonte
    const fontSize = Math.max(10, Math.floor(Math.min(largura, altura) / 4));

    // Gera SVG string
    const gerarSVG = () => {
        const texto = `${largura}x${altura}`;
        return `<?xml version='1.0' encoding='UTF-8'?>\n<svg viewBox='0 0 ${largura} ${altura}' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='${bgColor}'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-size='${fontSize}' fill='${textColor}' font-family='Arial, sans-serif'>${texto}</text></svg>`;
    };

    // Desenha no canvas
    const desenharCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, largura, altura);
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(`${largura}x${altura}`, largura / 2, altura / 2);
    };

    React.useEffect(() => {
        if (extensao !== "svg") {
            desenharCanvas();
        }
    }, [largura, altura, bgColor, textColor, extensao]);

    // Função para formatar tamanho
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Atualiza o tamanho do arquivo de download sempre que muda
    React.useEffect(() => {
        if (extensao === "svg") {
            const svg = gerarSVG();
            const blob = new Blob([svg], { type: "image/svg+xml" });
            setDownloadSize(formatFileSize(blob.size));
        } else {
            const canvas = canvasRef.current;
            if (!canvas) {
                setDownloadSize("0 KB");
                return;
            }
            let mime = "image/webp";
            if (extensao === "png") mime = "image/png";
            if (extensao === "jpg" || extensao === "jpeg") mime = "image/jpeg";
            const qualityValue = ["webp","jpg","jpeg"].includes(extensao) ? quality / 100 : undefined;
            canvas.toBlob((blob) => {
                if (!blob) {
                    setDownloadSize("0 KB");
                    return;
                }
                setDownloadSize(formatFileSize(blob.size));
            }, mime, qualityValue);
        }
    }, [largura, altura, bgColor, textColor, extensao, quality]);

    // Download
    const baixar = () => {
        if (extensao === "svg") {
            const svg = gerarSVG();
            const blob = new Blob([svg], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${largura}x${altura}.svg`;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            const canvas = canvasRef.current;
            if (!canvas) return;
            let mime = "image/webp";
            if (extensao === "png") mime = "image/png";
            if (extensao === "jpg" || extensao === "jpeg") mime = "image/jpeg";
            const qualityValue = ["webp","jpg","jpeg"].includes(extensao) ? quality / 100 : undefined;
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${largura}x${altura}.${extensao}`;
                link.click();
                URL.revokeObjectURL(url);
            }, mime, qualityValue);
        }
    };

    // Função para gerar cor aleatória em hex
    const gerarCorAleatoria = () => {
        const hex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        setBgColor(hex);
    };
    const gerarCorTextoAleatoria = () => {
        const hex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        setTextColor(hex);
    };

    // Calcula o tamanho máximo de visualização mantendo proporção
    const MAX_DIM = 400; // px
    let previewWidth = MAX_DIM;
    let previewHeight = Math.round((altura / largura) * MAX_DIM);
    if (previewHeight > MAX_DIM) {
        previewHeight = MAX_DIM;
        previewWidth = Math.round((largura / altura) * MAX_DIM);
    }

    return (
        <Default pageTitle="Gerador de Imagem Placeholder">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Bloco de controles */}
                    <div className="bg-gray-800 rounded-xl p-8 mb-8 md:mb-0 border border-gray-700 flex-1 max-w-xl w-full">
                        <h2 className="text-xl font-bold mb-6 text-center">Gerador de Imagem Placeholder</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Largura (px)</label>
                                <input type="number" min={1} max={2000} value={largura} onChange={e => setLargura(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Altura (px)</label>
                                <input type="number" min={1} max={2000} value={altura} onChange={e => setAltura(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Cor de Fundo</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 p-0 border-none bg-transparent" />
                                    <input
                                        type="text"
                                        value={bgColor}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) setBgColor(val);
                                        }}
                                        maxLength={7}
                                        className="w-20 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm font-mono"
                                        style={{ textTransform: 'lowercase' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={gerarCorAleatoria}
                                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 hover:bg-blue-600 hover:text-white transition-colors"
                                        title="Cor aleatória"
                                    >🎲</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Cor do Texto</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-10 h-10 p-0 border-none bg-transparent" />
                                    <input
                                        type="text"
                                        value={textColor}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) setTextColor(val);
                                        }}
                                        maxLength={7}
                                        className="w-20 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm font-mono"
                                        style={{ textTransform: 'lowercase' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={gerarCorTextoAleatoria}
                                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 hover:bg-blue-600 hover:text-white transition-colors"
                                        title="Cor aleatória"
                                    >🎲</button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Extensão</label>
                                <select value={extensao} onChange={e => setExtensao(e.target.value)} className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white">
                                    {EXTENSOES.map(ext => <option key={ext} value={ext}>{ext.toUpperCase()}</option>)}
                                </select>
                            </div>
                            {['webp','jpg','jpeg'].includes(extensao) && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Qualidade: {quality}%</label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={quality}
                                        onChange={e => setQuality(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                            )}
                        </div>
                        <button onClick={baixar} className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200 text-lg font-semibold">Salvar Imagem</button>
                        <div className="text-center text-xs text-gray-400 mt-2">Tamanho do arquivo: {downloadSize}</div>
                    </div>
                    {/* Bloco de pré-visualização */}
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 flex-1 flex flex-col items-center justify-center min-w-[220px]">
                        <h3 className="text-lg font-semibold mb-4">Pré-visualização</h3>
                        <div className="flex items-center justify-center w-full h-full" style={{ minHeight: 220 }}>
                            {extensao === "svg" ? (
                                <div
                                    style={{
                                        width: previewWidth,
                                        height: previewHeight,
                                        maxWidth: "100%",
                                        maxHeight: MAX_DIM,
                                        display: "block",
                                        borderRadius: 8,
                                        border: "1px solid #444",
                                        background: bgColor,
                                        overflow: "hidden"
                                    }}
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: gerarSVG() }}
                                        style={{ width: "100%", height: "100%", display: "block" }}
                                    />
                                </div>
                            ) : (
                                <canvas
                                    ref={canvasRef}
                                    style={{
                                        width: previewWidth,
                                        height: previewHeight,
                                        maxWidth: "100%",
                                        maxHeight: MAX_DIM,
                                        borderRadius: 8,
                                        border: "1px solid #444",
                                        background: bgColor
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Default>
    );
} 