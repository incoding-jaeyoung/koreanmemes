import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { translateTitle, SupportedLang } from '@/utils/gemini';

// GET /api/profile - 현재 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    // 한줄 코멘트 번역 조회
    const { data: commentTranslations } = await supabase
      .from('profile_translations')
      .select('lang, comment')
      .eq('profile_id', user.id);

    if (profile && commentTranslations) {
      (profile as any).comment_translations = commentTranslations;
    }

    // 활동 통계 조회
    const [postsResult, commentsResult, likesResult] = await Promise.all([
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id),
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id),
      supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    const stats = {
      posts: postsResult.count || 0,
      comments: commentsResult.count || 0,
      likes_given: likesResult.count || 0,
    };

    // 최근 게시글 조회 (5개)
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, title, category, created_at, likes, views, post_translations(lang, title)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 최근 댓글 조회 (5개)
    const { data: recentComments } = await supabase
      .from('comments')
      .select('id, content, created_at, post_id, posts(id, title)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 가입 시 선택한 preferred_language (user_metadata)가 profile보다 우선
    const userPreferredLang = user.user_metadata?.preferred_language;
    const effectivePrefLang = (userPreferredLang && ['ko','en','ja'].includes(userPreferredLang))
      ? userPreferredLang
      : (profile?.preferred_language || 'ko');

    return NextResponse.json({ 
      profile,
      stats,
      recentPosts: recentPosts || [],
      recentComments: recentComments || [],
      effectivePreferredLanguage: effectivePrefLang,
    });
  } catch (error: any) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - 프로필 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      username,
      main_character_id,
      rank_level,
      psn_id,
      steam_id,
      xbox_gamertag,
      discord_id,
      avatar_url,
      comment,
      preferred_language,
    } = body;

    // 닉네임 검증
    if (username !== undefined) {
      const trimmed = username.trim();
      // 한글 글자 수 계산 (한글=2, 그 외=1)
      const weightedLength = [...trimmed].reduce((acc, ch) => {
        return acc + (/[\u3131-\uD79D]/.test(ch) ? 2 : 1);
      }, 0);
      if (weightedLength < 2 || weightedLength > 16) {
        return NextResponse.json(
          { error: 'USERNAME_LENGTH', message: '닉네임: 영문/숫자 16자, 한글 8자 이내' },
          { status: 400 }
        );
      }
      // 중복 체크
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', user.id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: 'USERNAME_TAKEN', message: '이미 사용 중인 닉네임입니다.' },
          { status: 409 }
        );
      }
    }

    // 업데이트할 필드만 포함
    const updates: any = {};
    if (username !== undefined) updates.username = username.trim();
    if (main_character_id !== undefined) updates.main_character_id = main_character_id;
    if (rank_level !== undefined) {
      const level = rank_level === null || rank_level === '' ? null : Number(rank_level);
      updates.rank_level = level !== null && Number.isInteger(level) && level >= 1 && level <= 46 ? level : null;
    }
    if (psn_id !== undefined) updates.psn_id = psn_id;
    if (steam_id !== undefined) updates.steam_id = steam_id;
    if (xbox_gamertag !== undefined) updates.xbox_gamertag = xbox_gamertag;
    if (discord_id !== undefined) updates.discord_id = discord_id;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (comment !== undefined) updates.comment = comment;
    if (preferred_language !== undefined) updates.preferred_language = preferred_language;

    let { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    // rank_level 컬럼이 없을 때(마이그레이션 미적용): rank_level 제외하고 재시도
    if (error && updates.rank_level !== undefined) {
      const msg = (error.message || '').toLowerCase();
      const code = error.code || '';
      if (msg.includes('rank_level') || msg.includes('does not exist') || code === '42703') {
        const { rank_level: _rl, ...updatesWithoutRank } = updates;
        const retry = await supabase
          .from('profiles')
          .update(updatesWithoutRank)
          .eq('id', user.id)
          .select()
          .single();
        if (retry.error) throw retry.error;
        data = retry.data;
        error = null;
      } else {
        throw error;
      }
    } else if (error) {
      throw error;
    }

    // comment 변경 시 자동 번역 후 profile_translations에 저장
    if (comment !== undefined && comment.trim()) {
      const adminClient = createAdminClient();
      const trimmedComment = comment.trim();

      // 원본 언어 감지 (간단한 휴리스틱)
      const detectLang = (text: string): SupportedLang => {
        const koreanChars = text.match(/[\uAC00-\uD7A3]/g);
        if (koreanChars && koreanChars.length / text.length > 0.3) return 'ko';
        const japaneseChars = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g);
        if (japaneseChars && japaneseChars.length / text.length > 0.3) return 'ja';
        return 'en';
      };

      const sourceLang = detectLang(trimmedComment);
      const targetLangs: SupportedLang[] = ['ko', 'en', 'ja'].filter(l => l !== sourceLang) as SupportedLang[];

      try {
        // 다른 언어로 번역
        const translations = await translateTitle(trimmedComment, targetLangs);

        // profile_translations에 저장 (원본 포함)
        const rows = [
          { profile_id: user.id, lang: sourceLang, comment: trimmedComment },
          ...targetLangs.map(lang => ({
            profile_id: user.id,
            lang,
            comment: translations[lang] || trimmedComment
          }))
        ];

        await adminClient
          .from('profile_translations')
          .upsert(rows, { onConflict: 'profile_id,lang' });
      } catch (translateError) {
        console.error('Profile comment translation failed:', translateError);
        // 번역 실패해도 원본은 저장됨
      }
    }

    // 닉네임 변경 시 posts, comments의 author_name 동기화
    if (username !== undefined) {
      const newName = username.trim();
      await Promise.all([
        supabase.from('posts').update({ author_name: newName }).eq('author_id', user.id),
        supabase.from('comments').update({ author_name: newName }).eq('author_id', user.id),
      ]);
    }

    // preferred_language 변경 시 user_metadata도 동기화 (GET 시 user_metadata 우선 사용)
    if (preferred_language !== undefined && ['ko', 'en', 'ja'].includes(preferred_language)) {
      await supabase.auth.updateUser({ data: { preferred_language } });
    }

    return NextResponse.json({ profile: data });
  } catch (error: any) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
