import { useState, useEffect } from "react";
import { LogIn, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroProps {
  title?: string;
  subtitle?: string;
  heroImageUrl?: string; // background image url
  contestantCount?: number;
  daysLeft?: number;
}

export const Hero = ({ title, subtitle, heroImageUrl, contestantCount, daysLeft }: HeroProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // 디버깅을 위한 로그
  console.log('Hero component props:', {
    daysLeft,
    contestantCount,
    title,
    subtitle
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("로그아웃되었습니다!");
    } catch (error: any) {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const backgroundOverlay = "absolute inset-0";

  return (
    <>
      {/* 스크롤 시 플로팅 헤더 - 모바일 최적화 */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 transition-all duration-300 ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo-transparent.png?v=2" 
              alt="싱어게이 로고" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>
          <div>
            {loading ? (
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white backdrop-blur-sm" disabled>
                <User className="w-4 h-4 mr-2 hidden sm:inline" />
                로딩 중...
              </Button>
            ) : user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-foreground text-xs sm:text-sm hidden md:block">
                  안녕하세요, {user.email?.split('@')[0]}님!
                </span>
                {user.email === 'eungjoonlee@gmail.com' && (
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3 sm:px-3"
                    >
                      <Settings className="w-4 h-4 mr-2 hidden sm:inline" />
                      관리자
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="px-3 sm:px-3"
                >
                  <LogOut className="w-4 h-4 mr-2 hidden sm:inline" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <a
                href={`${(import.meta as any).env?.VITE_SITE_URL || window.location.origin}/auth`}
                className="inline-flex"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 sm:px-4"
                >
                  <LogIn className="w-4 h-4 mr-2 hidden sm:inline" />
                  로그인
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden hero-gradient py-20 px-4">
        <div className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-50 transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {loading ? (
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white backdrop-blur-sm" disabled>
              <User className="w-4 h-4 mr-2 hidden sm:inline" />
              로딩 중...
            </Button>
          ) : user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-white/90 text-xs sm:text-sm hidden md:block">
                안녕하세요, {user.email?.split('@')[0]}님!
              </span>
              {/* 관리자 버튼은 eungjoonlee@gmail.com만 볼 수 있음 */}
              {user.email === 'eungjoonlee@gmail.com' && (
                <Link to="/admin">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-3"
                  >
                    <Settings className="w-4 h-4 mr-2 hidden sm:inline" />
                    관리자
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-3"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2 hidden sm:inline" />
                로그아웃
              </Button>
            </div>
          ) : (
            <a
              href={`${(import.meta as any).env?.VITE_SITE_URL || window.location.origin}/auth`}
              className="inline-flex"
              rel="noopener noreferrer"
            >
              <Button
                className="rounded-full px-5 shadow-lg shadow-primary/30 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/60 focus:outline-none"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2 hidden sm:inline" />
                로그인
              </Button>
            </a>
          )}
        </div>
        <div className={backgroundOverlay} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            {/* 로고 이미지 */}
            <div className="flex justify-center mb-4">
              <img 
                src="/logo-transparent.png" 
                alt="싱어게이 로고" 
                className="h-16 md:h-20 lg:h-24 w-auto object-contain"
              />
            </div>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium">
              {subtitle && subtitle.trim() ? subtitle : "openmic moim 37th. 최고의 목소리에 투표해주세요"}
            </p>
            
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent">{typeof contestantCount === 'number' ? contestantCount : 15}</div>
                <div className="text-sm text-white/70">참가자</div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-4xl font-bold text-accent">{typeof daysLeft === 'number' ? `D-${daysLeft}` : 'D-7'}</div>
                <div className="text-sm text-white/70">투표 마감</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
