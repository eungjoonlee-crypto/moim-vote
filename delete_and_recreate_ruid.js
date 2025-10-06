// 루이드 참가자 삭제 후 재생성
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmujzyyvdllvapbphtnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAndRecreateRuid() {
  console.log('🔧 루이드 참가자 삭제 후 재생성 중...');
  
  try {
    // 1. 루이드 참가자 삭제
    console.log('\n🗑️ 루이드 참가자 삭제 중...');
    const { error: deleteError } = await supabase
      .from('contestants')
      .delete()
      .eq('name', '루이드');

    if (deleteError) {
      console.error('❌ 루이드 참가자 삭제 실패:', deleteError);
      return;
    }

    console.log('✅ 루이드 참가자 삭제 완료');

    // 2. 새로운 루이드 참가자 생성
    console.log('\n➕ 새로운 루이드 참가자 생성 중...');
    const { data: newRuid, error: insertError } = await supabase
      .from('contestants')
      .insert({
        name: '루이드',
        song: '옆',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        views: 0,
        likes: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ 새로운 루이드 참가자 생성 실패:', insertError);
      return;
    }

    console.log('✅ 새로운 루이드 참가자 생성 완료');
    console.log(`새 ID: ${newRuid.id}`);

    // 3. 생성된 데이터 확인
    console.log('\n📊 생성된 루이드 참가자 데이터:');
    console.log(`이름: ${newRuid.name}`);
    console.log(`곡명: ${newRuid.song}`);
    console.log(`YouTube URL: ${newRuid.youtube_url}`);
    console.log(`YouTube ID: ${newRuid.youtube_id}`);
    console.log(`조회수: ${newRuid.views}`);
    console.log(`좋아요: ${newRuid.likes}`);

    console.log('\n🎉 루이드 참가자 삭제 후 재생성 완료!');

  } catch (error) {
    console.error('❌ 삭제 후 재생성 중 오류 발생:', error);
  }
}

deleteAndRecreateRuid();
