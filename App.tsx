import React, { useState } from 'react';
// Import from the local library folder structure (simulating package import)
import { FullPage, Section, NavigationDots, useFullPage, FullPageDirection } from './lib';

// Example of a custom component using the API hook
const NextButton = () => {
  const { next, currentPage, count, direction } = useFullPage();
  
  if (currentPage === count - 1) return null; // Hide on last page

  const isVertical = direction === 'vertical';

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); next(); }}
      className={`absolute ${isVertical ? 'bottom-10 left-1/2 -translate-x-1/2' : 'right-10 top-1/2 -translate-y-1/2'} flex flex-col items-center gap-2 text-white animate-bounce cursor-pointer z-10 hover:text-cyan-300 transition-colors`}
    >
      <span className="text-sm font-medium tracking-widest uppercase">{isVertical ? 'Scroll Down' : 'Scroll Right'}</span>
      <svg 
        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={!isVertical ? '-rotate-90' : ''}
      >
        <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
      </svg>
    </button>
  );
};

// Example of an internal navigation header
const Header = ({ onToggleDirection, direction }: { onToggleDirection: () => void, direction: FullPageDirection }) => {
  const { goTo } = useFullPage();
  return (
    <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-white pointer-events-none">
      <h1 className="text-2xl font-bold tracking-tighter pointer-events-auto cursor-pointer" onClick={() => goTo(0)}>
        FULLPAGE<span className="text-cyan-400">.REACT</span>
      </h1>
      <div className="flex gap-4 items-center pointer-events-auto">
        <button 
          onClick={onToggleDirection}
          className="px-4 py-1.5 text-xs font-bold border border-white/30 rounded-full hover:bg-white/10 transition-colors uppercase tracking-widest"
        >
          Mode: {direction}
        </button>
        <nav className="hidden md:flex gap-6">
          <button onClick={() => goTo(1)} className="hover:underline hover:text-cyan-400 transition-colors">Features</button>
          <button onClick={() => goTo(2)} className="hover:underline hover:text-cyan-400 transition-colors">Gallery</button>
          <button onClick={() => goTo(3)} className="hover:underline hover:text-cyan-400 transition-colors">Contact</button>
        </nav>
      </div>
    </header>
  );
}

const App: React.FC = () => {
  const [lastEvent, setLastEvent] = useState<string>("Ready");
  const [direction, setDirection] = useState<FullPageDirection>('vertical');

  const handleLeave = (origin: number, dest: number) => {
    setLastEvent(`Scrolled from section ${origin + 1} to ${dest + 1}`);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
  };

  return (
    <>
      {/* FullPage Wrapper */}
      <FullPage onLeave={handleLeave} duration={800} direction={direction}>
        
        {/* Helper Components (must be inside FullPage to access context) */}
        <NavigationDots />
        <Header onToggleDirection={toggleDirection} direction={direction} />

        {/* --- Section 1: Intro --- */}
        <Section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center relative">
          <div className="text-center max-w-2xl px-6">
            <div className="mb-6 inline-block p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold tracking-wider text-xs">
              REACT FULLPAGE LIBRARY
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Create Beautiful <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {direction === 'vertical' ? 'Vertical' : 'Horizontal'} Scroll
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              A lightweight, high-performance React library for fullscreen scrolling.
              Try dragging, scrolling, or using the arrow keys.
            </p>
            <div className="flex justify-center gap-4">
               <button onClick={toggleDirection} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/25">
                 Switch to {direction === 'vertical' ? 'Horizontal' : 'Vertical'}
               </button>
               <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white font-bold rounded-lg transition-all">
                 Documentation
               </button>
            </div>
          </div>
          <NextButton />
        </Section>

        {/* --- Section 2: Features --- */}
        <Section className="bg-white text-slate-900 flex items-center justify-center relative">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', 
                  backgroundSize: '40px 40px' 
                }} 
           />
           <div className="max-w-6xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">Features</h3>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                  Smooth & <br/> Responsive
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Built with modern React hooks and Tailwind CSS. It handles mouse wheel, touch swipes, and drag gestures seamlessly across all devices.
                </p>
                <ul className="space-y-4">
                  {[
                    'Touch & Mouse Drag Support',
                    'Keyboard Navigation',
                    'Custom Transition Duration',
                    'Lightweight API'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-6 rounded-2xl shadow-xl transform translate-y-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl mb-4 flex items-center justify-center text-orange-600">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <h4 className="font-bold text-lg mb-2">Fast</h4>
                    <p className="text-sm text-slate-500">Optimized for 60fps animations with CSS transforms.</p>
                 </div>
                 <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl">
                    <div className="w-12 h-12 bg-white/20 rounded-xl mb-4 flex items-center justify-center text-white">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    </div>
                    <h4 className="font-bold text-lg mb-2">Mobile First</h4>
                    <p className="text-sm text-slate-400">Native-like feel on iOS and Android devices.</p>
                 </div>
              </div>
           </div>
           <NextButton />
        </Section>

        {/* --- Section 3: Gallery (API Demo) --- */}
        <Section className="bg-slate-900 text-white flex items-center justify-center">
            <div className="w-full h-full relative">
              <img 
                src="https://picsum.photos/1920/1080?grayscale" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" 
                alt="Background" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <h2 className="text-4xl font-bold mb-4">Event Listener Demo</h2>
                <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl max-w-md w-full">
                   <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Last Action</p>
                   <p className="text-2xl font-mono text-cyan-400">{lastEvent}</p>
                </div>
                <p className="mt-8 text-slate-400 max-w-lg">
                  We expose a simple API hook <code>useFullPage()</code> allowing you to build custom controls anywhere inside the provider.
                </p>
              </div>
            </div>
            <NextButton />
        </Section>

        {/* --- Section 4: Contact --- */}
        <Section className="bg-[#4338ca] text-white flex items-center justify-center">
          <div className="max-w-xl w-full text-center px-6">
            <h2 className="text-5xl font-bold mb-8">Ready to Scroll?</h2>
            <form className="bg-white p-8 rounded-2xl shadow-2xl text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" placeholder="you@example.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800" />
              </div>
              <button type="button" onClick={(e) => e.preventDefault()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors">
                Subscribe for Updates
              </button>
              <p className="text-xs text-center text-slate-400 mt-4">
                This is a demo. No data is actually sent.
              </p>
            </form>
          </div>
          
          <footer className="absolute bottom-4 w-full text-center text-indigo-200 text-sm">
            &copy; {new Date().getFullYear()} React FullPage Demo
          </footer>
        </Section>

      </FullPage>
    </>
  );
};

export default App;