// 참가자 데이터 확인 스크립트
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmujzyyvdllvapbphtnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContestants() {
  console.log('🔍 참가자 데이터 확인 중...');
  
  try {
    const { data: contestants, error } = await supabase
      .from('contestants')
      .select('id, name, song, youtube_url, youtube_id, views, likes')
      .order('name');

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log(`📊 총 ${contestants.length}명의 참가자 데이터:`);
    console.log('='.repeat(80));
    
    contestants.forEach((contestant, index) => {
      console.log(`${index + 1}. ${contestant.name}`);
      console.log(`   곡명: ${contestant.song}`);
      console.log(`   YouTube URL: ${contestant.youtube_url || '없음'}`);
      console.log(`   YouTube ID: ${contestant.youtube_id || '없음'}`);
      console.log(`   조회수: ${contestant.views?.toLocaleString() || '0'}`);
      console.log(`   좋아요: ${contestant.likes?.toLocaleString() || '0'}`);
      console.log('-'.repeat(40));
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkContestants();
