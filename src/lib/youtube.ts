/**
 * YouTube 링크에서 영상 ID를 추출하고 썸네일을 가져오는 함수들
 */

/**
 * YouTube URL에서 영상 ID를 추출합니다.
 * 지원하는 URL 형식:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export const extractVideoId = (url: string): string | null => {
  if (!url) return null;

  // YouTube 링크 패턴들
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // https://youtu.be/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // https://m.youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // https://youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * YouTube 링크가 유효한지 확인합니다.
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

/**
 * YouTube 영상 ID를 임베드 URL로 변환합니다.
 */
export const getEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * YouTube 영상 ID를 시청 URL로 변환합니다.
 */
export const getWatchUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * YouTube 링크를 입력받아 임베드 URL을 반환합니다.
 */
export const getEmbedUrlFromLink = (url: string): string | null => {
  const videoId = extractVideoId(url);
  return videoId ? getEmbedUrl(videoId) : null;
};

/**
 * YouTube 영상 ID로 썸네일 URL을 생성합니다.
 */
export const getThumbnailUrl = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * YouTube 링크에서 썸네일 URL을 추출합니다.
 */
export const getThumbnailUrlFromLink = (url: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string | null => {
  const videoId = extractVideoId(url);
  return videoId ? getThumbnailUrl(videoId, quality) : null;
};

/**
 * YouTube Data API를 통해 영상 정보를 가져옵니다.
 * 실제 구현에서는 서버 사이드에서 API 키를 사용해야 합니다.
 */
export const getVideoInfo = async (videoId: string): Promise<{
  title: string;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
} | null> => {
  try {
    // 실제 구현에서는 YouTube Data API를 사용해야 합니다.
    // 여기서는 더미 데이터를 반환합니다.
    return {
      title: `YouTube Video ${videoId}`,
      viewCount: Math.floor(Math.random() * 1000000) + 10000,
      likeCount: Math.floor(Math.random() * 10000) + 100,
      thumbnail: getThumbnailUrl(videoId, 'high')
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
};

/**
 * YouTube 링크에서 영상 정보를 가져옵니다.
 */
export const getVideoInfoFromLink = async (url: string): Promise<{
  title: string;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
} | null> => {
  const videoId = extractVideoId(url);
  if (!videoId) return null;
  
  return await getVideoInfo(videoId);
};
