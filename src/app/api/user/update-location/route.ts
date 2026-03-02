import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/user/update-location - 사용자 위치 정보 업데이트 (country가 없는 경우만)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 로그인 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 현재 프로필 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('country')
      .eq('id', user.id)
      .single();

    // 이미 country 정보가 있으면 업데이트하지 않음
    if (profile?.country) {
      return NextResponse.json({
        success: true,
        message: 'Location already exists',
        updated: false
      });
    }

    // IP 주소 수집
    const signupIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     null;

    // IP 기반 geolocation 정보 수집
    let country = null;
    let region = null;

    if (signupIp) {
      try {
        // ip-api.com 무료 API 사용 (비상업용 무제한)
        const geoResponse = await fetch(`http://ip-api.com/json/${signupIp}?fields=status,country,countryCode,region,regionName,city`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            country = geoData.countryCode || null;
            region = geoData.city || geoData.regionName || null;
            console.log('[UPDATE LOCATION] Geo info:', {
              signupIp,
              country,
              region,
              userId: user.id
            });
          }
        }
      } catch (error) {
        console.error('[UPDATE LOCATION] Geo API error:', error);
      }
    }

    // 위치 정보가 있으면 업데이트
    if (country) {
      const { error } = await supabase
        .from('profiles')
        .update({
          country,
          region,
          signup_ip: signupIp
        })
        .eq('id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Location updated',
        updated: true,
        country,
        region
      });
    }

    return NextResponse.json({
      success: true,
      message: 'No location data available',
      updated: false
    });

  } catch (error: any) {
    console.error('POST /api/user/update-location error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
