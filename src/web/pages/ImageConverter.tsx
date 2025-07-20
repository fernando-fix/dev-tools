import { useState, useRef, useEffect } from "react";
import Default from "../layouts/Default";

interface ImageData {
    img: HTMLImageElement;
    nomeArquivo: string;
    extension: string;
    fileSize: number;
}

interface FileSizes {
    original: {
        png: string;
        jpeg: string;
        webp: string;
    };
    effect: {
        png: string;
        jpeg: string;
        webp: string;
    };
}

export default function ImageConverter() {
    const [imagensCarregadas, setImagensCarregadas] = useState<ImageData[]>([]);
    const [imagemSelecionadaIndex, setImagemSelecionadaIndex] = useState<number>(0);
    const [effectType, setEffectType] = useState<string>("pixel");
    const [effectLevel, setEffectLevel] = useState<number>(24);
    const [quality, setQuality] = useState<number>(90);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [fileSizes, setFileSizes] = useState<FileSizes>({
        original: { png: "0 KB", jpeg: "0 KB", webp: "0 KB" },
        effect: { png: "0 KB", jpeg: "0 KB", webp: "0 KB" }
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const originalCanvasRef = useRef<HTMLCanvasElement>(null);
    const effectCanvasRef = useRef<HTMLCanvasElement>(null);

    const formatFileSize = (bytes: number): string => {
        return (bytes / 1024).toFixed(2) + " KB";
    };

    const atualizarDownloadTamanhos = (canvas: HTMLCanvasElement, prefix: 'original' | 'effect') => {
        const qualityValue = quality / 100;
        const formats = ['png', 'jpeg', 'webp'] as const;
        
        formats.forEach(format => {
            const mimeType = (format === "jpeg") ? "image/jpeg" : "image/" + format;
            const qualityParam = (format === "png") ? undefined : qualityValue;
            
            canvas.toBlob(blob => {
                if (blob) {
                    const size = formatFileSize(blob.size);
                    setFileSizes(prev => ({
                        ...prev,
                        [prefix]: {
                            ...prev[prefix],
                            [format]: size
                        }
                    }));
                }
            }, mimeType, qualityParam);
        });
    };

    const handleFileSelect = (files: FileList) => {
        const filesArray = Array.from(files);
        const novasImagens: ImageData[] = [];

        let loadedCount = 0;
        filesArray.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const nomeArquivo = file.name.split(".").slice(0, -1).join(".");
                    const extension = file.name.split(".").pop() || "";
                    const fileSize = file.size;
                    novasImagens.push({ img, nomeArquivo, extension, fileSize });
                    loadedCount++;
                    if (loadedCount === filesArray.length) {
                        // Se o input não tem imagens ainda, sobrescreve. Se já tem, concatena.
                        setImagensCarregadas(prev => {
                            const resultado = prev.length === 0 ? novasImagens : [...prev, ...novasImagens];
                            setImagemSelecionadaIndex(resultado.length - 1); // Seleciona a última imagem adicionada
                            return resultado;
                        });
                    }
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            handleFileSelect(e.target.files);
        }
    };

    const selecionarImagem = (index: number) => {
        setImagemSelecionadaIndex(index);
    };

    const excluirImagem = (index: number) => {
        const novasImagens = imagensCarregadas.filter((_, i) => i !== index);
        setImagensCarregadas(novasImagens);
        
        if (novasImagens.length > 0) {
            if (imagemSelecionadaIndex >= novasImagens.length) {
                setImagemSelecionadaIndex(0);
            }
        } else {
            setImagemSelecionadaIndex(0);
        }
    };

    const desenharImagemComQualidade = (img: HTMLImageElement, extension: string) => {
        const canvas = originalCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (["png", "webp", "svg"].includes(extension.toLowerCase())) {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            atualizarDownloadTamanhos(canvas, 'original');
        } else {
            const qualityValue = quality / 100;
            const offscreen = document.createElement("canvas");
            offscreen.width = img.width;
            offscreen.height = img.height;
            const offCtx = offscreen.getContext("2d");
            if (offCtx) {
                offCtx.drawImage(img, 0, 0, img.width, img.height);
                const dataUrl = offscreen.toDataURL("image/jpeg", qualityValue);
                const newImg = new Image();
                newImg.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(newImg, 0, 0, canvas.width, canvas.height);
                    atualizarDownloadTamanhos(canvas, 'original');
                };
                newImg.src = dataUrl;
            }
        }
    };

    const pixelarImagem = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tamanhoPixel: number, img: HTMLImageElement) => {
        const width = canvas.width;
        const height = canvas.height;
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y += tamanhoPixel) {
            for (let x = 0; x < width; x += tamanhoPixel) {
                const index = (y * width + x) * 4;
                const red = data[index];
                const green = data[index + 1];
                const blue = data[index + 2];
                const alpha = data[index + 3];
                ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
                ctx.fillRect(x, y, tamanhoPixel, tamanhoPixel);
            }
        }
    };

    const blurarImagem = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, blurLevel: number, img: HTMLImageElement) => {
        ctx.filter = `blur(${blurLevel / 10}px)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
    };

    const pixelarCinzaImagem = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tamanhoPixel: number, img: HTMLImageElement) => {
        pixelarImagem(ctx, canvas, tamanhoPixel, img);
        let pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pdata = pixelData.data;
        
        for (let i = 0; i < pdata.length; i += 4) {
            const gray = 0.3 * pdata[i] + 0.59 * pdata[i + 1] + 0.11 * pdata[i + 2];
            pdata[i] = gray;
            pdata[i + 1] = gray;
            pdata[i + 2] = gray;
        }
        ctx.putImageData(pixelData, 0, 0);
    };

    const blurCinzaImagem = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, blurLevel: number, img: HTMLImageElement) => {
        blurarImagem(ctx, canvas, blurLevel, img);
        let pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = pixelData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        ctx.putImageData(pixelData, 0, 0);
    };

    const aplicarEfeito = () => {
        if (imagensCarregadas.length === 0) return;
        
        const canvas = effectCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const { img } = imagensCarregadas[imagemSelecionadaIndex];
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        switch (effectType) {
            case "pixel":
                pixelarImagem(ctx, canvas, effectLevel, img);
                break;
            case "blur":
                blurarImagem(ctx, canvas, effectLevel, img);
                break;
            case "pixelGray":
                pixelarCinzaImagem(ctx, canvas, effectLevel, img);
                break;
            case "blurGray":
                blurCinzaImagem(ctx, canvas, effectLevel, img);
                break;
        }
        
        atualizarDownloadTamanhos(canvas, 'effect');
    };

    const baixarImagem = (format: string, efeito: boolean) => {
        const canvas = efeito ? effectCanvasRef.current : originalCanvasRef.current;
        if (!canvas || imagensCarregadas.length === 0) return;
        
        const { nomeArquivo } = imagensCarregadas[imagemSelecionadaIndex];
        const qualityValue = quality / 100;
        const filename = efeito
            ? `${nomeArquivo}.${format}.blur.${format}`
            : `${nomeArquivo}.${format}`;
        
        const link = document.createElement("a");
        if (format === "webp") {
            link.href = canvas.toDataURL("image/webp", qualityValue);
        } else {
            link.href = canvas.toDataURL(`image/${format}`, qualityValue);
        }
        link.download = filename;
        link.click();
    };

    const baixarTodasImagens = (format: string, efeito: boolean) => {
        imagensCarregadas.forEach((imageObj) => {
            const canvas = document.createElement("canvas");
            canvas.width = imageObj.img.width;
            canvas.height = imageObj.img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            
            if (efeito) {
                switch (effectType) {
                    case "pixel":
                        pixelarImagem(ctx, canvas, effectLevel, imageObj.img);
                        break;
                    case "blur":
                        blurarImagem(ctx, canvas, effectLevel, imageObj.img);
                        break;
                    case "pixelGray":
                        pixelarCinzaImagem(ctx, canvas, effectLevel, imageObj.img);
                        break;
                    case "blurGray":
                        blurCinzaImagem(ctx, canvas, effectLevel, imageObj.img);
                        break;
                }
            } else {
                if (["png", "webp", "svg"].includes(imageObj.extension.toLowerCase())) {
                    ctx.drawImage(imageObj.img, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.drawImage(imageObj.img, 0, 0, canvas.width, canvas.height);
                }
            }
            
            const qualityValue = quality / 100;
            const mimeType = (format === "jpeg") ? "image/jpeg" : "image/" + format;
            const dataUrl = canvas.toDataURL(mimeType, (format === "png" ? 1 : qualityValue));
            
            const filename = efeito
                ? `${imageObj.nomeArquivo}.${format}.blur.${format}`
                : `${imageObj.nomeArquivo}.${format}`;
            
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = filename;
            link.click();
        });
    };

    useEffect(() => {
        if (imagensCarregadas.length > 0) {
            const { img, extension } = imagensCarregadas[imagemSelecionadaIndex];
            desenharImagemComQualidade(img, extension);
            aplicarEfeito();
        }
    }, [imagensCarregadas, imagemSelecionadaIndex, quality, effectType, effectLevel]);

    const imagemAtual = imagensCarregadas[imagemSelecionadaIndex];

    return (
        <Default pageTitle="Conversor & Efeitos de Imagem">
            <div className="max-w-[1400px] mx-auto p-6">              

                {/* Área de upload */}
                <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700">
                    <div 
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                            isDragOver 
                                ? 'border-blue-400 bg-blue-900/20' 
                                : 'border-gray-600 hover:border-blue-500 hover:bg-gray-750'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <svg className={`w-16 h-16 transition-colors ${isDragOver ? 'text-blue-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <p className="text-xl font-medium mb-2">Arraste suas imagens aqui</p>
                                <p className="text-gray-400">ou clique para selecionar arquivos</p>
                            </div>
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            multiple 
                            className="hidden"
                            onChange={handleFileInputChange}
                        />
                    </div>
                </div>

                {/* Thumbnails */}
                {imagensCarregadas.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Imagens Carregadas ({imagensCarregadas.length})
                        </h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {imagensCarregadas.map((item, index) => (
                                <div key={index} className="relative group">
                                    <div className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                                        index === imagemSelecionadaIndex 
                                            ? 'border-blue-500 shadow-lg shadow-blue-500/25' 
                                            : 'border-gray-600 hover:border-gray-500'
                                    }`} onClick={() => selecionarImagem(index)}>
                                        <img
                                            src={item.img.src}
                                            alt={item.nomeArquivo}
                                            className="w-24 h-24 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                                    </div>
                                    <button
                                        className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-gray-800 rounded-full cursor-pointer w-6 h-6 text-xs hover:bg-red-600 transition-colors duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            excluirImagem(index);
                                        }}
                                        title="Remover imagem"
                                    >
                                        ×
                                    </button>
                                    <div className="text-center mt-2">
                                        <p className="text-xs text-gray-400 truncate w-24">{item.nomeArquivo}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(item.fileSize)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Controles */}
                {imagensCarregadas.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Configurações
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                        </svg>
                                        Efeito
                                    </label>
                                    <select 
                                        value={effectType}
                                        onChange={(e) => setEffectType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                                    >
                                        <option value="pixel">🎨 Efeito Pixel</option>
                                        <option value="blur">🌫️ Desfoque</option>
                                        <option value="pixelGray">⚫ Pixel Cinza</option>
                                        <option value="blurGray">🌫️ Desfoque Cinza</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                        </svg>
                                        Nível do Efeito: {effectLevel}
                                    </label>
                                    <input 
                                        type="range" 
                                        min="2" 
                                        max="50" 
                                        value={effectLevel}
                                        onChange={(e) => setEffectLevel(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Qualidade da Conversão: {quality}%
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={quality}
                                        onChange={(e) => setQuality(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Container de imagens */}
                {imagensCarregadas.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                        {/* Imagem Original */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Imagem Original
                                </h3>
                                {imagemAtual && (
                                    <p className="text-sm text-gray-400">
                                        {formatFileSize(imagemAtual.fileSize)} • {imagemAtual.extension.toUpperCase()}
                                    </p>
                                )}
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 mb-6">
                                <canvas 
                                    ref={originalCanvasRef}
                                    className="border border-gray-600 max-w-full max-h-80 mx-auto rounded"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => baixarImagem('png', false)}
                                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200 flex flex-col items-center gap-1"
                                >
                                    <span className="text-xs font-medium">PNG</span>
                                    <span className="text-xs text-blue-200">{fileSizes.original.png}</span>
                                </button>
                                <button 
                                    onClick={() => baixarImagem('jpeg', false)}
                                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200 flex flex-col items-center gap-1"
                                >
                                    <span className="text-xs font-medium">JPEG</span>
                                    <span className="text-xs text-blue-200">{fileSizes.original.jpeg}</span>
                                </button>
                                <button 
                                    onClick={() => baixarImagem('webp', false)}
                                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200 flex flex-col items-center gap-1"
                                >
                                    <span className="text-xs font-medium">WEBP</span>
                                    <span className="text-xs text-blue-200">{fileSizes.original.webp}</span>
                                </button>
                            </div>
                        </div>

                        {/* Imagem Modificada */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                    </svg>
                                    Imagem Modificada
                                </h3>
                                <p className="text-sm text-gray-400">Com efeito aplicado</p>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 mb-6">
                                <canvas 
                                    ref={effectCanvasRef}
                                    className="border border-gray-600 max-w-full max-h-80 mx-auto rounded"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => baixarImagem('png', true)}
                                    className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200 flex flex-col items-center gap-1"
                                >
                                    <span className="text-xs font-medium">PNG</span>
                                    <span className="text-xs text-green-200">{fileSizes.effect.png}</span>
                                </button>
                                <button 
                                    onClick={() => baixarImagem('jpeg', true)}
                                    className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200 flex flex-col items-center gap-1"
                                >
                                    <span className="text-xs font-medium">JPEG</span>
                                    <span className="text-xs text-green-200">{fileSizes.effect.jpeg}</span>
                                </button>
                                <button 
                                    onClick={() => baixarImagem('webp', true)}
                                    className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200 flex flex-col items-center gap-1"
                                >
                                    <span className="text-xs font-medium">WEBP</span>
                                    <span className="text-xs text-green-200">{fileSizes.effect.webp}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seção para baixar todas as imagens */}
                {imagensCarregadas.length > 1 && (
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-3">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download em Lote
                            </h3>
                            <p className="text-gray-400">Baixe todas as {imagensCarregadas.length} imagens de uma vez</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-750 rounded-lg p-6 border border-gray-600">
                                <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Imagens Originais
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => baixarTodasImagens('png', false)}
                                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
                                    >
                                        PNG
                                    </button>
                                    <button 
                                        onClick={() => baixarTodasImagens('jpeg', false)}
                                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
                                    >
                                        JPEG
                                    </button>
                                    <button 
                                        onClick={() => baixarTodasImagens('webp', false)}
                                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
                                    >
                                        WEBP
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-750 rounded-lg p-6 border border-gray-600">
                                <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                    </svg>
                                    Imagens Modificadas
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => baixarTodasImagens('png', true)}
                                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200"
                                    >
                                        PNG
                                    </button>
                                    <button 
                                        onClick={() => baixarTodasImagens('jpeg', true)}
                                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200"
                                    >
                                        JPEG
                                    </button>
                                    <button 
                                        onClick={() => baixarTodasImagens('webp', true)}
                                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200"
                                    >
                                        WEBP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Default>
    );
}