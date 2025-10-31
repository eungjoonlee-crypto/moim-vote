import { useState, useEffect } from "react";

interface HeroProps {
  title?: string;
  subtitle?: string;
  heroImageUrl?: string; // background image url
  contestantCount?: number;
  daysLeft?: number;
}

export const Hero = ({ title, subtitle, heroImageUrl, contestantCount, daysLeft }: HeroProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const backgroundOverlay = "absolute inset-0";

  return (
    <>
      {/* 스크롤 시 플로팅 헤더 - 모바일 최적화 */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 transition-all duration-300 ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center">
          <img 
            src="/logo-transparent.png?v=2" 
            alt="싱어게이 로고" 
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>
      </div>

      <section className="relative overflow-hidden hero-gradient py-12 md:py-16 px-4">
        <div className={backgroundOverlay} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            {/* 로고 이미지 */}
            <div className="flex justify-center mb-2 md:mb-3">
              <img 
                src="/logo-transparent.png" 
                alt="싱어게이 로고" 
                className="h-12 md:h-16 lg:h-18 w-auto object-contain"
              />
            </div>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
              {subtitle && subtitle.trim() ? subtitle : "openmic moim 37th. 최고의 목소리에 투표해주세요"}
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
