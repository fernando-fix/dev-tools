import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, DragEvent } from "react";
import Default from "../layouts/Default";

const ImageResizer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [fileSizes, setFileSizes] = useState({ png: "", jpeg: "", webp: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(e.target?.result as string);
        setWidth(img.width);
        setHeight(img.height);
        originalImageRef.current = img;
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newWidth = parseInt(e.target.value, 10);
    if (isNaN(newWidth)) newWidth = 0;

    if (originalImageRef.current) {
      const maxWidth = originalImageRef.current.width * 2;
      const minWidth = Math.round(originalImageRef.current.width * 0.5);

      if (newWidth > maxWidth) newWidth = maxWidth;
      if (newWidth < minWidth && e.target.type === 'range') newWidth = minWidth; // Prevent slider from going below min

      setWidth(newWidth);

      if (keepAspectRatio) {
        const aspectRatio = originalImageRef.current.height / originalImageRef.current.width;
        const newHeight = Math.round(newWidth * aspectRatio);
        setHeight(newHeight);
      }
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newHeight = parseInt(e.target.value, 10);
    if (isNaN(newHeight)) newHeight = 0;

    if (originalImageRef.current) {
      const maxHeight = originalImageRef.current.height * 2;
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
      }

      setHeight(newHeight);

      if (keepAspectRatio) {
        const aspectRatio = originalImageRef.current.width / originalImageRef.current.height;
        const newWidth = Math.round(newHeight * aspectRatio);
        setWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (!originalImageRef.current) return;

    setIsLoading(true);
    const handler = setTimeout(() => {
      resizeImage();
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [width, height]);

    const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 KB";
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const calculateFileSizes = (canvas: HTMLCanvasElement) => {
    const qualityValue = 0.9; // Default quality for jpeg/webp
    const formats = ['png', 'jpeg', 'webp'] as const;
    
    formats.forEach(format => {
      const mimeType = `image/${format}`;
      const qualityParam = format === 'png' ? undefined : qualityValue;
      
      canvas.toBlob(blob => {
        if (blob) {
          const size = formatFileSize(blob.size);
          setFileSizes(prev => ({ ...prev, [format]: size }));
        }
      }, mimeType, qualityParam);
    });
  };

  const resizeImage = () => {
    if (!originalImageRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(originalImageRef.current, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/png');
      setResizedImage(dataUrl);
      calculateFileSizes(canvas);
    }
  };

  return (
    <Default>
      <div className="p-4 md:p-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Redimensionador de Imagens</h1>
        
        <div 
          className="w-full h-64 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Arraste e solte uma imagem aqui, ou clique para selecionar.
          <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        {image && (
          <div className="flex flex-col gap-8 mt-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Configurações</h2>
              <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg items-center">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <label htmlFor="width">Largura:</label>
                    <input type="number" id="width" value={width} onChange={handleWidthChange} className="p-2 border rounded-md w-24" />
                  </div>
                  {keepAspectRatio && originalImageRef.current && (
                    <input
                      type="range"
                      min={originalImageRef.current ? Math.round(originalImageRef.current.width * 0.5) : 1}
                      max={originalImageRef.current.width * 2}
                      value={width}
                      onChange={handleWidthChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 w-full">
                  <label htmlFor="height">Altura:</label>
                  <input type="number" id="height" value={height} onChange={handleHeightChange} className="p-2 border rounded-md w-full" />
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <input type="checkbox" id="aspect-ratio" checked={keepAspectRatio} onChange={(e) => setKeepAspectRatio(e.target.checked)} />
                  <label htmlFor="aspect-ratio">Manter proporção</label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">Original</h2>
                <div className="relative w-full h-96 flex items-center justify-center border rounded-lg bg-gray-50 overflow-hidden">
                  <img src={image} alt="Original" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Resultado</h2>
                {resizedImage && (
                  <div>
                    <div className="relative w-full h-96 flex items-center justify-center border rounded-lg bg-gray-50 overflow-hidden">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                          <div className="text-lg font-semibold">Carregando...</div>
                        </div>
                      )}
                      <img src={resizedImage} alt="Redimensionada" className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-50' : ''}`} />
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <h3 className="text-lg font-semibold">Baixar como:</h3>
                      <div className="flex gap-2 flex-wrap">
                        <a href={resizedImage} download={`imagem-redimensionada.png`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors text-sm">
                          PNG ({fileSizes.png})
                        </a>
                        <a href={resizedImage.replace("image/png", "image/jpeg")} download={`imagem-redimensionada.jpeg`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors text-sm">
                          JPEG ({fileSizes.jpeg})
                        </a>
                        <a href={resizedImage.replace("image/png", "image/webp")} download={`imagem-redimensionada.webp`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors text-sm">
                          WEBP ({fileSizes.webp})
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Default>
  );
};

export default ImageResizer;