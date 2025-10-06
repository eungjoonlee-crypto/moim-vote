const Debug = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          🐛 디버그 페이지
        </h1>
        <p className="text-muted-foreground text-lg">
          이 페이지가 보인다면 React가 정상적으로 작동하고 있습니다.
        </p>
        <div className="mt-8 p-4 bg-card rounded-lg">
          <h2 className="text-xl font-semibold mb-2">시스템 상태</h2>
          <ul className="text-left space-y-2">
            <li>✅ React 컴포넌트 렌더링</li>
            <li>✅ Tailwind CSS 스타일링</li>
            <li>✅ TypeScript 컴파일</li>
            <li>✅ Vite 개발 서버</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Debug;
