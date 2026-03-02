'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * 로그인한 사용자의 위치 정보를 자동으로 업데이트하는 컴포넌트
 * (기존 가입자 중 country 정보가 없는 경우만 업데이트)
 */
export default function LocationUpdater() {
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // 한 번만 실행
    if (hasChecked) return;

    const updateLocation = async () => {
      try {
        const supabase = createClient();

        // 로그인 확인
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 위치 정보 업데이트 시도
        const response = await fetch('/api/user/update-location', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.updated) {
            console.log('Location updated:', data.country, data.region);
          }
        }
      } catch (error) {
        console.error('Failed to update location:', error);
      } finally {
        setHasChecked(true);
      }
    };

    updateLocation();
  }, [hasChecked]);

  // UI를 렌더링하지 않음 (백그라운드 작업만 수행)
  return null;
}
