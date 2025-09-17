import { useRef, useState, useEffect } from "react";
import Cropper from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
// Importando o CSS do cropper do diretório correto
import "react-cropper/node_modules/cropperjs/dist/cropper.min.css";
import Default from "../layouts/Default";

// Adicionando estilos globais inline para garantir que o cropper funcione corretamente
const cropperStyles = `
  .cropper-container {
    direction: ltr;
    font-size: 0;
    line-height: 0;
    position: relative;
    touch-action: none;
    -ms-touch-action: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  .cropper-container img {
    display: block;
    height: 100%;
    image-orientation: 0deg;
    max-height: none !important;
    max-width: none !important;
    min-height: 0 !important;
    min-width: 0 !important;
    width: 100%;
  }
`;

type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function ImageCropper() {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, width: 0, height: 0 });
  
  // Adicionando estilos ao montar o componente
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = cropperStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  const handleCropDataChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CropData) => {
    const value = parseInt(e.target.value, 10) || 0;
    const newCropData = { ...cropData, [field]: value };
    setCropData(newCropData);
    
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.setData(newCropData);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(e.target?.result as string);
        setCroppedImage(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleCrop = () => {
    if (cropperRef.current?.cropper) {
      setIsLoading(true);
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      if (canvas) {
        setCroppedImage(canvas.toDataURL("image/png"));
      }
      setIsLoading(false);
    }
  };

  const onCrop = () => {
    if (cropperRef.current?.cropper) {
      const data = cropperRef.current.cropper.getData(true);
      setCropData({
        x: Math.round(data.x),
        y: Math.round(data.y),
        width: Math.round(data.width),
        height: Math.round(data.height)
      });
    }
  };

  return (
    <Default pageTitle="Recortar Imagem">
      <div className="p-4 md:p-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Cortador de Imagens</h1>
        
        {/* Área de Upload */}
        <div 
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:transition-colors backdrop-blur-sm"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleImageUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600">Arraste e solte uma imagem aqui, ou clique para selecionar.</p>
          <p className="text-sm text-gray-400 mt-1">Formatos suportados: JPG, PNG, WEBP</p>
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        {image && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
            {/* Coluna 1: Área de Corte */}
            <div className="lg:col-span-7 backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-white">Selecionar área de corte</h2>
              <div className="w-full h-[500px] rounded-lg overflow-hidden bg-gray-100">
                <Cropper
                  src={image}
                  style={{ height: '100%', width: '100%' }}
                  initialAspectRatio={1}
                  guides={true}
                  crop={onCrop}
                  ref={cropperRef}
                  viewMode={1}
                  background={false}
                  responsive={true}
                  autoCrop={true}
                  autoCropArea={1}
                  checkOrientation={false}
                  restore={false}
                  zoomable={true}
                  zoomOnTouch={true}
                  zoomOnWheel={true}
                  dragMode="move"
                  minCropBoxWidth={50}
                  minCropBoxHeight={50}
                />
              </div>
            </div>

            {/* Coluna 2: Opções de Corte */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-white mb-3">Ajustes</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="crop-x" className="block text-sm font-medium text-gray-700 mb-1">Posição X</label>
                    <input 
                      type="number" 
                      id="crop-x" 
                      value={cropData.x} 
                      onChange={e => handleCropDataChange(e, 'x')} 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="crop-y" className="block text-sm font-medium text-gray-700 mb-1">Posição Y</label>
                    <input 
                      type="number" 
                      id="crop-y" 
                      value={cropData.y} 
                      onChange={e => handleCropDataChange(e, 'y')} 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="crop-width" className="block text-sm font-medium text-gray-700 mb-1">Largura</label>
                    <input 
                      type="number" 
                      id="crop-width" 
                      value={cropData.width} 
                      onChange={e => handleCropDataChange(e, 'width')} 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="50"
                    />
                  </div>
                  <div>
                    <label htmlFor="crop-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                    <input 
                      type="number" 
                      id="crop-height" 
                      value={cropData.height} 
                      onChange={e => handleCropDataChange(e, 'height')} 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="50"
                    />
                  </div>
                </div>
                
                <button
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleCrop}
                >
                  Aplicar Corte
                </button>
              </div>
            </div>

            {/* Coluna 3: Prévia */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-white">Prévia</h2>
                <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-gray-700 font-medium">Processando...</p>
                      </div>
                    </div>
                  )}
                  {croppedImage ? (
                    <img 
                      src={croppedImage} 
                      alt="Imagem cortada" 
                      className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-30' : ''}`} 
                    />
                  ) : (
                    <div className="text-center p-6 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">A imagem cortada será exibida aqui</p>
                    </div>
                  )}
                </div>
                
                {croppedImage && (
                  <div className="mt-4">
                    <a 
                      href={croppedImage} 
                      download="imagem-cortada.png" 
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Baixar Imagem
                    </a>
                    
                    <div className="mt-2 text-center text-xs text-gray-500">
                      {croppedImage && (
                        <span>Tamanho: {Math.round(croppedImage.length * 0.00075)} KB</span>
                      )}
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
}