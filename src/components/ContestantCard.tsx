import { useState, useEffect } from "react";
import { Heart, Share2, MessageCircle, Eye, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  youtubeId: string;
  views: number;
  likes: number;
}

export const ContestantCard = ({ id, name, song, youtubeId, views, likes }: ContestantCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const { toast } = useToast();

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
        .select(`
          *,
          user_profiles!inner(display_name)
        `)
        .eq('contestant_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        author: comment.user_profiles?.display_name || '익명',
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

      // 댓글 목록 새로고침
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles!inner(display_name)
        `)
        .eq('contestant_id', id)
        .order('created_at', { ascending: false });

      if (!fetchError && data) {
        const formattedComments = data.map(comment => ({
          id: comment.id,
          author: comment.user_profiles?.display_name || '익명',
          text: comment.content,
          timestamp: new Date(comment.created_at)
        }));
        setComments(formattedComments);
      }

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
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={`${name} - ${song}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
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
