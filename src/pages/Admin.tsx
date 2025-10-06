import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Save, X, Plus, Trash2, ExternalLink, Play, RefreshCw, Sync, Settings } from "lucide-react";
import { extractVideoId, isValidYouTubeUrl, getThumbnailUrlFromLink } from "@/lib/youtube";
import { syncAllContestantsVideoInfo, getYouTubeVideoInfo } from "@/lib/youtube-api";
import { useAutoSync } from "@/hooks/useAutoSync";

interface Contestant {
  id: string;
  name: string;
  song: string;
  youtube_url: string;
  youtube_id: string;
  views: number;
  likes: number;
  created_at: string;
}

const Admin = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    song: "",
    youtube_url: "",
    views: 0,
    likes: 0
  });
  const [newContestant, setNewContestant] = useState({
    name: "",
    song: "",
    youtube_url: "",
    views: 0,
    likes: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const { toast } = useToast();

  // 자동 동기화 활성화 (30분마다)
  useAutoSync(30, autoSyncEnabled);

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    try {
      const { data, error } = await supabase
        .from('contestants')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContestants(data || []);
    } catch (error: any) {
      toast({
        title: "참가자 목록 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contestant: Contestant) => {
    setEditingId(contestant.id);
    setEditForm({
      name: contestant.name,
      song: contestant.song,
      youtube_url: contestant.youtube_url,
      views: contestant.views,
      likes: contestant.likes
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    // YouTube URL 유효성 검사
    if (!isValidYouTubeUrl(editForm.youtube_url)) {
      toast({
        title: "YouTube URL 오류",
        description: "유효한 YouTube 링크를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('contestants')
        .update(editForm)
        .eq('id', editingId);

      if (error) throw error;

      await fetchContestants();
      setEditingId(null);
      toast({
        title: "참가자 정보 수정 완료",
        description: "참가자 정보가 성공적으로 수정되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "수정 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      song: "",
      youtube_url: "",
      views: 0,
      likes: 0
    });
  };

  const handleAdd = async () => {
    if (!newContestant.name || !newContestant.song || !newContestant.youtube_url) {
      toast({
        title: "입력 오류",
        description: "이름, 곡명, YouTube URL은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    // YouTube URL 유효성 검사
    if (!isValidYouTubeUrl(newContestant.youtube_url)) {
      toast({
        title: "YouTube URL 오류",
        description: "유효한 YouTube 링크를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('contestants')
        .insert([newContestant]);

      if (error) throw error;

      await fetchContestants();
      setNewContestant({
        name: "",
        song: "",
        youtube_url: "",
        views: 0,
        likes: 0
      });
      setShowAddForm(false);
      toast({
        title: "참가자 추가 완료",
        description: "새 참가자가 성공적으로 추가되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "추가 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 참가자를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from('contestants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchContestants();
      toast({
        title: "참가자 삭제 완료",
        description: "참가자가 성공적으로 삭제되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const success = await syncAllContestantsVideoInfo();
      if (success) {
        await fetchContestants();
        toast({
          title: "동기화 완료",
          description: "모든 참가자의 YouTube 데이터가 동기화되었습니다.",
        });
      } else {
        toast({
          title: "동기화 실패",
          description: "YouTube 데이터 동기화에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "동기화 오류",
        description: error.message || "동기화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncSingle = async (contestant: Contestant) => {
    if (!contestant.youtube_id) return;

    try {
      const videoInfo = await getYouTubeVideoInfo(contestant.youtube_id);
      if (videoInfo) {
        const { error } = await supabase
          .from('contestants')
          .update({
            views: videoInfo.viewCount,
            likes: videoInfo.likeCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', contestant.id);

        if (error) throw error;

        await fetchContestants();
        toast({
          title: "동기화 완료",
          description: `${contestant.name}의 데이터가 동기화되었습니다.`,
        });
      } else {
        toast({
          title: "동기화 실패",
          description: "YouTube 데이터를 가져올 수 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "동기화 오류",
        description: error.message || "동기화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">관리자 페이지 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                🎵 관리자 페이지
              </h1>
              <p className="text-muted-foreground text-lg">
                참가자 정보를 관리하고 YouTube 영상 링크를 수정할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSyncAll}
                disabled={syncing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sync className="w-4 h-4 mr-2" />
                )}
                {syncing ? "동기화 중..." : "전체 동기화"}
              </Button>
              <Button
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                variant="outline"
                className={autoSyncEnabled ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                <Settings className="w-4 h-4 mr-2" />
                {autoSyncEnabled ? "자동 동기화 ON" : "자동 동기화 OFF"}
              </Button>
            </div>
          </div>
        </div>

        {/* 참가자 추가 폼 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              새 참가자 추가
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAddForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-name">이름</Label>
                    <Input
                      id="new-name"
                      value={newContestant.name}
                      onChange={(e) => setNewContestant(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="참가자 이름"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-song">곡명</Label>
                    <Input
                      id="new-song"
                      value={newContestant.song}
                      onChange={(e) => setNewContestant(prev => ({ ...prev, song: e.target.value }))}
                      placeholder="곡명"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-youtube">YouTube URL</Label>
                    <Input
                      id="new-youtube"
                      value={newContestant.youtube_url}
                      onChange={(e) => setNewContestant(prev => ({ ...prev, youtube_url: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {newContestant.youtube_url && isValidYouTubeUrl(newContestant.youtube_url) && (
                      <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        유효한 YouTube 링크입니다
                      </div>
                    )}
                    {newContestant.youtube_url && !isValidYouTubeUrl(newContestant.youtube_url) && (
                      <div className="mt-2 text-sm text-red-600">
                        유효하지 않은 YouTube 링크입니다
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="new-views">조회수</Label>
                    <Input
                      id="new-views"
                      type="number"
                      value={newContestant.views}
                      onChange={(e) => setNewContestant(prev => ({ ...prev, views: parseInt(e.target.value) || 0 }))}
                      placeholder="조회수"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd}>
                    <Save className="w-4 h-4 mr-2" />
                    추가
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    <X className="w-4 h-4 mr-2" />
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                새 참가자 추가
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 참가자 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contestants.map((contestant) => {
            const thumbnailUrl = getThumbnailUrlFromLink(contestant.youtube_url, 'high');
            return (
              <Card key={contestant.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-black">
                  {thumbnailUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={thumbnailUrl}
                        alt={`${contestant.name} - ${contestant.song}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
                        <Button
                          onClick={() => window.open(contestant.youtube_url, '_blank')}
                          size="lg"
                          className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                        >
                          <Play className="w-8 h-8 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-white">썸네일 없음</span>
                    </div>
                  )}
                </div>
              <CardContent className="p-4">
                {editingId === contestant.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`edit-name-${contestant.id}`}>이름</Label>
                      <Input
                        id={`edit-name-${contestant.id}`}
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-song-${contestant.id}`}>곡명</Label>
                      <Input
                        id={`edit-song-${contestant.id}`}
                        value={editForm.song}
                        onChange={(e) => setEditForm(prev => ({ ...prev, song: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-youtube-${contestant.id}`}>YouTube URL</Label>
                      <Input
                        id={`edit-youtube-${contestant.id}`}
                        value={editForm.youtube_url}
                        onChange={(e) => setEditForm(prev => ({ ...prev, youtube_url: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {editForm.youtube_url && isValidYouTubeUrl(editForm.youtube_url) && (
                        <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" />
                          유효한 YouTube 링크입니다
                        </div>
                      )}
                      {editForm.youtube_url && !isValidYouTubeUrl(editForm.youtube_url) && (
                        <div className="mt-2 text-sm text-red-600">
                          유효하지 않은 YouTube 링크입니다
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`edit-views-${contestant.id}`}>조회수</Label>
                        <Input
                          id={`edit-views-${contestant.id}`}
                          type="number"
                          value={editForm.views}
                          onChange={(e) => setEditForm(prev => ({ ...prev, views: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-likes-${contestant.id}`}>좋아요</Label>
                        <Input
                          id={`edit-likes-${contestant.id}`}
                          type="number"
                          value={editForm.likes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, likes: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        저장
                      </Button>
                      <Button variant="outline" onClick={handleCancel} size="sm">
                        <X className="w-4 h-4 mr-2" />
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">{contestant.name}</h3>
                    <p className="text-sm text-muted-foreground">{contestant.song}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>조회수: {contestant.views.toLocaleString()}</span>
                      <span>좋아요: {contestant.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={() => handleEdit(contestant)} 
                        size="sm" 
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        수정
                      </Button>
                      <Button 
                        onClick={() => handleSyncSingle(contestant)} 
                        size="sm" 
                        variant="outline"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Sync className="w-4 h-4 mr-2" />
                        동기화
                      </Button>
                      <Button 
                        onClick={() => handleDelete(contestant.id)} 
                        size="sm" 
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Admin;
