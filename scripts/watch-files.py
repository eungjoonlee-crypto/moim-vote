#!/usr/bin/env python3
# 🤖 AI 자동 커밋 파일 감시 스크립트

import os
import subprocess
import sys
import time
from pathlib import Path

def run_auto_commit():
    """자동 커밋 스크립트 실행"""
    try:
        script_path = Path(__file__).parent / "auto-commit.sh"
        result = subprocess.run([str(script_path)], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("🤖 자동 커밋 실행됨")
            if result.stdout:
                print(result.stdout)
        else:
            print("⚠️ 자동 커밋 스크립트 실행 중 오류:", result.stderr)
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

def watch_directory():
    """디렉토리 감시 및 자동 커밋"""
    print("🚀 AI 자동 커밋 감시 시스템 시작...")
    print("📁 감시 대상: src/ 디렉토리")
    print("⏹️  종료하려면 Ctrl+C를 누르세요")
    
    last_modified = {}
    
    while True:
        try:
            # src 디렉토리 내 모든 파일의 수정 시간 확인
            src_path = Path("src")
            if not src_path.exists():
                print("❌ src 디렉토리가 없습니다.")
                break
                
            current_modified = {}
            for file_path in src_path.rglob("*"):
                if file_path.is_file():
                    current_modified[str(file_path)] = file_path.stat().st_mtime
            
            # 변경된 파일이 있는지 확인
            if last_modified:
                changed_files = []
                for file_path, mtime in current_modified.items():
                    if file_path not in last_modified or last_modified[file_path] != mtime:
                        changed_files.append(file_path)
                
                if changed_files:
                    print(f"📝 {len(changed_files)}개 파일 변경 감지됨")
                    for file_path in changed_files[:3]:  # 최대 3개만 표시
                        print(f"   - {file_path}")
                    if len(changed_files) > 3:
                        print(f"   ... 및 {len(changed_files) - 3}개 더")
                    
                    # 자동 커밋 실행
                    run_auto_commit()
            
            last_modified = current_modified
            time.sleep(2)  # 2초마다 확인
            
        except KeyboardInterrupt:
            print("\n🛑 감시 시스템 종료")
            break
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            time.sleep(5)

if __name__ == "__main__":
    watch_directory()
