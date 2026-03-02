"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/utils/supabase/client';
import { INPUT_BRAND_STYLE, INPUT_AUTH_CLASS } from '@/constants/inputStyles';
import TermsContent from '@/components/legal/TermsContent';
import PrivacyContent from '@/components/legal/PrivacyContent';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LangIco from '@/components/common/LangIco';
import { Suspense } from 'react';

const LANG_LABELS: Record<'ko' | 'en' | 'ja', string> = { ko: '한국어', en: 'English', ja: '日本語' };

function ResendVerificationEmail({
  t,
  locale,
  signUpEmailPlaceholder,
  translateError,
}: {
  t: Record<string, string>;
  locale: string;
  signUpEmailPlaceholder: string;
  translateError: (error: string) => string;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const input = document.querySelector('.glass-card input[type="email"]') as HTMLInputElement;
    if (input?.value) setEmail(input.value);
  }, []);

  const handleResend = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      alert(locale === 'ko' ? '이메일 주소를 입력해 주세요.' : locale === 'ja' ? '메ールアドレス를入力してください。' : 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (res.ok) alert(t.resendSuccess);
      else alert(translateError(data.error || '') || t.resendError);
    } catch {
      alert(t.resendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 mt-4 space-y-2 rounded-lg border border-white/10 bg-white/5">
      <p className="text-xs font-semibold text-neutral-300">
        {locale === 'ko' ? '이메일을 받지 못하셨나요?' : locale === 'ja' ? 'メールが届いていませんか？' : "Didn't receive the email?"}
      </p>
      <div className="flex gap-2 items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={signUpEmailPlaceholder}
          className={`w-full h-8 px-2.5 text-xs text-white rounded border outline-none bg-white/5 border-white/10 placeholder-neutral-500 focus:border-brand-yellow ${INPUT_AUTH_CLASS}`}
        />
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="h-8 px-2.5 text-xs font-bold text-black rounded bg-brand-yellow hover:opacity-90 shrink-0 disabled:opacity-60"
        >
          {loading ? (locale === 'ko' ? '전송 중...' : locale === 'ja' ? '送信中...' : 'Sending...') : t.resendButton}
        </button>
      </div>
    </div>
  );
}

function LoginContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const { locale, setLocale } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up' | 'forgotten_password'>('sign_in');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showResendUI, setShowResendUI] = useState(false);
  const [signupLanguage, setSignupLanguage] = useState(locale);
  const additionalDataRef = useRef({ preferred_language: locale });
  additionalDataRef.current.preferred_language = signupLanguage;

  // 커스텀 회원가입 폼용 state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // 다국어 텍스트
  const translations = {
    ko: {
      title: 'JOIN THE',
      titleHighlight: 'COMMUNITY',
      subtitle: '버추어 파이터 커뮤니티에 참여하세요.',
      signInTab: '로그인',
      signUpTab: '회원가입',
      forgotPassword: '비밀번호를 잊으셨나요?',
      backToLogin: '로그인으로 돌아가기',
      signInEmail: '이메일 주소',
      signInPassword: '비밀번호',
      signInButton: '로그인',
      signUpEmail: '이메일 주소',
      signUpPassword: '비밀번호',
      signUpButton: '회원가입',
      termsNotice: '회원가입 시',
      terms: '이용약관',
      and: '및',
      privacy: '개인정보처리방침',
      autoAgree: '에 자동 동의됩니다',
      confirm: '확인',
      strengthWeak: '취약',
      strengthNormal: '보통',
      strengthStrong: '강력',
      strengthLabel: '비밀번호 강도',
      passwordPolicy: '최소 6자 이상 (숫자, 특수문자 포함 권장)',
      selectLanguage: '선호 언어 선택',
      languageGuide: '선택한 언어가 사이트의 기본 언어로 설정됩니다.',
      languageChangeNotice: '언어 설정은 마이페이지에서 언제든지 변경 가능합니다.',
      socialLoginGoogle: 'Google로 로그인',
      socialLoginDiscord: 'Discord로 로그인',
      socialLoginNaver: '네이버로 로그인',
      socialLoginKakao: '카카오로 로그인',
      resendButton: '이메일 재전송',
      resendSuccess: '인증 이메일을 다시 발송했습니다. 메일함을 확인해 주세요.',
      resendError: '재발송에 실패했습니다.',
    },
    en: {
      title: 'JOIN THE',
      titleHighlight: 'COMMUNITY',
      subtitle: 'Join the Virtua Fighter Community.',
      signInTab: 'Sign In',
      signUpTab: 'Sign Up',
      forgotPassword: 'Forgot your password?',
      backToLogin: 'Back to login',
      signInEmail: 'Email Address',
      signInPassword: 'Password',
      signInButton: 'Sign In',
      signUpEmail: 'Email Address',
      signUpPassword: 'Password',
      signUpButton: 'Sign Up',
      termsNotice: 'By signing up, you agree to our',
      terms: 'Terms of Service',
      and: 'and',
      privacy: 'Privacy Policy',
      autoAgree: '',
      confirm: 'Confirm',
      strengthWeak: 'Weak',
      strengthNormal: 'Normal',
      strengthStrong: 'Strong',
      strengthLabel: 'Password Strength',
      passwordPolicy: 'Min 6 chars (numbers & symbols recommended)',
      selectLanguage: 'Select Preferred Language',
      languageGuide: 'The selected language will be set as your default.',
      languageChangeNotice: 'You can change this anytime in your profile page.',
      socialLoginGoogle: 'Sign in with Google',
      socialLoginDiscord: 'Sign in with Discord',
      socialLoginNaver: 'Sign in with Naver',
      socialLoginKakao: 'Sign in with Kakao',
      resendButton: 'Resend email',
      resendSuccess: 'Verification email sent. Please check your inbox.',
      resendError: 'Failed to resend.',
    },
    ja: {
      title: 'JOIN THE',
      titleHighlight: 'COMMUNITY',
      subtitle: 'バーチャファイターコミュニティに参加しましょう。',
      signInTab: 'ログイン',
      signUpTab: '新規登録',
      forgotPassword: 'パスワードをお忘れですか？',
      backToLogin: 'ログインに戻る',
      signInEmail: 'メールアドレス',
      signInPassword: 'パスワード',
      signInButton: 'ログイン',
      signUpEmail: 'メールアドレス',
      signUpPassword: 'パスワード',
      signUpButton: '新規登録',
      termsNotice: '登録すると',
      terms: '利用規約',
      and: 'と',
      privacy: 'プライバシーポリシー',
      autoAgree: 'に自動的に同意します',
      confirm: '確認',
      strengthWeak: '弱い',
      strengthNormal: '普通',
      strengthStrong: '強い',
      strengthLabel: 'パスワード強度',
      passwordPolicy: '6文字以上 (数字、記号の使用を推奨)',
      selectLanguage: '優先言語を選択',
      languageGuide: '選択した言語がサイトの既定の言語として設定されます。',
      languageChangeNotice: '言語設定はマイページでいつでも変更可能です。',
      socialLoginGoogle: 'Googleでログイン',
      socialLoginDiscord: 'Discordでログイン',
      socialLoginNaver: 'Naverでログイン',
      socialLoginKakao: 'Kakaoでログイン',
      resendButton: '認証メールを再送信',
      resendSuccess: '認証メールを再送信しました。メールをご確認ください。',
      resendError: '再送信に失敗しました。',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.ko;

  // 비밀번호 강도 계산 로직을 순수 함수로 정의
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  // 에러 메시지 번역 ({} 등 비어있거나 불명확한 에러는 공통 메시지로 치환)
  const translateError = (error: string): string => {
    const fallbackMessages: Record<string, string> = {
      ko: '가입 중 오류가 발생했습니다. 다시 시도해 주세요.',
      en: 'An error occurred during signup. Please try again.',
      ja: '登録中にエラーが発生しました。もう一度お試しください。',
    };
    const trimmed = (error || '').trim();
    if (!trimmed || trimmed === '{}' || trimmed === '[]') {
      return fallbackMessages[locale as keyof typeof fallbackMessages] || fallbackMessages.en;
    }

    // Rate limiting / 재발송 제한 (메시지에 "For security purposes" + "seconds" 포함 시, 숫자 추출 가능하면 사용)
    if (trimmed.includes('For security purposes') && trimmed.includes('seconds')) {
      const match = trimmed.match(/(\d+)\s*seconds?/i);
      const seconds = match ? match[1] : '40';
      const ko = `보안을 위해 ${seconds}초 후에 다시 요청할 수 있습니다.`;
      const ja = `セキュリティのため、${seconds}秒後に再度リクエストできます。`;
      const en = trimmed;
      return locale === 'ko' ? ko : locale === 'ja' ? ja : en;
    }

    const errorTranslations: Record<string, Record<string, string>> = {
      ko: {
        'Anonymous sign-ins are disabled': '이메일 주소와 비밀번호를 입력해주세요',
        'missing email or phone': '이메일 주소를 입력해주세요',
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
        'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 메일함에서 인증 링크를 클릭해주세요.',
        'User already registered': '이미 가입된 계정입니다. 이메일 인증을 완료하지 않으셨나요? 아래에서 인증 메일을 다시 받으실 수 있습니다.',
        'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다',
        'Unable to validate email address: invalid format': '이메일 형식이 올바르지 않습니다',
        'Signup requires a valid password': '유효한 비밀번호를 입력해주세요',
        'Email link is invalid or has expired': '이메일 링크가 유효하지 않거나 만료되었습니다',
        'Token has expired or is invalid': '토큰이 만료되었거나 유효하지 않습니다',
        'For security purposes, you can only request this after 40 seconds.': '보안을 위해 40초 후에 다시 요청할 수 있습니다.',
      },
      ja: {
        'Anonymous sign-ins are disabled': 'メールアドレスとパスワードを入力してください',
        'missing email or phone': 'メールアドレスを入力してください',
        'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
        'Email not confirmed': 'メール認証が完了していません。受信トレイで認証リンクをクリックしてください。',
        'User already registered': 'すでに登録されているアカウントです。メール認証がお済みでない場合は、下記から認証メールを再送信できます。',
        'Password should be at least 6 characters': 'パスワードは6文字以上である必要があります',
        'Unable to validate email address: invalid format': 'メールアドレスの形式が正しくありません',
        'Signup requires a valid password': '有効なパスワードを入力してください',
        'Email link is invalid or has expired': 'メールリンクが無効または期限切れです',
        'Token has expired or is invalid': 'トークンが期限切れまたは無効です',
        'For security purposes, you can only request this after 40 seconds.': 'セキュリティのため、40秒後に再度リクエストできます。',
      },
    };

    if (locale === 'en') {
      const enTranslations: Record<string, string> = {
        'Email not confirmed': 'Email not verified. Please check your inbox and click the verification link.',
        'User already registered': 'This account already exists. Haven\'t verified your email? You can resend the verification email below.',
        'For security purposes, you can only request this after 40 seconds.': 'For security purposes, you can only request this after 40 seconds.',
      };
      return enTranslations[error] || error;
    }
    const translations = errorTranslations[locale as keyof typeof errorTranslations];
    return translations?.[error] || error;
  };

  useEffect(() => {
    setMounted(true);
    
    // 페이지 진입 시 현재 로케일을 회원가입용 로케일로 초기 설정
    setSignupLanguage(locale as any);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // 로그인 시 세션의 metadata나 프로필 정보를 확인하여 언어 즉시 동기화
        const userLang = session.user?.user_metadata?.preferred_language;
        if (userLang) {
          setLocale(userLang);
        }
        router.push(next);
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, locale, setLocale]);

  // 자동 재전송 UI 표시 로직 제거 (중복 메시지 방지)

  const handleSocialLogin = async (provider: 'google' | 'discord' | 'kakao') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message || '소셜 로그인 중 오류가 발생했습니다.');
    }
  };

  const handleNaverLogin = () => {
    window.location.href = `/api/auth/naver?next=${encodeURIComponent(next)}`
  }

  // 커스텀 회원가입 처리
  const handleCustomSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(false);

    if (!signupEmail || !signupPassword) {
      setSignupError(locale === 'ko' ? '이메일과 비밀번호를 입력해주세요' : locale === 'ja' ? 'メールアドレスとパスワードを入力してください' : 'Please enter email and password');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError(locale === 'ko' ? '비밀번호는 최소 6자 이상이어야 합니다' : locale === 'ja' ? 'パスワードは6文字以上である必要があります' : 'Password must be at least 6 characters');
      return;
    }

    setSignupLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          preferred_language: signupLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 이미 가입된 이메일 에러 처리
        if (data.alreadyExists || data.error?.includes('User already registered') || data.error?.includes('already registered')) {
          setSignupError(
            locale === 'ko'
              ? '이미 가입된 이메일입니다. 로그인하거나 비밀번호 찾기를 이용해주세요.'
              : locale === 'ja'
                ? 'すでに登録されているメールアドレスです。ログインするか、パスワード再設定をご利用ください。'
                : 'This email is already registered. Please sign in or reset your password.'
          );
        } else {
          setSignupError(translateError(data.error || 'Signup failed'));
        }
        setSignupLoading(false);
        return;
      }

      // 성공
      setSignupSuccess(true);
      setSignupLoading(false);
    } catch (err: any) {
      setSignupError(translateError(err.message || 'Unknown error'));
      setSignupLoading(false);
    }
  };

  // 에러 메시지 감지, 비밀번호 정책 및 강도 표시 주입
  useEffect(() => {
    if (!mounted) return;

    const handleDomChanges = () => {
      if (authView !== 'sign_up') setShowResendUI(false);

      // 1. 에러 메시지만 번역 (Supabase Auth UI의 모든 메시지 타입 대응)
      const allMessages = document.querySelectorAll(
        '.glass-card [role="alert"], .glass-card .supabase-auth-ui_ui-message'
      );

      allMessages.forEach((element) => {
        const htmlEl = element as HTMLElement;
        // 성공 메시지는 번역하지 않음 (초록색 배경이나 success 클래스)
        const isSuccess = htmlEl.className?.includes('success') ||
                         htmlEl.style.backgroundColor?.includes('green') ||
                         htmlEl.textContent?.includes('Check your email');

        if (isSuccess) return; // 성공 메시지는 건너뛰기

        if (htmlEl.textContent) {
          const originalText = htmlEl.textContent.trim();
          const translatedText = translateError(originalText);

          if (translatedText !== originalText && htmlEl.textContent !== translatedText) {
            htmlEl.textContent = translatedText;
          }
        }
      });
        // 1.5 라벨 스타일 강화 (더 밝고 두껍게)
        const labels = document.querySelectorAll('label, .supabase-auth-ui_ui-label');
        labels.forEach((label) => {
          label.classList.add('text-neutral-200', 'font-semibold');
          (label as HTMLElement).style.fontWeight = '600';
          (label as HTMLElement).style.color = '#e5e5e5'; // neutral-200
        });

      // 2. 비밀번호 정책 및 강도 표시 주입 (회원가입 탭에서만, Supabase Auth UI에만 적용)
      // 커스텀 회원가입 폼을 사용할 때는 이 로직을 건너뜀 (커스텀 폼에는 이미 버튼이 있음)
      if (authView === 'sign_up' && !signupEmail) {
        // Supabase Auth UI의 비밀번호 필드만 찾기
        const passwordInput = document.querySelector('.supabase-auth-ui input[type="password"], .supabase-auth-ui_ui-input[type="password"]') as HTMLInputElement;
        const allButtons = document.querySelectorAll('button[type="submit"], .supabase-auth-ui_ui-button');
        const submitButton = Array.from(allButtons).find(b => 
          b.classList.contains('supabase-auth-ui_ui-button') && 
          (b.textContent?.trim() === t.signUpButton || b.textContent?.trim() === t.signInButton)
        ) as HTMLButtonElement;

        // 비밀번호 정책 주입
        if (passwordInput && !document.getElementById('password-policy-msg')) {
          const policyMsg = document.createElement('p');
          policyMsg.id = 'password-policy-msg';
          policyMsg.className = 'mt-2 ml-1 text-xs font-bold text-neutral-300';
          policyMsg.textContent = t.passwordPolicy;
          passwordInput.parentNode?.insertBefore(policyMsg, passwordInput.nextSibling);
        }

        // 강도 표시 바 주입 (버튼 바로 위)
        if (submitButton && !document.getElementById('password-strength-container')) {
          const container = document.createElement('div');
          container.id = 'password-strength-container';
          container.className = 'space-y-1.5 mb-4 animate-in fade-in slide-in-from-top-1 duration-300';
          container.innerHTML = `
            <div class="flex justify-between items-center text-xs">
              <span class="font-semibold text-neutral-300">${t.strengthLabel}</span>
              <span id="strength-text" class="font-bold text-neutral-400">-</span>
            </div>
            <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div id="strength-bar" class="w-0 h-full transition-all duration-500 bg-white/10"></div>
            </div>
          `;
          submitButton.parentNode?.insertBefore(container, submitButton);
        }

        // 비밀번호 보기 토글 (눈 아이콘) 주입
        if (passwordInput && !document.getElementById('password-toggle-btn')) {
          const container = passwordInput.parentElement;
          if (container) {
            container.style.position = 'relative';
              const toggleBtn = document.createElement('button');
              toggleBtn.id = 'password-toggle-btn';
              toggleBtn.type = 'button';
              toggleBtn.className = 'flex hidden absolute z-10 justify-center items-center w-8 h-8 transition-colors text-neutral-300 hover:text-white';
              toggleBtn.style.right = '6px'; // 기존 16px(right-4)에서 우측으로 10px 이동
              toggleBtn.style.top = 'calc(50% + 2px)'; // 중앙(+5px)에서 3px 위로 이동
              toggleBtn.style.transform = 'translateY(-50%)';
              toggleBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              `;
              toggleBtn.onclick = () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                toggleBtn.innerHTML = isPassword 
                  ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-off-icon"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
              };
              container.appendChild(toggleBtn);
              passwordInput.style.paddingRight = '45px';
            }
          }

        // 비밀번호 입력 이벤트 리스너 추가
        if (passwordInput && !passwordInput.dataset.listenerAdded) {
          passwordInput.addEventListener('input', (e) => {
            const val = (e.target as HTMLInputElement).value;
            const container = document.getElementById('password-strength-container');
            const textEl = document.getElementById('strength-text');
            const barEl = document.getElementById('strength-bar');
            const toggleBtn = document.getElementById('password-toggle-btn');

            if (toggleBtn) {
              if (val.length > 0) {
                toggleBtn.classList.remove('hidden');
              } else {
                toggleBtn.classList.add('hidden');
                // 초기화 시 타입도비밀번호로 복구 (필드 비었을 때)
                passwordInput.type = 'password';
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
              }
            }

            if (!container || !textEl || !barEl) return;

            if (val.length === 0) {
              container.classList.add('hidden');
              return;
            }

            container.classList.remove('hidden');
            const s = calculateStrength(val);

            // UI 업데이트
            if (s <= 1) {
              textEl.textContent = t.strengthWeak;
              textEl.className = 'font-bold text-red-500';
              barEl.className = 'w-1/3 h-full bg-red-500 transition-all duration-500';
              barEl.style.width = '33.33%';
            } else if (s === 2) {
              textEl.textContent = t.strengthNormal;
              textEl.className = 'font-bold text-yellow-500';
              barEl.className = 'w-2/3 h-full bg-yellow-500 transition-all duration-500';
              barEl.style.width = '66.66%';
            } else {
              textEl.textContent = t.strengthStrong;
              textEl.className = 'font-bold text-brand-yellow';
              barEl.className = 'w-full h-full transition-all duration-500 bg-brand-yellow';
              barEl.style.width = '100%';
            }
          });
          passwordInput.dataset.listenerAdded = 'true';
        }
      }
    };

    handleDomChanges();
    const observer = new MutationObserver(handleDomChanges);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [mounted, locale, authView, t]);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8 md:px-6">
      <div className="flex overflow-hidden flex-col w-full max-w-4xl glass-card lg:flex-row">
        {/* 왼쪽: 브랜딩 + 소셜 로그인 */}
        <div className="flex flex-col justify-center p-6 text-center border-b md:p-8 lg:w-1/2 lg:p-12 lg:border-b-0 lg:border-r border-white/10">
          <h2 className="text-2xl font-black tracking-tighter lg:text-3xl">
            {t.title} <span className="text-brand-yellow">{t.titleHighlight}</span>
          </h2>
          <p className="mt-3 font-semibold text-center text-neutral-200">{t.subtitle}</p>
          <div className="flex flex-col gap-2 mt-6">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSocialLogin('google');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#3e3e3e] bg-[#2e2e2e] hover:bg-[#3e3e3e] transition-colors font-bold text-sm text-white"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t.socialLoginGoogle}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSocialLogin('discord');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#3e3e3e] bg-[#2e2e2e] hover:bg-[#3e3e3e] transition-colors font-bold text-sm text-white"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path fill="#5865F2" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              {t.socialLoginDiscord}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNaverLogin();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#3e3e3e] bg-[#2e2e2e] hover:bg-[#3e3e3e] transition-colors font-bold text-sm text-white"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#03C75A"/>
                <path d="M13.67 12.31L10.18 7H7.5v10h3.33v-5.31L14.32 17H17V7h-3.33v5.31z" fill="white"/>
              </svg>
              {t.socialLoginNaver}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSocialLogin('kakao');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#3e3e3e] bg-[#2e2e2e] hover:bg-[#3e3e3e] transition-colors font-bold text-sm text-white"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="3" fill="#FEE500"/>
                <path d="M12 6C8.686 6 6 8.06 6 10.6c0 1.572.98 2.957 2.47 3.79l-.63 2.33a.2.2 0 0 0 .3.22l2.72-1.8c.36.05.73.08 1.14.08 3.314 0 6-2.06 6-4.6S15.314 6 12 6z" fill="#3C1E1E"/>
              </svg>
              {t.socialLoginKakao}
            </a>
          </div>
        </div>

        {/* 오른쪽: 인증 폼 */}
        <div className="p-6 space-y-6 md:p-8 lg:w-1/2 lg:p-10">
        {/* 탭 UI - 비밀번호 찾기 모드가 아닐 때만 표시 */}
        {authView !== 'forgotten_password' && (
          <div className="flex gap-2 p-1 rounded-lg bg-white/5">
            <button
              onClick={() => setAuthView('sign_in')}
              className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-all ${
                authView === 'sign_in'
                  ? 'bg-brand-yellow text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.signInTab}
            </button>
            <button
              onClick={() => setAuthView('sign_up')}
              className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-all ${
                authView === 'sign_up'
                  ? 'bg-brand-yellow text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.signUpTab}
            </button>
          </div>
        )}

        {/* 커스텀 회원가입 폼 */}
        {authView === 'sign_up' ? (
          <div className="space-y-4">
            {/* 언어 선택 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold tracking-wider uppercase text-neutral-500">
                {t.selectLanguage}
              </label>
              <div className="flex gap-2">
                {(['ko', 'en', 'ja'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSignupLanguage(lang);
                      setLocale(lang);
                    }}
                    className={`flex flex-1 gap-2 justify-center items-center px-3 py-1 rounded-lg border transition-all ${
                      signupLanguage === lang
                        ? 'bg-brand-yellow/20 border-brand-yellow text-brand-yellow'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <LangIco langOrCountry={lang} size={20} />
                    <span className="text-xs font-bold">{LANG_LABELS[lang]}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold leading-tight text-neutral-300">• {t.languageGuide}</p>
                <p className="text-xs font-semibold leading-tight text-neutral-300">• {t.languageChangeNotice}</p>
              </div>
            </div>

            {/* 회원가입 폼 */}
            <form onSubmit={handleCustomSignup} className="space-y-4">
              {/* 이메일 입력 - 로그인 폼과 동일 스타일 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-200">{t.signUpEmail}</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder={locale === 'ko' ? '이메일 주소를 입력하세요' : locale === 'ja' ? 'メールアドレスを入力' : 'Enter your email'}
                  style={INPUT_BRAND_STYLE}
                  className={`w-full rounded-sm border border-[#3e3e3e] bg-[#1e1e1e] px-4 py-3 text-sm outline-none placeholder:text-white/50 focus:border-brand-yellow/50 ${INPUT_AUTH_CLASS}`}
                  disabled={signupLoading || signupSuccess}
                  required
                />
              </div>

              {/* 비밀번호 입력 - 로그인 폼과 동일 스타일 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-200">{t.signUpPassword}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setPasswordStrength(calculateStrength(e.target.value));
                    }}
                    placeholder={locale === 'ko' ? '비밀번호를 입력하세요' : locale === 'ja' ? 'パスワードを入力' : 'Enter your password'}
                    style={{ ...INPUT_BRAND_STYLE, paddingRight: signupPassword ? '2.5rem' : undefined }}
                    className={`px-4 w-full py-3 text-sm rounded-sm border outline-none border-[#3e3e3e] bg-[#1e1e1e] placeholder:text-white/50 focus:border-brand-yellow/50 ${INPUT_AUTH_CLASS}`}
                    disabled={signupLoading || signupSuccess}
                    required
                  />
                  {signupPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex absolute top-0 right-0 bottom-0 justify-center items-center pr-3 transition-colors text-neutral-400 hover:text-white"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 비밀번호 강도 표시 */}
              {signupPassword && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-300">{t.strengthLabel}</span>
                    <span className={`font-bold ${
                      passwordStrength <= 1 ? 'text-red-500' :
                      passwordStrength === 2 ? 'text-yellow-500' :
                      'text-brand-yellow'
                    }`}>
                      {passwordStrength <= 1 ? t.strengthWeak :
                       passwordStrength === 2 ? t.strengthNormal :
                       t.strengthStrong}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        passwordStrength <= 1 ? 'w-1/3 bg-red-500' :
                        passwordStrength === 2 ? 'w-2/3 bg-yellow-500' :
                        'w-full bg-brand-yellow'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs font-bold text-neutral-300">{t.passwordPolicy}</p>
                </div>
              )}

              {/* 에러 메시지 */}
              {signupError && (
                <div className="p-3 rounded-lg border bg-red-500/10 border-red-500/20">
                  <p className="text-sm font-semibold text-red-400">{signupError}</p>
                </div>
              )}

              {/* 성공 메시지 */}
              {signupSuccess && (
                <div className="p-3 rounded-lg border bg-brand-yellow/15 border-brand-yellow/40">
                  <p className="text-sm font-semibold text-brand-yellow">
                    {locale === 'ko' && '인증 링크를 이메일로 보냈습니다. 메일함(스팸함 포함)을 확인한 뒤 링크를 클릭하면 가입이 완료됩니다.'}
                    {locale === 'en' && 'Verification link sent to your email. Check your inbox (including spam) and click the link to complete registration.'}
                    {locale === 'ja' && '認証リンクをメールで送信しました。受信トレイ（迷惑メール含む）をご確認の上、リンクをクリックして登録を完了してください。'}
                  </p>
                </div>
              )}

              {/* 회원가입 버튼 - 로그인 버튼과 동일 스타일 (brand #444444, accent #555555) */}
              <button
                type="submit"
                disabled={signupLoading || signupSuccess}
                className="px-4 py-3 w-full text-sm font-bold text-white rounded-sm border-0 transition-transform cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
                style={{
                  backgroundColor: signupLoading || signupSuccess ? '#555555' : '#444444',
                }}
              >
                {signupLoading
                  ? (locale === 'ko' ? '회원가입 중...' : locale === 'ja' ? '登録中...' : 'Signing up...')
                  : t.signUpButton
                }
              </button>
            </form>
          </div>
        ) : (
          <Auth
          additionalData={additionalDataRef.current}
          supabaseClient={supabase}
          view={authView}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#444444',
                  brandAccent: '#555555',
                  brandButtonText: 'white',
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  inputText: '#E2E800',
                  inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                },
              },
            },
            style: { input: INPUT_BRAND_STYLE },
            className: {
              button: 'font-bold transition-transform active:scale-95',
              input: INPUT_AUTH_CLASS,
            },
          }}
          localization={{
            variables: locale === 'ko' ? {
              sign_in: {
                email_label: '이메일 주소',
                password_label: '비밀번호',
                email_input_placeholder: '이메일 주소를 입력하세요',
                password_input_placeholder: '비밀번호를 입력하세요',
                button_label: '로그인',
                loading_button_label: '로그인 중...',
                social_provider_text: '{{provider}}로 로그인',
                link_text: '계정이 없으신가요? 회원가입',
              },
              sign_up: {
                email_label: '이메일 주소',
                password_label: '비밀번호',
                email_input_placeholder: '이메일 주소를 입력하세요',
                password_input_placeholder: '비밀번호를 입력하세요',
                button_label: '회원가입',
                loading_button_label: '회원가입 중...',
                social_provider_text: '{{provider}}로 가입',
                link_text: '이미 계정이 있으신가요? 로그인',
                confirmation_text: '인증 링크를 이메일로 보냈습니다. 메일함(스팸함 포함)을 확인한 뒤 링크를 클릭하면 가입이 완료됩니다.',
              },
              forgotten_password: {
                email_label: '이메일 주소',
                password_label: '비밀번호',
                email_input_placeholder: '이메일 주소를 입력하세요',
                button_label: '비밀번호 재설정',
                loading_button_label: '이메일 전송 중...',
                link_text: '비밀번호를 잊으셨나요?',
                confirmation_text: '비밀번호 재설정 링크를 이메일로 보냈습니다',
              },
            } : locale === 'en' ? {
              sign_in: {
                email_label: 'Email Address',
                password_label: 'Password',
                email_input_placeholder: 'Enter your email',
                password_input_placeholder: 'Enter your password',
                button_label: 'Sign In',
                loading_button_label: 'Signing in...',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: "Don't have an account? Sign up",
              },
              sign_up: {
                email_label: 'Email Address',
                password_label: 'Password',
                email_input_placeholder: 'Enter your email',
                password_input_placeholder: 'Enter your password',
                button_label: 'Sign Up',
                loading_button_label: 'Signing up...',
                confirmation_text: 'Verification link sent to your email. Check your inbox (including spam) and click the link to complete registration.',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: 'Already have an account? Sign in',
              },
              forgotten_password: {
                email_label: 'Email Address',
                password_label: 'Password',
                email_input_placeholder: 'Enter your email',
                button_label: 'Reset Password',
                loading_button_label: 'Sending email...',
                link_text: 'Forgot your password?',
                confirmation_text: 'Password reset link sent to your email',
              },
            } : {
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                email_input_placeholder: 'メールアドレスを入力',
                password_input_placeholder: 'パスワードを入力',
                button_label: 'ログイン',
                loading_button_label: 'ログイン中...',
                social_provider_text: '{{provider}}でログイン',
                link_text: 'アカウントをお持ちでないですか？新規登録',
              },
              sign_up: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                email_input_placeholder: 'メールアドレスを入力',
                password_input_placeholder: 'パスワードを入力',
                button_label: '新規登録',
                loading_button_label: '登録中...',
                confirmation_text: '認証リンクをメールで送信しました。受信トレイ（迷惑メール含む）をご確認の上、リンクをクリックして登録を完了してください。',
                social_provider_text: '{{provider}}で登録',
                link_text: 'すでにアカウントをお持ちですか？ログイン',
              },
              forgotten_password: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                email_input_placeholder: 'メールアドレスを入力',
                button_label: 'パスワードリセット',
                loading_button_label: 'メール送信中...',
                link_text: 'パスワードをお忘れですか？',
                confirmation_text: 'パスワードリセットリンクをメールで送信しました',
              },
            },
          }}
          theme="dark"
          showLinks={false}
          providers={[]}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(authView === 'forgotten_password' ? '/auth/reset-password' : next)}${authView === 'forgotten_password' ? '&type=recovery' : ''}`}
        />
        )}

        {/* 회원가입 안내 + 재발송 */}
        {authView === 'sign_up' && (
          <div className="mt-6 space-y-4">
            {/* 이메일 재발송 */}
            <ResendVerificationEmail
              t={t}
              locale={locale}
              signUpEmailPlaceholder={t.signUpEmail}
              translateError={translateError}
            />
          </div>
        )}

        {/* 비밀번호 찾기 버튼 - 로그인 탭에서만 표시 */}
        {authView === 'sign_in' && (
          <div className="text-center">
            <button
              onClick={() => setAuthView('forgotten_password')}
              className="text-sm transition-colors text-brand-yellow hover:text-brand-yellow/80"
            >
              {t.forgotPassword}
            </button>
          </div>
        )}

        {/* 이용약관 및 개인정보처리방침 안내 - 회원가입 시에만 표시 */}
        {authView === 'sign_up' && (
          <div className="px-4 text-center">
            <p className="text-xs font-semibold leading-relaxed text-neutral-300">
              {t.termsNotice}{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="font-bold underline text-brand-yellow hover:text-brand-yellow/80"
              >
                {t.terms}
              </button>
              {locale === 'ko' || locale === 'ja' ? '' : ' '}{t.and}{' '}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="font-bold underline text-brand-yellow hover:text-brand-yellow/80"
              >
                {t.privacy}
              </button>
              {t.autoAgree}
            </p>
          </div>
        )}

        {/* 뒤로 가기 버튼 - 비밀번호 찾기 모드에서만 표시 */}
        {authView === 'forgotten_password' && (
          <div className="text-center">
            <button
              onClick={() => setAuthView('sign_in')}
              className="text-sm transition-colors text-neutral-400 hover:text-white"
            >
              ← {t.backToLogin}
            </button>
          </div>
        )}
        </div>
      </div>

      {/* 이용약관 모달 */}
      {showTerms && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/80">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h3 className="text-xl font-bold">
                {locale === 'ko' && <>이용<span className="text-brand-yellow">약관</span></>}
                {locale === 'en' && <><span className="text-brand-yellow">Terms</span> of Service</>}
                {locale === 'ja' && <><span className="text-brand-yellow">利用</span>規約</>}
              </h3>
              <button onClick={() => setShowTerms(false)} className="transition-colors text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 max-h-[50vh]">
              <TermsContent />
            </div>
            <div className="flex justify-end p-6 border-t border-white/5">
              <button
                onClick={() => setShowTerms(false)}
                className="px-6 py-2 font-bold text-black rounded-lg transition-transform bg-brand-yellow hover:scale-105"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/80">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h3 className="text-xl font-bold">
                {locale === 'ko' && <>개인정보<span className="text-brand-yellow">처리방침</span></>}
                {locale === 'en' && <><span className="text-brand-yellow">Privacy</span> Policy</>}
                {locale === 'ja' && <><span className="text-brand-yellow">プライバシー</span>ポリシー</>}
              </h3>
              <button onClick={() => setShowPrivacy(false)} className="transition-colors text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 max-h-[50vh]">
              <PrivacyContent />
            </div>
            <div className="flex justify-end p-6 border-t border-white/5">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-6 py-2 font-bold text-black rounded-lg transition-transform bg-brand-yellow hover:scale-105"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="w-10 h-10 rounded-full border-4 animate-spin border-brand-yellow/30 border-t-brand-yellow" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
