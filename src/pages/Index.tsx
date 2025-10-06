import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { useState as useReactState } from "react";
import { ContestantCard } from "@/components/ContestantCard";
import { supabase } from "@/integrations/supabase/client";
import { startPeriodicSync } from "@/lib/youtube-api";
import { toast } from "sonner";

interface Contestant {
  id: string;
  name: string;
  song: string;
  youtube_url: string;
  youtube_id: string;
  views: number;
  likes: number;
  vote_count: number;
  created_at: string;
}

interface SiteSettings {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_contestant_count: number | null;
  hero_days_left: number | null;
  meta_title: string | null;
  meta_description: string | null;
}

const Index = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [siteSettings, setSiteSettings] = useReactState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContestants = async () => {
      try {
        console.log('Fetching contestants...');
        
        // Supabase 연결 확인
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Supabase session:', session);
        
        const { data, error } = await supabase
          .from('contestants')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching contestants:', error);
          toast.error('참가자 정보를 불러오는데 실패했습니다.');
          // 오류가 있어도 빈 배열로 설정하여 빈 화면 방지
          setContestants([]);
          return;
        }

        console.log('Contestants data:', data);
        
        // 참가자 순서를 랜덤으로 섞기 (Fisher-Yates 셔플 알고리즘)
        const contestants = data || [];
        const shuffledContestants = [...contestants];
        
        for (let i = shuffledContestants.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledContestants[i], shuffledContestants[j]] = [shuffledContestants[j], shuffledContestants[i]];
        }
        
        setContestants(shuffledContestants);
      } catch (error) {
        console.error('Error:', error);
        toast.error('오류가 발생했습니다.');
        // 오류가 있어도 빈 배열로 설정하여 빈 화면 방지
        setContestants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContestants();
    // 유튜브 통계 주기 동기화 (10분 간격)
    const stop = startPeriodicSync(10);
    
    return () => {
      stop && stop();
    };
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();
        if (!error && data) {
          setSiteSettings(data as SiteSettings);
          // 동적으로 메타 태그 업데이트
          const t = data.meta_title || '싱어게이 : 퀴어가수전';
          const d = data.meta_description || '싱어게이 : 퀴어가수전 - 예선 투표에 참여하세요!';
          document.title = t;
          const ensureMeta = (name: string, content: string) => {
            let el = document.querySelector(`meta[name=\"${name}\"]`) as HTMLMetaElement | null;
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute('name', name);
              document.head.appendChild(el);
            }
            el.setAttribute('content', content);
          };
          ensureMeta('description', d);
          const setOG = (property: string, content: string) => {
            let el = document.querySelector(`meta[property=\"${property}\"]`) as HTMLMetaElement | null;
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute('property', property);
              document.head.appendChild(el);
            }
            el.setAttribute('content', content);
          };
          setOG('og:title', t);
          setOG('og:description', d);
          if (data.hero_image_url) {
            setOG('og:image', data.hero_image_url);
          }
        }
      } catch (e) {
        // 무시하고 기본 메타 사용
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">참가자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero 
        title={siteSettings?.hero_title || undefined}
        subtitle={siteSettings?.hero_subtitle || undefined}
        heroImageUrl={siteSettings?.hero_image_url || undefined}
        contestantCount={siteSettings?.hero_contestant_count ?? undefined}
        daysLeft={siteSettings?.hero_days_left ?? undefined}
      />
      
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            참가자 무대
          </h2>
          <p className="text-muted-foreground text-lg">
            각 참가자의 영상을 시청하고 응원 댓글을 남겨주세요
          </p>
        </div>

        {contestants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">아직 참가자가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contestants.map((contestant) => (
              <ContestantCard 
                key={contestant.id} 
                id={contestant.id}
                name={contestant.name}
                song={contestant.song}
                youtube_url={contestant.youtube_url}
                youtube_id={contestant.youtube_id}
                views={contestant.views}
                likes={contestant.likes}
                vote_count={contestant.vote_count}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Voice of Tomorrow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
