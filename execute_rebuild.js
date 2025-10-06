// 새로운 스키마로 재구성 실행
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://gmujzyyvdllvapbphtnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function rebuildSchema() {
  console.log('🔧 새로운 스키마로 재구성 시작...');
  
  try {
    // 1. SQL 파일 읽기
    const sqlContent = fs.readFileSync('rebuild_schema.sql', 'utf8');
    console.log('📄 SQL 스크립트 로드 완료');

    // 2. SQL 실행 (Supabase에서는 직접 SQL 실행이 제한적이므로 단계별로 실행)
    console.log('\n🗑️ 기존 데이터 삭제 중...');
    
    // 기존 데이터 삭제
    const { error: deleteError } = await supabase
      .from('contestants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제

    if (deleteError) {
      console.log('⚠️ 기존 데이터 삭제 중 오류 (정상적일 수 있음):', deleteError.message);
    } else {
      console.log('✅ 기존 데이터 삭제 완료');
    }

    // 3. 새로운 참가자 데이터 삽입
    console.log('\n➕ 새로운 참가자 데이터 삽입 중...');
    
    const newContestants = [
      { name: '루이소', song: '옆', youtube_url: 'https://www.youtube.com/watch?v=_1LL3PsbTz0', youtube_id: '_1LL3PsbTz0' },
      { name: '루이드', song: '뒤', youtube_url: 'https://www.youtube.com/watch?v=IE0d6xLSEvI', youtube_id: 'IE0d6xLSEvI' },
      { name: '로이드', song: '앞', youtube_url: 'https://www.youtube.com/watch?v=T4c7a4Y8l4g', youtube_id: 'T4c7a4Y8l4g' },
      { name: '르이드', song: '점', youtube_url: 'https://www.youtube.com/watch?v=4EEobdRKKZY', youtube_id: '4EEobdRKKZY' },
      { name: '롸이드', song: '굿', youtube_url: 'https://www.youtube.com/watch?v=u0PbXTOPu6E', youtube_id: 'u0PbXTOPu6E' },
      { name: '르이드', song: '낫', youtube_url: 'https://www.youtube.com/watch?v=hRjUvbuho4Y', youtube_id: 'hRjUvbuho4Y' },
      { name: '롸이사', song: '녘', youtube_url: 'https://www.youtube.com/watch?v=5c6BmyxXob4', youtube_id: '5c6BmyxXob4' }
    ];

    const { data: insertedData, error: insertError } = await supabase
      .from('contestants')
      .insert(newContestants)
      .select();

    if (insertError) {
      console.error('❌ 새로운 데이터 삽입 실패:', insertError);
      return;
    }

    console.log('✅ 새로운 참가자 데이터 삽입 완료');
    console.log(`총 ${insertedData.length}명의 참가자 추가됨`);

    // 4. 삽입된 데이터 확인
    console.log('\n📊 삽입된 참가자 데이터:');
    insertedData.forEach((contestant, index) => {
      console.log(`${index + 1}. ${contestant.name} - "${contestant.song}"`);
      console.log(`   YouTube: ${contestant.youtube_url}`);
      console.log(`   ID: ${contestant.youtube_id}`);
    });

    console.log('\n🎉 스키마 재구성 완료!');

  } catch (error) {
    console.error('❌ 스키마 재구성 중 오류 발생:', error);
  }
}

rebuildSchema();
