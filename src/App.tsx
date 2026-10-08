import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AIChatModal } from './components/AIChatModal';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { PrebuiltPage } from './pages/PrebuiltPage';
import { PrebuiltDetailPage } from './pages/PrebuiltDetailPage';
import { LaptopsPage } from './pages/LaptopsPage';
import { LaptopDetailPage } from './pages/LaptopDetailPage';
import { ComparePage } from './pages/ComparePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotFoundPage } from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageTransitionRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/prebuilt" element={<PrebuiltPage />} />
        <Route path="/prebuilt/:id" element={<PrebuiltDetailPage />} />
        <Route path="/laptops" element={<LaptopsPage />} />
        <Route path="/laptops/:id" element={<LaptopDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:id" element={<OrderSuccessPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#0B0F1A] text-[#E5E7EB] font-sans selection:bg-[#3B82F6] selection:text-white">
        <ScrollToTop />
        <Header />
        <main className="flex-1">
          <PageTransitionRoutes />
        </main>
        <Footer />
        <AIChatModal />
      </div>
    </BrowserRouter>
  );
}
