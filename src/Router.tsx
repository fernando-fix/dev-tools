import { Routes, Route } from 'react-router-dom';

import About from './web/pages/LoremGenerator';
import Home from './web/pages/Home';
import NotFound from './web/pages/NotFound';
import ImageConverter from './web/pages/ImageConverter';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gerador-de-lorem" element={<About />} />
      <Route path="/conversor-de-imagens" element={<ImageConverter />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Router;