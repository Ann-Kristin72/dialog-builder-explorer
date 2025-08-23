import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

export default function TeknoTassenIntro() {
  const waveRef = useRef<LottieRefCurrentProps>(null);
  const [played, setPlayed] = useState(false);
  const [error, setError] = useState(false);

  // Spill vinken én gang ved mount
  useEffect(() => {
    if (waveRef.current && !played) {
      try {
        waveRef.current.setSpeed(1);
        waveRef.current.play();
        setPlayed(true);
      } catch (err) {
        console.error("Error playing wave animation:", err);
        setError(true);
      }
    }
  }, [played]);

  // Fallback hvis Lottie feiler
  if (error) {
    return (
      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-avatar bg-primary flex items-center justify-center">
        <div className="text-4xl font-bold text-primary-foreground">🤓</div>
      </div>
    );
  }

  // Test-versjon først - bare vis en enkel div
  return (
    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-avatar bg-primary flex items-center justify-center">
      <div className="text-4xl font-bold text-primary-foreground">🤓</div>
    </div>
  );

  // Lottie-versjon (kommentert ut for testing)
  /*
  return (
    <div className="relative w-[280px] h-[320px]">
      <Lottie
        lottieRef={waveRef}
        className="absolute inset-0"
        animationData="/lottie/teknotassen_wave.json"
        loop={false}
        autoplay={false}
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        onError={(err) => {
          console.error("Lottie wave error:", err);
          setError(true);
        }}
      />

      <Lottie
        className="absolute left-[112px] top-[165px] w-[56px] h-[56px] pointer-events-none"
        animationData="/lottie/steam_loop.json"
        loop
        autoplay
        rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
        onError={(err) => {
          console.error("Lottie steam error:", err);
        }}
      />
    </div>
  );
  */
}
