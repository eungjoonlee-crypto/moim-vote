import { useState, useEffect, useRef } from "react";
import { Heart, Share2, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getThumbnailUrlFromLink, extractVideoId } from "@/lib/youtube";

// 재미있는 익명 닉네임 리스트 (팝스타 + 일상 상황)
const ANONYMOUS_NICKNAMES = [
  "🛒 장보다 온 비욘세", "📦 택배 기다리는 레이디가가", "🍜 라면 끓이는 마이클잭슨", "👕 빨래 널다가 온 아리아나그란데", "🚇 출근길의 테일러스위프트",
  "💼 야근하는 드레이크", "🍗 치킨 시키는 에드시런", "🏃 배달 온 저스틴비버", "☕ 카페에 온 빌리아일리시", "🎮 게임하는 브루노마스",
  "🛏️ 이불 속 리한나", "🚿 샤워 중인 셀레나고메즈", "📱 폰 보는 위켄드", "🍕 피자 먹는 카디비", "🧹 청소하는 샤키라",
  "🚗 운전 중인 캐티페리", "🏋️ 헬스하는 크리스브라운", "📺 드라마 보는 니키미나즈", "🛌 낮잠 자는 칸예웨스트", "🍔 햄버거 먹는 포스트말론",
  "🎬 넷플릭스 보는 제이지", "🚴 자전거 타는 샘스미스", "🧘 요가하는 케이티페리", "📚 독서하는 존레전드", "🎨 그림 그리는 할시",
  "🏃‍♀️ 조깅하는 듀아리파", "🍿 팝콘 먹는 찰리푸스", "🎧 음악 듣는 위켄드", "🛵 오토바이 타는 트래비스스캇", "🍰 케이크 먹는 멕스",
  "☕ 커피 마시는 아델", "🌮 타코 먹는 배드버니", "🎪 서커스 온 레이디가가", "🏊 수영하는 샘스미스", "🎳 볼링 치는 포스트말론",
  "🎤 노래방 온 머라이어캐리", "🎹 피아노 치는 앨리샤키스", "🎸 기타 치는 존메이어", "🥁 드럼 치는 트래비스바커", "🎻 바이올린 켜는 린지스털링",
  "🎮 PC방 온 드레이크", "🍜 짜파게티 먹는 BTS", "🚕 택시 타는 블랙핑크", "🏪 편의점 온 저스틴팀버레이크", "🎭 연극 보는 레이디가가",
  "🌙 밤샘하는 위켄드", "🌅 일찍 일어난 테일러스위프트", "🚌 버스 타는 아리아나그란데", "🏃 지각하는 저스틴비버", "📖 만화 보는 빌리아일리시",
  "🍱 도시락 싸는 비욘세", "🧺 장바구니 든 리한나", "🚪 문 열고 들어온 셀레나고메즈", "🪟 창문 닦는 에드시런", "🧽 설거지하는 브루노마스",
  "🎂 생일 파티 온 케이티페리", "🎉 축하하는 크리스브라운", "🎁 선물 포장하는 니키미나즈", "💐 꽃 받은 칸예웨스트", "🎈 풍선 부는 포스트말론",
  "🍿 영화 보는 제이지", "🎬 감독 흉내 내는 샘스미스", "📸 사진 찍는 할시", "🖼️ 전시회 온 듀아리파", "🎨 미술관 온 찰리푸스",
  "🏖️ 휴가 중인 아델", "✈️ 비행기 탄 배드버니", "🏝️ 섬에 온 트래비스스캇", "⛱️ 해변의 머라이어캐리", "🏔️ 등산하는 앨리샤키스"
];

// 댓글 ID를 기반으로 일관된 닉네임 생성 함수
// 같은 댓글 ID는 항상 같은 닉네임을 반환합니다
const getNicknameFromId = (commentId: string) => {
  // 문자열을 숫자로 변환 (간단한 해시 함수)
  let hash = 0;
  for (let i = 0; i < commentId.length; i++) {
    const char = commentId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  // 음수를 양수로 변환하고 닉네임 배열 길이로 나눈 나머지 사용
  const index = Math.abs(hash) % ANONYMOUS_NICKNAMES.length;
  return ANONYMOUS_NICKNAMES[index];
};

// 브라우저별 고유 ID 생성 및 관리 (익명 투표용)
const getAnonymousVoterId = (): string => {
  const STORAGE_KEY = 'anonymous_voter_id';
  
  // 기존 ID가 있으면 반환
  let voterId = localStorage.getItem(STORAGE_KEY);
  
  if (!voterId) {
    // 없으면 새로 생성 (UUID v4 형식)
    voterId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem(STORAGE_KEY, voterId);
  }
  
  return voterId;
};

// localStorage에서 투표 여부 확인
const hasVotedForContestant = (contestantId: string): boolean => {
  const VOTES_KEY = 'voted_contestants';
  const votedContestants = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');
  return votedContestants.includes(contestantId);
};

// localStorage에 투표 기록 저장
const markAsVoted = (contestantId: string): void => {
  const VOTES_KEY = 'voted_contestants';
  const votedContestants = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');
  if (!votedContestants.includes(contestantId)) {
    votedContestants.push(contestantId);
    localStorage.setItem(VOTES_KEY, JSON.stringify(votedContestants));
  }
};

// localStorage에서 투표 기록 제거
const unmarkAsVoted = (contestantId: string): void => {
  const VOTES_KEY = 'voted_contestants';
  const votedContestants = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');
  const filtered = votedContestants.filter((id: string) => id !== contestantId);
  localStorage.setItem(VOTES_KEY, JSON.stringify(filtered));
};

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface ContestantCardProps {
  id: string;
  name: string;
  song: string;
  youtube_url: string;
  youtube_id: string;
  image_url?: string;
  views: number;
  likes: number;
  vote_count: number;
  isPlaying?: boolean;
  onPlayChange?: (isPlaying: boolean) => void;
  showComments?: boolean; // 댓글 섹션 표시 여부
  showVoteButton?: boolean; // 투표 버튼 표시 여부
  showVoteCount?: boolean; // 투표 수 표시 여부
  showShareButton?: boolean; // 공유 버튼 표시 여부
  showViews?: boolean; // 조회수 표시 여부
  showLikes?: boolean; // 좋아요 수 표시 여부
}

export const ContestantCard = ({ 
  id, 
  name, 
  song, 
  youtube_url, 
  youtube_id, 
  image_url,
  views, 
  likes, 
  vote_count, 
  isPlaying = false, 
  onPlayChange,
  showComments: enableComments = true,
  showVoteButton: enableVoteButton = true,
  showVoteCount: enableVoteCount = true,
  showShareButton: enableShareButton = true,
  showViews: enableViews = false,
  showLikes: enableLikes = false,
}: ContestantCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentVoteCount, setCurrentVoteCount] = useState(vote_count);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // vote_count 변경 시 currentVoteCount 업데이트
  useEffect(() => {
    setCurrentVoteCount(vote_count);
  }, [vote_count]);
  const [showVideo, setShowVideo] = useState(false);
  const [localWantsToPlay, setLocalWantsToPlay] = useState(false);
  
  // isPlaying prop 변경 시 showVideo 상태 동기화 (더 안정적인 로직)
  useEffect(() => {
    console.log(`[${name}] isPlaying: ${isPlaying}, localWantsToPlay: ${localWantsToPlay}, showVideo: ${showVideo}`);
    
    if (isPlaying && localWantsToPlay) {
      // 이 영상이 재생 권한을 얻었고, 로컬에서 재생을 원하면 재생
      if (!showVideo) {
        setShowVideo(true);
        setVideoError(false); // 재생 시 에러 상태 초기화
      }
    } else {
      // 다른 영상이 재생 중이거나 로컬에서 재생을 원하지 않으면 정지
      if (showVideo) {
        setShowVideo(false);
      }
      if (!isPlaying) {
        setLocalWantsToPlay(false);
      }
    }
  }, [isPlaying, localWantsToPlay, showVideo, name]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();

  // 썸네일 URL 생성 (image_url이 있으면 우선 사용)
  useEffect(() => {
    if (image_url && image_url.trim().length > 0) {
      setThumbnailUrl(image_url);
    } else {
      const thumbnail = getThumbnailUrlFromLink(youtube_url, 'high');
      setThumbnailUrl(thumbnail);
    }
  }, [youtube_url, image_url]);

  // 모바일에서 카드가 뷰포트에 보이면 자동 재생, 사라지면 정지 (개선된 로직)
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && (
      window.matchMedia('(pointer: coarse)').matches || /Mobi|Android/i.test(navigator.userAgent)
    );
    if (!isMobile) return;
    if (!cardRef.current) return;

    let playTimeout: NodeJS.Timeout;
    let isCurrentlyIntersecting = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasIntersecting = isCurrentlyIntersecting;
          isCurrentlyIntersecting = entry.isIntersecting;
          
          console.log(`[${name}] Intersection changed: ${wasIntersecting} -> ${isCurrentlyIntersecting}, intersectionRatio: ${entry.intersectionRatio}`);
          
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            // 카드가 충분히 보이면 1.5초 후 재생 요청 (기존 2초에서 단축)
            clearTimeout(playTimeout);
            playTimeout = setTimeout(() => {
              console.log(`[${name}] Mobile auto-play triggered`);
              setLocalWantsToPlay(true);
              onPlayChange?.(true);
            }, 1500);
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
            // 카드가 보이지 않거나 충분히 보이지 않으면 즉시 정지
            clearTimeout(playTimeout);
            console.log(`[${name}] Mobile auto-play stopped`);
            setLocalWantsToPlay(false);
            setShowVideo(false);
            onPlayChange?.(false);
          }
        });
      },
      { 
        root: null, 
        rootMargin: '0px', 
        threshold: [0, 0.3, 0.6, 1.0] // 여러 임계값으로 더 정확한 감지
      }
    );

    observer.observe(cardRef.current);
    return () => {
      clearTimeout(playTimeout);
      observer.disconnect();
    };
  }, [onPlayChange, name]);

  // 투표 상태 확인 (localStorage + DB 이중 체크로 완벽한 동기화)
  useEffect(() => {
    if (!enableVoteButton) return;
    
    const checkVoteStatus = async () => {
      // 1. localStorage에서 빠르게 확인 (초기 UI 표시용)
      const localVoted = hasVotedForContestant(id);
      setIsLiked(localVoted);
      
      try {
        // 2. DB에서 정확하게 확인 (localStorage가 삭제되었을 수 있음)
        const anonymousVoterId = getAnonymousVoterId();
        const { data, error } = await supabase
          .from('votes')
          .select('id')
          .eq('anonymous_voter_id', anonymousVoterId)
          .eq('contestant_id', id)
          .maybeSingle();
        
        if (error) {
          console.error(`[${name}] 투표 상태 확인 오류:`, error.message);
          return; // localStorage 값 유지
        }
        
        const dbVoted = !!data;
        
        // 3. localStorage와 DB 동기화
        if (dbVoted && !localVoted) {
          // DB에는 투표 기록이 있는데 localStorage에는 없음 → localStorage 업데이트
          console.log(`[${name}] localStorage 재동기화: 투표 기록 복원`);
          markAsVoted(id);
          setIsLiked(true);
        } else if (!dbVoted && localVoted) {
          // localStorage에는 있는데 DB에는 없음 → localStorage 제거
          console.log(`[${name}] localStorage 재동기화: 잘못된 투표 기록 제거`);
          unmarkAsVoted(id);
          setIsLiked(false);
        } else {
          // 이미 동기화되어 있음
          setIsLiked(dbVoted);
        }
      } catch (error) {
        console.error(`[${name}] 투표 상태 확인 중 예외:`, error);
        // 오류 발생 시 localStorage 값 유지
      }
    };
    
    checkVoteStatus();
  }, [id, enableVoteButton, name]);

  // 투표 수 불러오기 함수
  const fetchVoteCount = async () => {
    try {
      console.log(`[${name}] Fetching vote count for contestant:`, id);
      
      const { count, error } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('contestant_id', id);

      if (error) {
        console.error(`[${name}] 투표 수 조회 오류:`, error.message, error.code);
        // 406 오류인 경우 특별 처리
        if (error.code === 'PGRST301' || error.message.includes('406')) {
          console.warn(`[${name}] RLS 정책 문제로 투표 수를 가져올 수 없습니다.`);
        }
        return;
      }

      console.log(`[${name}] Vote count fetched:`, count);
      setCurrentVoteCount(count || 0);
    } catch (error) {
      console.error(`[${name}] 투표 수 조회 중 예외 발생:`, error);
    }
  };

  // 투표 수 불러오기 (enableVoteCount가 true일 때만 실행)
  useEffect(() => {
    if (!enableVoteCount) return;
    fetchVoteCount();
  }, [id, enableVoteCount]);

  // 댓글 불러오기 (enableComments가 true일 때만 실행)
  useEffect(() => {
    if (!enableComments) return;
    
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('contestant_id', id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching comments:', error);
          return; // 토스트 메시지 제거 (사용자에게 불필요한 알림 방지)
        }

        const formattedComments = data?.map(comment => ({
          id: comment.id, // 댓글 ID 추가
          author: getNicknameFromId(comment.id), // 댓글 ID 기반 일관된 익명 닉네임
          text: comment.content,
          timestamp: new Date(comment.created_at)
        })) || [];

        setComments(formattedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        // 토스트 메시지 제거 (사용자에게 불필요한 알림 방지)
      }
    };

    fetchComments();
  }, [id, enableComments]);

  const handleShare = async () => {
    // 참가자 페이지 URL로 공유 (자동 재생 포함)
    const shareUrl = `${window.location.origin}?contestant=${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "링크 복사 완료!",
        description: `${name}의 참가자 페이지 링크가 클립보드에 복사되었습니다. 링크를 열면 해당 영상이 자동으로 재생됩니다.`,
      });
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "링크 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "댓글을 작성하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          contestant_id: id,
          user_id: user.id,
          content: newComment
        });

      if (error) throw error;

      // 댓글 작성 성공 후 데이터베이스에서 다시 불러오기
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('contestant_id', id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching comments after insert:', fetchError);
        // 에러가 있어도 댓글은 저장되었으므로 성공 메시지 표시
      } else {
        const formattedComments = data?.map(comment => ({
          id: comment.id, // 댓글 ID 추가
          author: getNicknameFromId(comment.id), // 댓글 ID 기반 일관된 익명 닉네임
          text: comment.content,
          timestamp: new Date(comment.created_at)
        })) || [];
        
        setComments(formattedComments);
      }
      
      setNewComment("");
      
      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      });
    } catch (error: any) {
      console.error('Error inserting comment:', error);
      toast({
        title: "댓글 작성 실패",
        description: error.message || "댓글 작성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    // 익명 투표자 ID 가져오기 (로그인 불필요)
    const anonymousVoterId = getAnonymousVoterId();

    try {
      if (isLiked) {
        // 투표 취소
        console.log(`[${name}] Deleting vote for anonymous voter:`, anonymousVoterId);
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('anonymous_voter_id', anonymousVoterId)
          .eq('contestant_id', id);

        if (error) {
          console.error(`[${name}] 투표 삭제 오류:`, error.message, error.code);
          throw error;
        }
        
        console.log(`[${name}] Vote deleted successfully`);
        setIsLiked(false);
        unmarkAsVoted(id); // localStorage에서 제거
        
        // 데이터베이스에서 실제 투표 수 다시 불러오기
        await fetchVoteCount();
        
        toast({
          title: "투표 취소",
          description: "투표를 취소했습니다.",
        });
      } else {
        // 투표하기
        console.log(`[${name}] Inserting vote for anonymous voter:`, anonymousVoterId);
        const { error } = await supabase
          .from('votes')
          .insert({
            anonymous_voter_id: anonymousVoterId,
            contestant_id: id,
            user_id: null // 익명 투표는 user_id를 null로 설정
          });

        if (error) {
          console.error(`[${name}] 투표 추가 오류:`, error.message, error.code);
          
          // 이미 투표한 경우 (unique constraint 위반)
          if (error.code === '23505') {
            toast({
              title: "이미 투표하셨습니다",
              description: "이 참가자에게는 이미 투표하셨습니다.",
              variant: "destructive",
            });
            setIsLiked(true);
            markAsVoted(id);
            return;
          }
          
          throw error;
        }
        
        console.log(`[${name}] Vote inserted successfully`);
        setIsLiked(true);
        markAsVoted(id); // localStorage에 저장
        
        // 데이터베이스에서 실제 투표 수 다시 불러오기
        await fetchVoteCount();
        
        toast({
          title: "투표 완료!",
          description: "이 참가자에게 투표했습니다!",
        });
      }
    } catch (error: any) {
      console.error(`[${name}] Vote error:`, error);
      toast({
        title: "투표 실패",
        description: error.message || "투표에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden card-gradient border-border/50 hover:border-primary/50 transition-smooth group">
      <div ref={cardRef} className="aspect-video relative overflow-hidden bg-black">
        {/* image_url이 지정된 경우에는 이미지 표시로 고정하고, 영상 자동재생/오버레이를 비활성화 */}
        {image_url && image_url.trim().length > 0 ? (
          <img
            src={thumbnailUrl || image_url}
            alt={`${name} - ${song}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
            }}
          />
        ) : showVideo && !videoError ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtube_id}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1&autoplay=1&mute=1&playsinline=1`}
            title={`${name} - ${song}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            onLoad={() => {
              // iframe이 로드되었지만 실제로는 오류일 수 있음
              setTimeout(() => {
                const iframe = document.querySelector(`iframe[src*="${youtube_id}"]`) as HTMLIFrameElement;
                if (iframe && iframe.contentDocument?.title?.includes('Error')) {
                  setVideoError(true);
                  setShowVideo(false);
                  toast({
                    title: "영상 재생 불가",
                    description: "이 영상은 다른 사이트에서 재생할 수 없습니다.",
                    variant: "destructive",
                  });
                }
              }, 3000);
            }}
            onError={() => {
              setVideoError(true);
              setShowVideo(false);
              toast({
                title: "영상 로드 실패",
                description: "YouTube 영상을 불러올 수 없습니다.",
                variant: "destructive",
              });
            }}
          />
        ) : videoError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <p className="text-lg font-semibold mb-2">영상을 불러올 수 없습니다</p>
              <p className="text-sm text-gray-300 mb-4">영상이 삭제되었거나 비공개일 수 있습니다</p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    window.open(`https://www.youtube.com/watch?v=${youtube_id}`, '_blank');
                  }}
                  variant="default"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  YouTube에서 보기
                </Button>
                <Button
                  onClick={() => {
                    setVideoError(false);
                    setShowVideo(false);
                  }}
                  variant="outline"
                  className="w-full text-white border-white hover:bg-white hover:text-black"
                >
                  썸네일로 돌아가기
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={`${name} - ${song}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 썸네일 로드 실패 시 기본 이미지 표시
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WW91VHViZSBWaWRlbzwvdGV4dD48L3N2Zz4=';
                }}
              />
            )}
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{name}</h3>
          <p className="text-muted-foreground">{song}</p>
          {/* 조회수 및 좋아요 수 표시 (선택적) */}
          {(enableViews || enableLikes) && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {enableViews && (
                <span>조회수 {views.toLocaleString()}</span>
              )}
              {enableLikes && (
                <span>좋아요 {currentLikes.toLocaleString()}</span>
              )}
            </div>
          )}
        </div>

        {/* 하단 통합 버튼 레이아웃 */}
        <div className="flex items-center gap-2">
          {enableVoteButton && (
            <Button
              variant={isLiked ? "default" : "outline"}
              className="flex-1"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "투표 취소" : "투표하기"}
            </Button>
          )}
          
          {enableVoteCount && (
            <div className="flex items-center gap-1 px-3 py-2 bg-muted/50 rounded-md border border-border/50">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentVoteCount.toLocaleString()}</span>
            </div>
          )}
          
          {enableShareButton && (
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          
          {enableComments && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowComments(!showComments)}
              className="relative"
            >
              <MessageCircle className="w-4 h-4" />
              {comments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {comments.length}
                </span>
              )}
            </Button>
          )}
        </div>

        {enableComments && showComments && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Textarea
                placeholder="응원 댓글을 남겨주세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none bg-input border-border/50"
                rows={3}
              />
              <Button onClick={handleComment} className="w-full">
                댓글 작성
              </Button>
            </div>

            {comments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">댓글 {comments.length}</h4>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-muted/30 rounded-lg p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp.toLocaleTimeString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
