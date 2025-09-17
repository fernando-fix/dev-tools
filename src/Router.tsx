import { Routes, Route } from 'react-router-dom';

import About from './web/pages/LoremGenerator';
import Home from './web/pages/Home';
import NotFound from './web/pages/NotFound';
import ImageConverter from './web/pages/ImageConverter';
import Base64 from './web/pages/Base64';
import ImageGenerator from './web/pages/ImageGenerator';
import TikTokDownloader from './web/pages/TikTokDownloader';
import QRCodeGenerator from './web/pages/QRCodeGenerator';
import ImageResizer from './web/pages/ImageResizer';
import ImageCropper from './web/pages/ImageCropper';
import WppLinkGenerator from './web/pages/WppLinkGenerator';
import CpfCnpjGenerator from './web/pages/CpfCnpjGenerator';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gerador-de-lorem" element={<About />} />
      <Route path="/conversor-de-imagens" element={<ImageConverter />} />
      <Route path="/base64" element={<Base64 />} />
      <Route path="/gerador-de-imagem" element={<ImageGenerator />} />
      <Route path="/baixar-tiktok" element={<TikTokDownloader />} />
      <Route path="/qrcode" element={<QRCodeGenerator />} />
      <Route path="/redimensionar-imagem" element={<ImageResizer />} />
      <Route path="/recortar-imagem" element={<ImageCropper />} />
      <Route path="/gerador-de-link-wpp" element={<WppLinkGenerator />} />
      <Route path="/gerador-de-cpf-cnpj" element={<CpfCnpjGenerator />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Router;