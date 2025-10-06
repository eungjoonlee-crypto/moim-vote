// Supabase에서 직접 루이드 참가자 데이터 수정
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmujzyyvdllvapbphtnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function directSupabaseFix() {
  console.log('🔧 Supabase에서 직접 루이드 참가자 데이터 수정 중...');
  
  try {
    // 1. 현재 루이드 참가자 데이터 확인
    console.log('\n📊 현재 루이드 참가자 데이터:');
    const { data: currentData, error: fetchError } = await supabase
      .from('contestants')
      .select('name, youtube_url, youtube_id, views, likes')
      .eq('name', '루이드')
      .single();

    if (fetchError) {
      console.error('❌ 현재 데이터 조회 실패:', fetchError);
      return;
    }

    console.log(`이름: ${currentData.name}`);
    console.log(`YouTube URL: ${currentData.youtube_url}`);
    console.log(`YouTube ID: ${currentData.youtube_id}`);
    console.log(`조회수: ${currentData.views}`);
    console.log(`좋아요: ${currentData.likes}`);

    // 2. 루이드 참가자 데이터 수정
    console.log('\n🎬 루이드 참가자 YouTube 링크 수정 중...');
    const { error: updateError } = await supabase
      .from('contestants')
      .update({
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        views: 0,
        likes: 0
      })
      .eq('name', '루이드');

    if (updateError) {
      console.error('❌ 루이드 데이터 수정 실패:', updateError);
      return;
    }

    console.log('✅ 루이드 데이터 수정 완료');

    // 3. 수정된 데이터 확인
    console.log('\n📊 수정된 루이드 참가자 데이터:');
    const { data: updatedData, error: fetchError2 } = await supabase
      .from('contestants')
      .select('name, youtube_url, youtube_id, views, likes')
      .eq('name', '루이드')
      .single();

    if (fetchError2) {
      console.error('❌ 수정된 데이터 조회 실패:', fetchError2);
    } else {
      console.log(`이름: ${updatedData.name}`);
      console.log(`YouTube URL: ${updatedData.youtube_url}`);
      console.log(`YouTube ID: ${updatedData.youtube_id}`);
      console.log(`조회수: ${updatedData.views}`);
      console.log(`좋아요: ${updatedData.likes}`);
    }

    console.log('\n🎉 루이드 참가자 데이터 수정 완료!');

  } catch (error) {
    console.error('❌ 수정 중 오류 발생:', error);
  }
}

directSupabaseFix();
