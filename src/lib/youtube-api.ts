/**
 * YouTube Data API를 통한 영상 정보 가져오기
 */

interface YouTubeVideoInfo {
  title: string;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  channelTitle: string;
}

/**
 * YouTube Data API를 통해 영상 정보를 가져옵니다.
 * 실제 구현에서는 서버 사이드에서 API 키를 사용해야 합니다.
 */
export const getYouTubeVideoInfo = async (videoId: string): Promise<YouTubeVideoInfo | null> => {
  try {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('VITE_YOUTUBE_API_KEY not set. Skipping live fetch.');
      return null;
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(
      videoId
    )}&part=snippet,statistics,contentDetails&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('YouTube API error status:', response.status, await response.text());
      return null;
    }
    const data = await response.json();
    const item = data.items?.[0];
    if (!item) return null;

    const info: YouTubeVideoInfo = {
      title: item.snippet?.title ?? '',
      viewCount: Number(item.statistics?.viewCount ?? 0),
      likeCount: Number(item.statistics?.likeCount ?? 0),
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: item.snippet?.publishedAt ?? '',
      duration: item.contentDetails?.duration ?? '',
      channelTitle: item.snippet?.channelTitle ?? ''
    };

    return info;
  } catch (error) {
    console.error('Error fetching YouTube video info:', error);
    return null;
  }
};

/**
 * 여러 영상의 정보를 한 번에 가져옵니다.
 */
export const getMultipleYouTubeVideoInfo = async (videoIds: string[]): Promise<Record<string, YouTubeVideoInfo | null>> => {
  const results: Record<string, YouTubeVideoInfo | null> = {};
  
  // 실제 구현에서는 batch API를 사용하거나 병렬 처리합니다.
  for (const videoId of videoIds) {
    results[videoId] = await getYouTubeVideoInfo(videoId);
  }
  
  return results;
};

/**
 * 영상 정보를 데이터베이스에 동기화합니다.
 */
export const syncVideoInfoToDatabase = async (videoId: string, videoInfo: YouTubeVideoInfo) => {
  try {
    // Supabase를 통해 데이터베이스 업데이트
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { error } = await supabase
      .from('contestants')
      .update({
        views: videoInfo.viewCount,
        likes: videoInfo.likeCount,
        updated_at: new Date().toISOString()
      })
      .eq('youtube_id', videoId);

    if (error) {
      console.error('Error syncing video info to database:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error syncing video info:', error);
    return false;
  }
};

/**
 * 모든 참가자의 영상 정보를 동기화합니다.
 */
export const syncAllContestantsVideoInfo = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // 모든 참가자의 YouTube ID 가져오기
    const { data: contestants, error } = await supabase
      .from('contestants')
      .select('id, youtube_id, youtube_url');

    if (error) {
      console.error('Error fetching contestants:', error);
      return false;
    }

    if (!contestants || contestants.length === 0) {
      return true;
    }

    // 각 참가자의 영상 정보 동기화
    const syncPromises = contestants.map(async (contestant) => {
      if (contestant.youtube_id) {
        const videoInfo = await getYouTubeVideoInfo(contestant.youtube_id);
        if (videoInfo) {
          return await syncVideoInfoToDatabase(contestant.youtube_id, videoInfo);
        }
      }
      return false;
    });

    const results = await Promise.all(syncPromises);
    const successCount = results.filter(Boolean).length;

    console.log(`Successfully synced ${successCount}/${contestants.length} contestants`);
    return successCount > 0;
  } catch (error) {
    console.error('Error syncing all contestants:', error);
    return false;
  }
};

/**
 * 주기적으로 영상 정보를 동기화하는 함수
 */
export const startPeriodicSync = (intervalMinutes: number = 30) => {
  // 즉시 한 번 실행
  syncAllContestantsVideoInfo();
  
  // 주기적으로 실행
  const interval = setInterval(() => {
    syncAllContestantsVideoInfo();
  }, intervalMinutes * 60 * 1000);

  return () => clearInterval(interval);
};
