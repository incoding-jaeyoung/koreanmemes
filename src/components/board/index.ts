// 게시판 공통 컴포넌트 barrel export
export { default as BoardListLayout } from "./BoardListLayout";
export type { BoardListLayoutProps, HeroConfig } from "./BoardListLayout";

export { default as BoardDetailLayout } from "./BoardDetailLayout";

export { default as BoardWriteLayout } from "./BoardWriteLayout";
export type { CategoryOption } from "./BoardWriteLayout";

export { default as BoardTable } from "./BoardTable";
export type { PostRow } from "./BoardTable";
export { default as BoardThumbnailGrid } from "./BoardThumbnailGrid";

export { default as BoardPagination } from "./BoardPagination";
export { default as BoardSearchBar } from "./BoardSearchBar";
export { default as BoardActionButtons } from "./BoardActionButtons";
