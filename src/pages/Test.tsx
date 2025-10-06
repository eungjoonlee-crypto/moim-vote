import { SupabaseTest } from "@/components/SupabaseTest";

const Test = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🧪 Supabase 연결 테스트
          </h1>
          <p className="text-muted-foreground">
            Supabase Auth 및 데이터베이스 연결 상태를 확인합니다
          </p>
        </div>
        <SupabaseTest />
      </div>
    </div>
  );
};

export default Test;
