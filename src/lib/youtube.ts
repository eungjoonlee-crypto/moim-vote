/**
 * YouTube 링크에서 영상 ID를 추출하는 함수들
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
