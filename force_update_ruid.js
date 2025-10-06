// 강제로 루이드 참가자 데이터 업데이트
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmujzyyvdllvapbphtnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdateRuid() {
  console.log('🔧 강제로 루이드 참가자 데이터 업데이트 중...');
  
  try {
    // 1. 모든 참가자 데이터 확인
    console.log('\n📊 모든 참가자 데이터 확인:');
    const { data: allContestants, error: fetchAllError } = await supabase
      .from('contestants')
      .select('id, name, youtube_url, youtube_id, views, likes')
      .order('name');

    if (fetchAllError) {
      console.error('❌ 모든 데이터 조회 실패:', fetchAllError);
      return;
    }

    console.log(`총 ${allContestants.length}명의 참가자:`);
    allContestants.forEach((contestant, index) => {
      console.log(`${index + 1}. ${contestant.name} (ID: ${contestant.id})`);
      console.log(`   YouTube URL: ${contestant.youtube_url}`);
      console.log(`   YouTube ID: ${contestant.youtube_id}`);
      console.log(`   조회수: ${contestant.views}, 좋아요: ${contestant.likes}`);
    });

    // 2. 루이드 참가자 ID 찾기
    const ruidContestant = allContestants.find(c => c.name === '루이드');
    if (!ruidContestant) {
      console.error('❌ 루이드 참가자를 찾을 수 없습니다.');
      return;
    }

    console.log(`\n🎬 루이드 참가자 ID: ${ruidContestant.id}`);

    // 3. ID로 직접 업데이트
    console.log('\n🔧 ID로 직접 업데이트 중...');
    const { error: updateError } = await supabase
      .from('contestants')
      .update({
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        views: 0,
        likes: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', ruidContestant.id);

    if (updateError) {
      console.error('❌ 루이드 데이터 업데이트 실패:', updateError);
      return;
    }

    console.log('✅ 루이드 데이터 업데이트 완료');

    // 4. 업데이트된 데이터 확인
    console.log('\n📊 업데이트된 루이드 참가자 데이터:');
    const { data: updatedData, error: fetchUpdatedError } = await supabase
      .from('contestants')
      .select('name, youtube_url, youtube_id, views, likes')
      .eq('id', ruidContestant.id)
      .single();

    if (fetchUpdatedError) {
      console.error('❌ 업데이트된 데이터 조회 실패:', fetchUpdatedError);
    } else {
      console.log(`이름: ${updatedData.name}`);
      console.log(`YouTube URL: ${updatedData.youtube_url}`);
      console.log(`YouTube ID: ${updatedData.youtube_id}`);
      console.log(`조회수: ${updatedData.views}`);
      console.log(`좋아요: ${updatedData.likes}`);
    }

    console.log('\n🎉 루이드 참가자 강제 업데이트 완료!');

  } catch (error) {
    console.error('❌ 강제 업데이트 중 오류 발생:', error);
  }
}

forceUpdateRuid();
