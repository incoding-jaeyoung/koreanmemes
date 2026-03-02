"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PenSquare } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import BoardTable, { PostRow, CategoryBadgeConfig } from "@/components/board/BoardTable";
import BoardThumbnailGrid from "@/components/board/BoardThumbnailGrid";
import BoardPagination from "@/components/board/BoardPagination";
import BoardSearchBar from "@/components/board/BoardSearchBar";
import { useLanguage } from "@/context/LanguageContext";

export interface HeroConfig {
  title: string;
  highlightTitle?: string;
  subtitle?: string;
  tags?: string[];
}

export interface BoardListLayoutProps {
  /** HeroSection 설정 */
  heroConfig: HeroConfig;
  /** API 엔드포인트 (예: /api/board, /api/news) */
  apiEndpoint: string;
  /** 게시글 상세 경로 생성 함수 */
  getPostHref?: (post: PostRow) => string;
  /** 글쓰기 경로 */
  writePath?: string;
  /** 글쓰기 버튼 표시 여부 */
  showWriteButton?: boolean;
  /** 빈 목록 i18n 키 */
  emptyKey?: string;
  /** 검색 placeholder i18n 키 */
  searchPlaceholderKey?: string;
  /** 페이지당 게시글 수 */
  postsPerPage?: number;
  /** 카테고리 뱃지 설정 — 없으면 뱃지 숨김 */
  categoryBadge?: CategoryBadgeConfig;
  /** HeroSection 숨김 (외부에서 직접 Hero를 렌더링할 때) */
  hideHero?: boolean;
  /** 리스트 스타일: table(기본) | thumbnail */
  listVariant?: "table" | "thumbnail";
  /** Hero 아래, 리스트 위에 넣을 슬롯 (예: 슬라이더) */
  slotBetweenHeroAndContent?: React.ReactNode;
}

/** 내부 콘텐츠 컴포넌트 — useSearchParams 때문에 Suspense로 감싸야 함 */
function BoardListContent({
  heroConfig,
  apiEndpoint,
  getPostHref,
  writePath = "/board/write",
  showWriteButton = true,
  emptyKey = "board.empty",
  searchPlaceholderKey = "board.search",
  postsPerPage = 15,
  categoryBadge,
  hideHero = false,
  listVariant = "table",
  slotBetweenHeroAndContent,
}: BoardListLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") ?? ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [artistFilter, setArtistFilter] = useState(
    searchParams.get("artist") ?? ""
  );

  useEffect(() => {
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const artist = searchParams.get("artist") ?? "";
    setSearchQuery(search);
    setCurrentPage(page);
    setArtistFilter(artist);
    fetchPosts(page, search, artist);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchPosts = async (page: number, search: string, artist: string = "") => {
    setIsLoading(true);
    try {
      let url = `${apiEndpoint}?page=${page}&limit=${postsPerPage}&search=${encodeURIComponent(search)}`;
      if (artist) url += `&artist=${encodeURIComponent(artist)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts ?? []);
        setTotalPages(Math.ceil((data.total ?? 0) / postsPerPage));
      }
    } catch (err) {
      console.error("BoardListLayout fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // URL 기반 페이지 변경 — 각 게시판의 basePath를 writePath에서 추출
  const basePath = writePath.replace("/write", "");

  const handlePageChange = (pageNum: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");
    if (artistFilter) params.set("artist", artistFilter);
    else params.delete("artist");
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery);
    if (artistFilter) params.set("artist", artistFilter);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams();
    if (artistFilter) params.set("artist", artistFilter);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const handleArtistFilter = (tag: string) => {
    const params = new URLSearchParams();
    if (tag) params.set("artist", tag);
    if (searchQuery) params.set("search", searchQuery);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  // 현재 게시글에서 아티스트 태그 목록 추출 (중복 제거)
  const artistTags = Array.from(
    new Set(posts.map((p) => (p as PostRow & { artist_tag?: string | null }).artist_tag).filter(Boolean))
  ) as string[];

  const renderControls = () => (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-4 mb-6">
      {/* 페이지네이션 (왼쪽) */}
      <div className="order-2 md:order-1">
        <BoardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 검색 + 글쓰기 (오른쪽) */}
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto order-1 md:order-2">
        <BoardSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onReset={handleResetSearch}
          placeholderKey={searchPlaceholderKey}
        />
        {showWriteButton && (
          <button
            onClick={() => router.push(writePath)}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white font-bold rounded-lg hover:scale-105 transition-transform text-sm shrink-0"
          >
            <PenSquare className="w-4 h-4" />
            <span>{t("board.write")}</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {!hideHero && (
        <HeroSection
          title={heroConfig.title}
          highlightTitle={heroConfig.highlightTitle}
          subtitle={heroConfig.subtitle}
          tags={heroConfig.tags}
        />
      )}

      {slotBetweenHeroAndContent}

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-10">
        {/* 아티스트 필터 — 태그가 있는 게시글이 하나라도 있을 때만 표시 */}
        {artistTags.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">
              {t("kpop.filterByArtist")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleArtistFilter("")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  !artistFilter
                    ? "bg-brand-blue text-white"
                    : "bg-white/10 text-neutral-400 hover:bg-white/20"
                }`}
              >
                ALL
              </button>
              {artistTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleArtistFilter(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    artistFilter === tag
                      ? "bg-brand-blue text-white"
                      : "bg-white/10 text-neutral-400 hover:bg-white/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 상단 컨트롤 */}
        <div className="hidden md:block">
          {renderControls()}
        </div>

        {/* 게시글 목록 (테이블 또는 썸네일 그리드) */}
        <div className="min-h-0 md:min-h-[400px]">
          {listVariant === "thumbnail" ? (
            <BoardThumbnailGrid
              posts={posts}
              isLoading={isLoading}
              getPostHref={getPostHref}
              emptyKey={emptyKey}
              categoryBadge={categoryBadge}
            />
          ) : (
            <BoardTable
              posts={posts}
              isLoading={isLoading}
              getPostHref={getPostHref}
              emptyKey={emptyKey}
              categoryBadge={categoryBadge}
            />
          )}
        </div>

        {/* 하단 컨트롤 */}
        <div className="mt-6">{renderControls()}</div>
      </div>
    </div>
  );
}

/** 외부에서 사용하는 BoardListLayout — Suspense 래퍼 포함 */
export default function BoardListLayout(props: BoardListLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-6 py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
        </div>
      }
    >
      <BoardListContent {...props} />
    </Suspense>
  );
}
