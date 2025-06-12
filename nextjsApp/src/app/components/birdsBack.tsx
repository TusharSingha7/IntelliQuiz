'use client'
import { Suspense, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    VANTA?: any;
  }
}

export default function VantaBackground({ children , value = "RINGS" }: { children?: React.ReactNode; value? : string}) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [vantaAvailable,setVantaAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if(mounted && !vantaEffect && typeof window !== "undefined" && window.VANTA && vantaRef.current) {
          const effect = window.VANTA[value]({
              el:vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              scale: 1.00,
              scaleMobile: 1.00,
              backgroundColor : 0x0
              // ...other Vanta options
            });
          setVantaEffect(effect);
      }
    const timeout = setTimeout(()=>{
      if(window.VANTA) {
        setVantaAvailable(true);
      }
      else setVantaAvailable(false);
    },1000);
    return () => {
      if (vantaEffect) vantaEffect.destroy();
      clearTimeout(timeout);
    };
    // Only run when mounted or vantaEffect changes
  }, [mounted]);

  if (!mounted) {
    // Render nothing on the server to avoid hydration mismatch
    return null;
  }


  if(vantaAvailable === null || vantaAvailable === true) return (
    <div className="min-h-screen max-w-screen overflow-x-hidden relative">
        <div ref={vantaRef} className="min-h-screen absolute inset-0 z-0"></div>
        <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );

  return <FallbackCompo children={children}/>
 
}

function FallbackCompo({children} : {children? : React.ReactNode}) {
  return <div className="min-h-full relative">
      <div className="h-full w-full absolute inset-0 z-0 bg-gray-800"></div>
      <div className="relative z-10 h-full w-full">{children}</div>
  </div>
}
