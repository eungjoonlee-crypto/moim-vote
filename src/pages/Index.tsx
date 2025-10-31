import { useState, useEffect, useRef } from "react";
import { Hero } from "@/components/Hero";
import { useState as useReactState } from "react";
import { ContestantCard } from "@/components/ContestantCard";
import { supabase } from "@/integrations/supabase/client";
import { startPeriodicSync } from "@/lib/youtube-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Contestant {
  id: string;
  name: string;
  song: string;
  youtube_url: string;
  youtube_id: string;
  image_url?: string;
  views: number;
  likes: number;
  vote_count: number;
  created_at: string;
  is_visible?: boolean;
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
  show_comments: boolean | null;
  show_vote_button: boolean | null;
  show_vote_count: boolean | null;
  show_share_button: boolean | null;
  show_views: boolean | null;
  show_likes: boolean | null;
}

const Index = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [siteSettings, setSiteSettings] = useReactState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string | null>(null);
  const contestantsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
          .eq('is_visible', true) // 노출 여부가 true인 참가자만 가져오기
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
        // vote_count가 없는 경우 0으로 기본값 설정
        const contestants = (data || []).map(c => ({
          ...c,
          vote_count: c.vote_count ?? 0
        }));
        const shuffledContestants = [...contestants];
        
        for (let i = shuffledContestants.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledContestants[i], shuffledContestants[j]] = [shuffledContestants[j], shuffledContestants[i]];
        }
        
        setContestants(shuffledContestants);

        // URL 파라미터에서 특정 참가자 ID 확인
        const urlParams = new URLSearchParams(window.location.search);
        const selectedContestantId = urlParams.get('contestant');
        
        if (selectedContestantId) {
          // 선택된 참가자가 존재하는지 확인
          const selectedContestant = shuffledContestants.find(c => c.id === selectedContestantId);
          if (selectedContestant) {
            console.log(`선택된 참가자: ${selectedContestant.name} (${selectedContestantId})`);
            // 선택된 참가자의 영상을 자동으로 재생
            setCurrentPlayingVideo(selectedContestantId);
            
            // 해당 참가자 카드로 스크롤
            setTimeout(() => {
              const contestantElement = document.querySelector(`[data-contestant-id="${selectedContestantId}"]`);
              if (contestantElement) {
                contestantElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
              }
            }, 500);
          } else {
            console.warn(`참가자 ID ${selectedContestantId}를 찾을 수 없습니다.`);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('오류가 발생했습니다.');
        // 오류가 있어도 빈 배열로 설정하여 빈 화면 방지
        setContestants([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        if (error) {
          console.warn('site_settings fetch error:', error.message);
        }
        if (data) {
          setSiteSettings(data as SiteSettings);
          
          // 디버깅을 위한 로그
          console.log('Site settings loaded:', {
            hero_days_left: data.hero_days_left,
            hero_title: data.hero_title,
            updated_at: data.updated_at
          });
          
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
    // 실행 순서: 참가자 → 설정 로드 → 주기 동기화 시작
    fetchContestants();
    fetchSettings();
    // 유튜브 통계 주기 동기화 (10분 간격)
    const stop = startPeriodicSync(10);

    return () => {
      stop && stop();
    };
  }, []);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

        {contestants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">아직 참가자가 없습니다.</p>
          </div>
        ) : isMobile ? (
          // 모바일: 카로셀 형태로 좌우 슬라이드
          <div ref={contestantsRef} className="w-full relative">
            <Carousel
              opts={{
                align: "start",
                loop: false,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {contestants.map((contestant) => (
                  <CarouselItem key={contestant.id} className="pl-4 basis-full" data-contestant-id={contestant.id}>
                    <ContestantCard 
                      id={contestant.id}
                      name={contestant.name}
                      song={contestant.song}
                      youtube_url={contestant.youtube_url}
                      youtube_id={contestant.youtube_id}
                      image_url={contestant.image_url}
                      views={contestant.views}
                      likes={contestant.likes}
                      vote_count={contestant.vote_count}
                      isPlaying={currentPlayingVideo === contestant.id}
                      onPlayChange={(isPlaying) => {
                        console.log(`[Index] Contestant ${contestant.name} (${contestant.id}) play change: ${isPlaying}`);
                        if (isPlaying) {
                          // 새 영상이 재생되면 이전 영상 정지
                          setCurrentPlayingVideo(contestant.id);
                        } else if (currentPlayingVideo === contestant.id) {
                          // 현재 재생 중인 영상이 정지되면 재생 상태 초기화
                          setCurrentPlayingVideo(null);
                        }
                      }}
                      showComments={siteSettings?.show_comments ?? true}
                      showVoteButton={siteSettings?.show_vote_button ?? true}
                      showVoteCount={siteSettings?.show_vote_count ?? true}
                      showShareButton={siteSettings?.show_share_button ?? true}
                      showViews={siteSettings?.show_views ?? false}
                      showLikes={siteSettings?.show_likes ?? false}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* 모바일에서 카드 위에 반투명 플로팅 버튼 */}
              <CarouselPrevious className="!left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 shadow-lg z-10" />
              <CarouselNext className="!right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 shadow-lg z-10" />
            </Carousel>
          </div>
        ) : (
          // 데스크톱: 기존 grid 레이아웃
          <div ref={contestantsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contestants.map((contestant) => (
              <div key={contestant.id} data-contestant-id={contestant.id}>
                <ContestantCard 
                  id={contestant.id}
                  name={contestant.name}
                  song={contestant.song}
                  youtube_url={contestant.youtube_url}
                  youtube_id={contestant.youtube_id}
                  image_url={contestant.image_url}
                  views={contestant.views}
                  likes={contestant.likes}
                  vote_count={contestant.vote_count}
                  isPlaying={currentPlayingVideo === contestant.id}
                  onPlayChange={(isPlaying) => {
                    console.log(`[Index] Contestant ${contestant.name} (${contestant.id}) play change: ${isPlaying}`);
                    if (isPlaying) {
                      // 새 영상이 재생되면 이전 영상 정지
                      setCurrentPlayingVideo(contestant.id);
                    } else if (currentPlayingVideo === contestant.id) {
                      // 현재 재생 중인 영상이 정지되면 재생 상태 초기화
                      setCurrentPlayingVideo(null);
                    }
                  }}
                  showComments={siteSettings?.show_comments ?? true}
                  showVoteButton={siteSettings?.show_vote_button ?? true}
                  showVoteCount={siteSettings?.show_vote_count ?? true}
                  showShareButton={siteSettings?.show_share_button ?? true}
                  showViews={siteSettings?.show_views ?? false}
                  showLikes={siteSettings?.show_likes ?? false}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 openmic moim 37th. All rights reserved.</p>
        </div>
      </footer>

      {/* 맨 위로 버튼 */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default Index;

