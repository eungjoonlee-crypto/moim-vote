import { useState, useEffect } from "react";
import { Music, LogIn, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroProps {
  title?: string;
  subtitle?: string;
  heroImageUrl?: string; // background image url
}

export const Hero = ({ title, subtitle, heroImageUrl }: HeroProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("로그아웃되었습니다!");
    } catch (error: any) {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const backgroundOverlay = heroImageUrl
    ? `absolute inset-0 bg-[url('${heroImageUrl}')] bg-cover bg-center opacity-30`
    : "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30";

  return (
    <section className="relative overflow-hidden hero-gradient py-20 px-4">
      <div className="fixed top-4 right-4 z-50">
        {loading ? (
          <Button variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-sm" disabled>
            <User className="w-4 h-4 mr-2" />
            로딩 중...
          </Button>
        ) : user ? (
          <div className="flex items-center gap-2">
            <span className="text-white/90 text-sm hidden sm:block">
              안녕하세요, {user.email?.split('@')[0]}님!
            </span>
            {/* 관리자 버튼은 eungjoonlee@gmail.com만 볼 수 있음 */}
            {user.email === 'eungjoonlee@gmail.com' && (
              <Link to="/admin">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  관리자
                </Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button
              size="lg"
              className="rounded-full px-5 shadow-lg shadow-primary/30 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/60 focus:outline-none"
            >
              <LogIn className="w-5 h-5 mr-2" />
              로그인
            </Button>
          </Link>
        )}
      </div>
      <div className={backgroundOverlay} />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
            <Music className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white text-glow">
            {title || "Voice of Tomorrow"}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium">
            {subtitle || "예선 투표에 참여하고 최고의 목소리를 선택하세요"}
          </p>
          
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">15</div>
              <div className="text-sm text-white/70">참가자</div>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">D-7</div>
              <div className="text-sm text-white/70">투표 마감</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
