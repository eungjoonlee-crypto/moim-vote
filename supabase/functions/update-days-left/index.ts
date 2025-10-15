// Supabase Edge Function: 남은 일수 자동 업데이트
// 2025년 10월 22일까지 남은 일수를 계산하여 site_settings 업데이트

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    // CORS 헤더 설정
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Supabase 클라이언트 초기화 (Service Role Key 사용)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 목표 날짜: 2025년 10월 21일
    const targetDate = new Date('2025-10-21');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

    // 남은 일수 계산
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = diffDays < 0 ? 0 : diffDays;

    console.log(`계산된 남은 일수: ${daysLeft}일`);

    // site_settings에서 첫 번째 행의 ID 가져오기
    const { data: settingsData, error: selectError } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .single();

    if (selectError) {
      console.error('site_settings 조회 오류:', selectError);
      throw new Error(`site_settings 조회 실패: ${selectError.message}`);
    }

    if (!settingsData || !settingsData.id) {
      throw new Error('site_settings 테이블에 데이터가 없습니다.');
    }

    // hero_days_left 업데이트
    const { data: updateData, error: updateError } = await supabase
      .from('site_settings')
      .update({
        hero_days_left: daysLeft,
        updated_at: new Date().toISOString()
      })
      .eq('id', settingsData.id)
      .select();

    if (updateError) {
      console.error('site_settings 업데이트 오류:', updateError);
      throw new Error(`업데이트 실패: ${updateError.message}`);
    }

    console.log('업데이트 성공:', updateData);

    // 성공 응답 반환
    return new Response(
      JSON.stringify({
        success: true,
        daysLeft,
        message: `남은 일수가 ${daysLeft}일로 업데이트되었습니다.`,
        updatedAt: new Date().toISOString(),
        targetDate: '2025-10-21',
        data: updateData
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Edge Function 오류:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});

