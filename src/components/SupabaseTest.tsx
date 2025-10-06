import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'not-authenticated'>('checking');
  const [user, setUser] = useState<any>(null);
  const [contestants, setContestants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // 1. Supabase 연결 테스트
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          setConnectionStatus('error');
          setError(`Auth Error: ${authError.message}`);
          return;
        }

        setConnectionStatus('connected');
        setAuthStatus(session ? 'authenticated' : 'not-authenticated');
        setUser(session?.user || null);

        // 2. 데이터베이스 연결 테스트
        const { data, error: dbError } = await supabase
          .from('contestants')
          .select('*')
          .limit(3);

        if (dbError) {
          setError(`Database Error: ${dbError.message}`);
          return;
        }

        setContestants(data || []);
      } catch (err: any) {
        setConnectionStatus('error');
        setError(`Connection Error: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(`Login Error: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setAuthStatus('not-authenticated');
    } catch (error: any) {
      setError(`Logout Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Supabase 연결 상태 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 연결 상태 */}
          <div className="flex items-center gap-3">
            {connectionStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin" />}
            {connectionStatus === 'connected' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {connectionStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
            <span className="font-medium">
              Supabase 연결: {
                connectionStatus === 'checking' ? '확인 중...' :
                connectionStatus === 'connected' ? '✅ 연결됨' :
                '❌ 연결 실패'
              }
            </span>
          </div>

          {/* 인증 상태 */}
          <div className="flex items-center gap-3">
            {authStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin" />}
            {authStatus === 'authenticated' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {authStatus === 'not-authenticated' && <XCircle className="w-5 h-5 text-yellow-500" />}
            <span className="font-medium">
              인증 상태: {
                authStatus === 'checking' ? '확인 중...' :
                authStatus === 'authenticated' ? '✅ 로그인됨' :
                '⚠️ 로그인 필요'
              }
            </span>
          </div>

          {/* 사용자 정보 */}
          {user && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                👤 사용자: {user.email}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                ID: {user.id}
              </p>
            </div>
          )}

          {/* 데이터베이스 테스트 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              📊 참가자 데이터: {contestants.length}개 로드됨
            </p>
            {contestants.length > 0 && (
              <div className="mt-2 space-y-1">
                {contestants.map((contestant) => (
                  <p key={contestant.id} className="text-xs text-blue-600 dark:text-blue-300">
                    • {contestant.name} - {contestant.song}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                ❌ 에러: {error}
              </p>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-3">
            {authStatus === 'not-authenticated' && (
              <Button onClick={handleGoogleLogin} className="bg-blue-600 hover:bg-blue-700">
                Google 로그인 테스트
              </Button>
            )}
            {authStatus === 'authenticated' && (
              <Button onClick={handleLogout} variant="outline">
                로그아웃
              </Button>
            )}
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
