// 참가자 데이터 수정 스크립트 v2
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmujzyyvdllvapbphtnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContestantsV2() {
  console.log('🔧 참가자 데이터 수정 v2 시작...');
  
  try {
    // 1. 루이드 참가자 수정 (YouTube ID만 추출)
    console.log('\n🎬 루이드 참가자 수정 중...');
    const { error: updateError1 } = await supabase
      .from('contestants')
      .update({
        youtube_id: 'IE0d6xLSEvI',
        youtube_url: 'https://www.youtube.com/watch?v=IE0d6xLSEvI'
      })
      .eq('name', '루이드');

    if (updateError1) {
      console.error('❌ 루이드 데이터 수정 실패:', updateError1);
    } else {
      console.log('✅ 루이드 데이터 수정 완료');
    }

    // 2. 박준호 참가자 수정 (새로운 YouTube 영상으로 변경)
    console.log('\n🎬 박준호 참가자 수정 중...');
    const { error: updateError2 } = await supabase
      .from('contestants')
      .update({
        youtube_id: '3JWTaaS7LdU',
        youtube_url: 'https://www.youtube.com/watch?v=3JWTaaS7LdU'
      })
      .eq('name', '박준호');

    if (updateError2) {
      console.error('❌ 박준호 데이터 수정 실패:', updateError2);
    } else {
      console.log('✅ 박준호 데이터 수정 완료');
    }

    // 3. 수정된 데이터 확인
    console.log('\n📊 수정된 참가자 데이터 확인:');
    const { data: contestants, error: fetchError } = await supabase
      .from('contestants')
      .select('name, youtube_url, youtube_id')
      .in('name', ['루이드', '박준호']);

    if (fetchError) {
      console.error('❌ 데이터 조회 실패:', fetchError);
    } else {
      contestants.forEach(contestant => {
        console.log(`${contestant.name}:`);
        console.log(`  YouTube URL: ${contestant.youtube_url}`);
        console.log(`  YouTube ID: ${contestant.youtube_id}`);
      });
    }

    console.log('\n🎉 참가자 데이터 수정 완료!');

  } catch (error) {
    console.error('❌ 수정 중 오류 발생:', error);
  }
}

fixContestantsV2();
