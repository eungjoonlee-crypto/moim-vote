import { useState, useEffect } from "react";
import { Heart, Share2, MessageCircle, Eye, ThumbsUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getThumbnailUrlFromLink, extractVideoId } from "@/lib/youtube";

// 재미있는 익명 닉네임 리스트
const ANONYMOUS_NICKNAMES = [
  "🎵 음악마니아", "🎤 보컬러버", "🎶 멜로디킹", "🎼 하모니퀸", "🎹 피아니스트",
  "🎸 기타리스트", "🥁 드러머", "🎺 트럼펫터", "🎻 바이올리니스트", "🎪 서커스마스터",
  "🌟 스타가수", "🎭 연기자", "🎨 아티스트", "🎪 엔터테이너", "🎊 파티마스터",
  "🎉 축하요정", "🎈 풍선마스터", "🎁 선물요정", "🎀 리본퀸", "🎂 케이크마스터",
  "🍰 디저트러버", "☕ 커피마니아", "🍕 피자러버", "🍔 햄버거킹", "🍟 프라이마스터",
  "🍦 아이스크림퀸", "🍭 캔디러버", "🍫 초콜릿러버", "🍪 쿠키마스터", "🧁 컵케이크퀸",
  "🌈 무지개요정", "☀️ 태양님", "🌙 달님", "⭐ 별님", "🌠 별똥별",
  "🌻 해바라기", "🌹 장미퀸", "🌸 벚꽃요정", "🌺 꽃님", "🌿 나뭇잎",
  "🐱 고양이", "🐶 강아지", "🐰 토끼", "🐻 곰돌이", "🐼 팬더",
  "🦄 유니콘", "🐧 펭귄", "🐸 개구리", "🐝 벌", "🦋 나비",
  "🚀 로켓", "✈️ 비행기", "🚗 자동차", "🚲 자전거", "🏍️ 오토바이",
  "🎯 정확한사수", "🏆 챔피언", "🥇 금메달리스트", "🥈 은메달리스트", "🥉 동메달리스트",
  "🏅 메달리스트", "🎖️ 훈장수여자", "🏵️ 리본수여자", "🎗️ 리본퀸", "🎪 서커스스타",
  "🎨 화가", "🖌️ 붓마스터", "🖍️ 크레용아티스트", "✏️ 연필마스터", "📝 작가",
  "📚 독서왕", "📖 책벌레", "📰 신문독자", "📑 문서마스터", "📋 체크리스트",
  "💡 아이디어왕", "🔍 탐정", "🕵️ 스파이", "👨‍💼 비즈니스맨", "👩‍💼 비즈니스우먼",
  "👨‍🔬 과학자", "👩‍🔬 여성과학자", "👨‍⚕️ 의사", "👩‍⚕️ 여의사", "👨‍🏫 교사",
  "👩‍🏫 여교사", "👨‍🎓 졸업생", "👩‍🎓 여졸업생", "👨‍🎨 예술가", "👩‍🎨 여성예술가"
];

// 랜덤 닉네임 생성 함수
const getRandomNickname = () => {
  return ANONYMOUS_NICKNAMES[Math.floor(Math.random() * ANONYMOUS_NICKNAMES.length)];
};

interface Comment {
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
  views: number;
  likes: number;
}

export const ContestantCard = ({ id, name, song, youtube_url, youtube_id, views, likes }: ContestantCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();

  // 썸네일 URL 생성
  useEffect(() => {
    const thumbnail = getThumbnailUrlFromLink(youtube_url, 'high');
    setThumbnailUrl(thumbnail);
  }, [youtube_url]);

  // 사용자 투표 상태 확인
  useEffect(() => {
    const checkUserVote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('contestant_id', id)
        .single();

      if (data) {
        setIsLiked(true);
      }
    };

    checkUserVote();
  }, [id]);

  // 댓글 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('contestant_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      const formattedComments = data?.map(comment => ({
        author: getRandomNickname(), // 재미있는 랜덤 익명 닉네임
        text: comment.content,
        timestamp: new Date(comment.created_at)
      })) || [];

      setComments(formattedComments);
    };

    if (showComments) {
      fetchComments();
    }
  }, [id, showComments]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?contestant=${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "링크 복사 완료!",
        description: "참가자 링크가 클립보드에 복사되었습니다.",
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

      // 즉시 화면에 댓글 추가 (랜덤 익명 닉네임 사용)
      const newCommentObj = {
        author: getRandomNickname(), // 재미있는 랜덤 익명 닉네임
        text: newComment,
        timestamp: new Date()
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment("");
      
      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "댓글 작성 실패",
        description: error.message || "댓글 작성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "투표하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        // 투표 취소
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('contestant_id', id);

        if (error) throw error;
        
        setIsLiked(false);
        setCurrentLikes(prev => prev - 1);
        toast({
          title: "투표 취소",
          description: "투표를 취소했습니다.",
        });
      } else {
        // 투표하기
        const { error } = await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            contestant_id: id
          });

        if (error) throw error;
        
        setIsLiked(true);
        setCurrentLikes(prev => prev + 1);
        toast({
          title: "투표 완료!",
          description: "이 참가자에게 투표했습니다!",
        });
      }
    } catch (error: any) {
      toast({
        title: "투표 실패",
        description: error.message || "투표에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden card-gradient border-border/50 hover:border-primary/50 transition-smooth group">
      <div className="aspect-video relative overflow-hidden bg-black">
        {showVideo && !videoError ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtube_id}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1`}
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
              <div className="flex flex-col items-center space-y-3">
                <Button
                  onClick={() => setShowVideo(true)}
                  size="lg"
                  className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                  <Play className="w-8 h-8 ml-1" />
                </Button>
                <Button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${youtube_id}`, '_blank')}
                  size="sm"
                  variant="outline"
                  className="bg-black/50 border-white/50 text-white hover:bg-white/20 text-xs px-3 py-1"
                >
                  YouTube에서 보기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{name}</h3>
          <p className="text-muted-foreground">{song}</p>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" />
            <span>{currentLikes.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isLiked ? "default" : "outline"}
            className="flex-1"
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "투표 취소" : "투표하기"}
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>

        {showComments && (
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
                {comments.map((comment, index) => (
                  <div
                    key={`comment-${index}`}
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
