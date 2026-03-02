import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/admin/users - 전체 사용자 목록 조회 (관리자 전용)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const is_banned = searchParams.get('is_banned');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const admin = createAdminClient();

    // 3. last_sign_in_at 정렬: listUsers()로 전체 auth 유저 수집 후 소팅
    if (sort === 'last_sign_in_at') {
      // 3-1. 필터 조건에 맞는 전체 프로필 조회 (페이지 없이)
      let profileQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (search) profileQuery = profileQuery.ilike('username', `%${search}%`);
      if (role) profileQuery = profileQuery.eq('role', role);
      if (is_banned !== null && is_banned !== '') {
        profileQuery = profileQuery.eq('is_banned', is_banned === 'true');
      }

      const { data: allProfiles, count, error: profileError } = await profileQuery;
      if (profileError) throw profileError;

      const profileList = allProfiles || [];
      const profileIdSet = new Set(profileList.map((p: any) => p.id));

      // 3-2. 전체 auth 유저 listUsers() 수집
      const authMap: Record<string, any> = {};
      let authPage = 1;
      while (true) {
        const { data: authData, error: authError } = await admin.auth.admin.listUsers({
          page: authPage,
          perPage: 1000,
        });
        if (authError || !authData?.users?.length) break;
        for (const u of authData.users) {
          if (profileIdSet.has(u.id)) authMap[u.id] = u;
        }
        if (authData.users.length < 1000) break;
        authPage++;
      }

      // 3-3. 머지 & last_sign_in_at 정렬
      const ascending = sort_order === 'asc';
      const merged = profileList.map((p: any) => {
        const authUser = authMap[p.id];
        let providers: string[] = [];
        if (authUser?.app_metadata?.provider) providers = [authUser.app_metadata.provider];
        else if (authUser?.app_metadata?.providers) providers = authUser.app_metadata.providers;
        else if (authUser?.identities) providers = authUser.identities.map((id: any) => id.provider);

        // 커스텀 OAuth (네이버 등) - user_metadata에서 보완
        if (authUser?.user_metadata?.naver_id && !providers.includes('naver')) {
          providers = providers.filter((p: string) => p !== 'email');
          providers.push('naver');
        } else if (
          authUser?.user_metadata?.provider &&
          authUser.user_metadata.provider !== 'email' &&
          !providers.includes(authUser.user_metadata.provider)
        ) {
          providers = providers.filter((p: string) => p !== 'email');
          providers.push(authUser.user_metadata.provider);
        }

        if (providers.length === 0) providers = ['email'];

        return {
          ...p,
          providers: Array.from(new Set(providers)),
          last_sign_in_at: authUser?.last_sign_in_at ?? null,
        };
      }).sort((a: any, b: any) => {
        const aVal = a.last_sign_in_at;
        const bVal = b.last_sign_in_at;
        if (!aVal && !bVal) return 0;
        if (!aVal) return ascending ? -1 : 1;
        if (!bVal) return ascending ? 1 : -1;
        return ascending
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });

      // 3-4. 페이지 슬라이스
      const pageSlice = merged.slice(start, end + 1);
      const sliceIds = pageSlice.map((p: any) => p.id);

      // 3-5. 게시글/댓글/좋아요 수 배치 조회 (현재 페이지 대상만)
      const [
        { data: postRows },
        { data: commentRows },
        { data: likeRows },
      ] = await Promise.all([
        supabase.from('posts').select('author_id, views, likes').in('author_id', sliceIds),
        supabase.from('comments').select('author_id').in('author_id', sliceIds),
        supabase.from('post_likes').select('user_id').in('user_id', sliceIds),
      ]);

      const postCountMap: Record<string, number> = {};
      const viewSumMap: Record<string, number> = {};
      const likeSumMap: Record<string, number> = {};
      (postRows || []).forEach((r: any) => {
        postCountMap[r.author_id] = (postCountMap[r.author_id] || 0) + 1;
        viewSumMap[r.author_id] = (viewSumMap[r.author_id] || 0) + (r.views || 0);
        likeSumMap[r.author_id] = (likeSumMap[r.author_id] || 0) + (r.likes || 0);
      });
      const commentCountMap: Record<string, number> = {};
      (commentRows || []).forEach((r: any) => {
        commentCountMap[r.author_id] = (commentCountMap[r.author_id] || 0) + 1;
      });
      const likeGivenMap: Record<string, number> = {};
      (likeRows || []).forEach((r: any) => {
        likeGivenMap[r.user_id] = (likeGivenMap[r.user_id] || 0) + 1;
      });

      const usersWithStats = pageSlice.map((p: any) => ({
        ...p,
        post_count: postCountMap[p.id] || 0,
        comment_count: commentCountMap[p.id] || 0,
        total_views: viewSumMap[p.id] || 0,
        total_likes_received: likeSumMap[p.id] || 0,
        total_likes_given: likeGivenMap[p.id] || 0,
      }));

      const totalPages = Math.ceil((count || 0) / limit);
      return NextResponse.json({ users: usersWithStats, count, totalPages });
    }

    // 4. 기본 정렬 (created_at)
    const ascending = sort_order === 'asc';
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending });

    if (search) {
      query = query.ilike('username', `%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }
    if (is_banned !== null && is_banned !== '') {
      query = query.eq('is_banned', is_banned === 'true');
    }

    const { data: profiles, count, error } = await query;
    if (error) throw error;

    // 5. 배치 조회 준비
    const userIds = (profiles || []).map((p: any) => p.id);

    // 6. 게시글/댓글/좋아요 수 + auth 데이터 병렬 배치 조회
    const [
      { data: postRows },
      { data: commentRows },
      { data: likeRows },
      authResults,
    ] = await Promise.all([
      supabase.from('posts').select('author_id, views, likes').in('author_id', userIds),
      supabase.from('comments').select('author_id').in('author_id', userIds),
      supabase.from('post_likes').select('user_id').in('user_id', userIds),
      Promise.all(
        userIds.map((id) =>
          admin.auth.admin.getUserById(id)
            .then(({ data }) => ({ id, user: data?.user ?? null }))
            .catch(() => ({ id, user: null }))
        )
      ),
    ]);

    const postCountMap: Record<string, number> = {};
    const viewSumMap: Record<string, number> = {};
    const likeSumMap: Record<string, number> = {};
    (postRows || []).forEach((r: any) => {
      postCountMap[r.author_id] = (postCountMap[r.author_id] || 0) + 1;
      viewSumMap[r.author_id] = (viewSumMap[r.author_id] || 0) + (r.views || 0);
      likeSumMap[r.author_id] = (likeSumMap[r.author_id] || 0) + (r.likes || 0);
    });
    const commentCountMap: Record<string, number> = {};
    (commentRows || []).forEach((r: any) => {
      commentCountMap[r.author_id] = (commentCountMap[r.author_id] || 0) + 1;
    });
    const likeGivenMap: Record<string, number> = {};
    (likeRows || []).forEach((r: any) => {
      likeGivenMap[r.user_id] = (likeGivenMap[r.user_id] || 0) + 1;
    });
    const authMap: Record<string, any> = {};
    authResults.forEach(({ id, user }) => { if (user) authMap[id] = user; });

    const usersWithProvider = (profiles || []).map((profile: any) => {
      const authUser = authMap[profile.id];

      let providers: string[] = [];
      if (authUser?.app_metadata?.provider) providers = [authUser.app_metadata.provider];
      else if (authUser?.app_metadata?.providers) providers = authUser.app_metadata.providers;
      else if (authUser?.identities) providers = authUser.identities.map((id: any) => id.provider);

      // 커스텀 OAuth (네이버 등) - user_metadata에서 보완
      if (authUser?.user_metadata?.naver_id && !providers.includes('naver')) {
        providers = providers.filter((p: string) => p !== 'email');
        providers.push('naver');
      } else if (
        authUser?.user_metadata?.provider &&
        authUser.user_metadata.provider !== 'email' &&
        !providers.includes(authUser.user_metadata.provider)
      ) {
        providers = providers.filter((p: string) => p !== 'email');
        providers.push(authUser.user_metadata.provider);
      }

      if (providers.length === 0) providers = ['email'];

      return {
        ...profile,
        providers: Array.from(new Set(providers)),
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
        post_count: postCountMap[profile.id] || 0,
        comment_count: commentCountMap[profile.id] || 0,
        total_views: viewSumMap[profile.id] || 0,
        total_likes_received: likeSumMap[profile.id] || 0,
        total_likes_given: likeGivenMap[profile.id] || 0,
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({ users: usersWithProvider, count, totalPages });
  } catch (error: any) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
