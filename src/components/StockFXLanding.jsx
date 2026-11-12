import React, { useState } from 'react';

export default function StockFXLanding() {
  const [modalState, setModalState] = useState({ isOpen: false, imageSrc: '' });

  // Reemplaza estas URLs con las rutas locales de tus capturas (ej: '/images/alertas.png')
  const screenshots = {
    alertas: "/Assets/Alertas de Reposicion.png",
    ia: "/Assets/IA para la rentabilidad.png",
    picking: "/Assets/Picking.png",
    auditoria: "/Assets/Auditoria.png"
  };

  const openModal = (type) => {
    setModalState({ isOpen: true, imageSrc: screenshots[type] });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, imageSrc: '' });
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 relative overflow-hidden min-h-screen">
      
      {/* Fondo diagonal estilo Stripe */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-500 transform -skew-y-6 origin-top-left -z-10"></div>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-sm">
          El control total de tu inventario.
        </h1>
        <p className="text-xl md:text-2xl font-light mb-10 max-w-3xl mx-auto opacity-95">
          StockFX está diseñado para logísticas pequeñas y pymes en crecimiento. 
          Obtené trazabilidad, picking ágil y control de rentabilidad sin una inversión inalcanzable.
        </p>
        <a 
          href="https://wednesday-node-skill-labeled.trycloudflare.com/" 
          className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition-all hover:scale-105"
        >
          Ingresar al sistema
        </a>
      </header>

      {/* Grid de Funcionalidades */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Alertas */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Alertas por Reposición</h3>
            <p className="text-gray-600 mb-6">Mantén tu stock siempre optimizado. Recibe notificaciones automáticas cuando un producto alcance su punto de pedido o registre bajo stock.</p>
            <button onClick={() => openModal('alertas')} className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center cursor-pointer">
              Ver captura del sistema <span className="ml-2">→</span>
            </button>
          </div>

          {/* Card 2: Trazabilidad IA */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Trazabilidad con IA</h3>
            <p className="text-gray-600 mb-6">Analiza el historial de tus proveedores y productos. Identifica con inteligencia artificial qué artículos fueron realmente rentables y cuáles no.</p>
            <button onClick={() => openModal('ia')} className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center cursor-pointer">
              Ver captura del sistema <span className="ml-2">→</span>
            </button>
          </div>

          {/* Card 3: Picking Móvil */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Picking Móvil Integrado</h3>
            <p className="text-gray-600 mb-6">Sistema de recolección optimizado para ser utilizado desde cualquier celular, brindando máxima comodidad sin necesidad de comprar equipamiento adicional.</p>
            <button onClick={() => openModal('picking')} className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center cursor-pointer">
              Ver captura del sistema <span className="ml-2">→</span>
            </button>
          </div>

          {/* Card 4: Auditoría */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Auditoría Automatizada</h3>
            <p className="text-gray-600 mb-6">Comparación automatizada entre el conteo físico y la base de datos de inventario. Detecta discrepancias de forma precisa para un control sin fisuras.</p>
            <button onClick={() => openModal('auditoria')} className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center cursor-pointer">
              Ver captura del sistema <span className="ml-2">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal / Popart para las capturas */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 bg-gray-900 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-100 transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <img 
              src={modalState.imageSrc} 
              alt="Captura de interfaz de StockFX" 
              className="w-full h-auto object-contain max-h-[85vh] bg-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}