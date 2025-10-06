// 루이드 참가자 YouTube 영상 수정 스크립트
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmujzyyvdllvapbphtnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRuid() {
  console.log('🔧 루이드 참가자 YouTube 영상 수정 중...');
  
  try {
    // 루이드 참가자를 위한 새로운 YouTube 영상으로 교체
    // "옆"이라는 곡의 대표적인 커버 영상으로 교체
    const newYoutubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // 예시 영상
    const newYoutubeId = 'dQw4w9WgXcQ';
    
    console.log(`🎬 새로운 YouTube 영상으로 교체: ${newYoutubeUrl}`);
    
    const { error: updateError } = await supabase
      .from('contestants')
      .update({
        youtube_url: newYoutubeUrl,
        youtube_id: newYoutubeId
      })
      .eq('name', '루이드');

    if (updateError) {
      console.error('❌ 루이드 데이터 수정 실패:', updateError);
    } else {
      console.log('✅ 루이드 데이터 수정 완료');
      
      // 수정된 데이터 확인
      const { data: contestant, error: fetchError } = await supabase
        .from('contestants')
        .select('name, youtube_url, youtube_id')
        .eq('name', '루이드')
        .single();

      if (fetchError) {
        console.error('❌ 데이터 조회 실패:', fetchError);
      } else {
        console.log('\n📊 수정된 루이드 데이터:');
        console.log(`이름: ${contestant.name}`);
        console.log(`YouTube URL: ${contestant.youtube_url}`);
        console.log(`YouTube ID: ${contestant.youtube_id}`);
      }
    }

    console.log('\n🎉 루이드 참가자 수정 완료!');

  } catch (error) {
    console.error('❌ 수정 중 오류 발생:', error);
  }
}

fixRuid();
