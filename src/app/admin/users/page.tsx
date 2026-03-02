"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Ban,
  Mail,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Eye,
  Heart,
  ThumbsUp,
  Globe,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BoardPagination from "@/components/board/BoardPagination";
import LangIco from "@/components/common/LangIco";
import Link from "next/link";


// 주요 국가 이름 매핑
const COUNTRY_NAMES: Record<string, string> = {
  KR: '대한민국',
  US: '미국',
  JP: '일본',
  CN: '중국',
  GB: '영국',
  DE: '독일',
  FR: '프랑스',
  CA: '캐나다',
  AU: '호주',
  SG: '싱가포르',
  TW: '대만',
  HK: '홍콩',
  VN: '베트남',
  TH: '태국',
  IN: '인도',
  ID: '인도네시아',
  PH: '필리핀',
  MY: '말레이시아',
};

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  is_banned: boolean;
  created_at: string;
  providers?: string[];
  last_sign_in_at?: string | null;
  post_count?: number;
  comment_count?: number;
  total_views?: number;
  total_likes_received?: number;
  total_likes_given?: number;
  country?: string | null;
  region?: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [banFilter, setBanFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sortField, setSortField] = useState<"created_at" | "last_sign_in_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, banFilter, currentPage, sortField, sortOrder]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "10");
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (banFilter) params.append("is_banned", banFilter);
      params.append("sort", sortField);
      params.append("sort_order", sortOrder);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.count || 0);
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: `회원 목록을 불러오지 못했습니다: ${errorData.error || '알 수 없는 오류'}` });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
        setMessage({ type: "success", text: "사용자 정보가 업데이트되었습니다." });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "업데이트에 실패했습니다." });
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`${username} 유저를 정말로 삭제하시겠습니까? 프로필 데이터가 완전히 삭제됩니다.`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ type: "success", text: "사용자가 성공적으로 삭제되었습니다." });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("삭제에 실패했습니다.");
      }
    } catch (error) {
      setMessage({ type: "error", text: "삭제 중 오류가 발생했습니다." });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSort = (field: "created_at" | "last_sign_in_at") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: "created_at" | "last_sign_in_at" }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 text-neutral-600" />;
    return sortOrder === "asc"
      ? <ArrowUp className="w-3 h-3 ml-1 text-brand-yellow" />
      : <ArrowDown className="w-3 h-3 ml-1 text-brand-yellow" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white mb-2">사용자 관리</h2>
          <p className="text-neutral-400">회원 목록을 조회하고 권한 및 이용 상태를 관리합니다.</p>
          <div className="mt-2 text-sm font-bold text-brand-yellow">
            <span className="text-neutral-500 mr-2">총 가입 인원:</span>
            {totalCount.toLocaleString()}명
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${
              message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-brand-red/10 text-brand-red border border-brand-red/20"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <form onSubmit={handleSearch} className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text"
            placeholder="사용자 이름 또는 이메일로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-yellow/50 transition-colors outline-none text-white font-medium"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
            검색
          </button>
        </form>

        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
          <Shield className="w-4 h-4 text-neutral-500" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent text-sm font-bold text-neutral-300 outline-none w-full"
          >
            <option value="" className="bg-neutral-900 text-white">모든 역할</option>
            <option value="user" className="bg-neutral-900 text-white">일반 사용자</option>
            <option value="admin" className="bg-neutral-900 text-white">관리자</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
          <Ban className="w-4 h-4 text-neutral-500" />
          <select 
            value={banFilter}
            onChange={(e) => setBanFilter(e.target.value)}
            className="bg-transparent text-sm font-bold text-neutral-300 outline-none w-full"
          >
            <option value="" className="bg-neutral-900 text-white">모든 상태</option>
            <option value="false" className="bg-neutral-900 text-white">정상 이용</option>
            <option value="true" className="bg-neutral-900 text-white">차단됨</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          {/* ... table content same as before ... */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500">사용자</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center hover:text-white transition-colors"
                  >
                    가입일
                    <SortIcon field="created_at" />
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500">
                  <button
                    onClick={() => handleSort("last_sign_in_at")}
                    className="flex items-center hover:text-white transition-colors"
                  >
                    최근 접속일
                    <SortIcon field="last_sign_in_at" />
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 text-center">활동</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500">이메일</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 text-center">국가/지역</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 text-center">가입 경로</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 text-center">역할</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 text-center">상태</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center text-neutral-500 font-bold">검색 결과가 없습니다.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20">
                          <Users className="w-4 h-4 text-brand-yellow" />
                        </div>
                        <Link
                          href={`/profile/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-white hover:text-brand-yellow transition-colors"
                        >
                          {user.username}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-500 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '정보 없음'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        {user.last_sign_in_at ? (
                          <span className="text-white font-medium">
                            {new Date(user.last_sign_in_at).toLocaleDateString('ko-KR')}
                            <span className="block text-xs text-neutral-500 font-normal">
                              {new Date(user.last_sign_in_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-amber-500/70 text-xs font-bold">인증 대기</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div className="flex items-center gap-1" title="게시글">
                          <FileText className="w-3 h-3 text-neutral-500" />
                          <span className="text-white font-bold">{user.post_count ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="댓글">
                          <MessageSquare className="w-3 h-3 text-neutral-500" />
                          <span className="text-white font-bold">{user.comment_count ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="내 글 총 조회수">
                          <Eye className="w-3 h-3 text-neutral-500" />
                          <span className="text-white font-bold">{(user.total_views ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1" title="받은 좋아요">
                          <Heart className="w-3 h-3 text-neutral-500" />
                          <span className="text-white font-bold">{user.total_likes_received ?? 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-400 text-sm">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email || '정보 없음'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.country ? (
                        <div className="flex items-center justify-center gap-2">
                          <LangIco
                            langOrCountry={user.country}
                            size={24}
                            title={COUNTRY_NAMES[user.country] || user.country}
                          />
                          <div className="text-left">
                            <div className="text-xs font-bold text-white">
                              {COUNTRY_NAMES[user.country] || user.country}
                            </div>
                            {user.region && (
                              <div className="text-xs text-neutral-500">
                                {user.region}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 text-neutral-600">
                          <Globe className="w-3.5 h-3.5" />
                          <span className="text-xs">-</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        {(!user.providers || user.providers.length === 0) && (
                          <div className="flex items-center gap-1.5 opacity-60 grayscale" title="Email">
                            <Mail className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                          </div>
                        )}
                        {user.providers?.map((p) => {
                          if (p === 'google') {
                            return (
                              <div key={p} className="flex items-center gap-1.5" title="Google">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>
                                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Google</span>
                              </div>
                            );
                          } else if (p === 'discord') {
                            return (
                              <div key={p} className="flex items-center gap-1.5" title="Discord">
                                <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                                <span className="text-xs font-bold text-[#5865F2] uppercase tracking-wider">Discord</span>
                              </div>
                            );
                          } else if (p === 'naver') {
                            return (
                              <div key={p} className="flex items-center gap-1.5" title="Naver">
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                                  <rect width="24" height="24" rx="4" fill="#03C75A"/>
                                  <path d="M13.67 12.31L10.18 7H7.5v10h3.33v-5.31L14.32 17H17V7h-3.33v5.31z" fill="white"/>
                                </svg>
                                <span className="text-xs font-bold text-[#03C75A] uppercase tracking-wider">Naver</span>
                              </div>
                            );
                          } else if (p === 'kakao') {
                            return (
                              <div key={p} className="flex items-center gap-1.5" title="Kakao">
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                                  <rect width="24" height="24" rx="3" fill="#FEE500"/>
                                  <path d="M12 6C8.686 6 6 8.06 6 10.6c0 1.572.98 2.957 2.47 3.79l-.63 2.33a.2.2 0 0 0 .3.22l2.72-1.8c.36.05.73.08 1.14.08 3.314 0 6-2.06 6-4.6S15.314 6 12 6z" fill="#3C1E1E"/>
                                </svg>
                                <span className="text-xs font-bold text-[#F9E000] uppercase tracking-wider">Kakao</span>
                              </div>
                            );
                          }
                          // 기본값 (Email)
                          return (
                            <div key={p} className="flex items-center gap-1.5 opacity-60 grayscale" title={p}>
                              <Mail className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleUpdate(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })}
                        className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter transition-all hover:opacity-80 ${
                          user.role === 'admin' 
                            ? "text-brand-yellow" 
                            : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleUpdate(user.id, { is_banned: !user.is_banned })}
                        className={`text-xs font-black uppercase tracking-tighter transition-all hover:opacity-80 ${
                          user.is_banned 
                            ? "text-brand-red" 
                            : "text-emerald-500"
                        }`}
                      >
                        {user.is_banned ? "Banned" : "Active"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-2 hover:bg-brand-red/10 text-neutral-500 hover:text-brand-red transition-all rounded-lg"
                          title="계정 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex justify-center">
            <BoardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-blue-500 shrink-0" />
        <div>
          <h4 className="font-bold text-white mb-1">사용자 관리 팁</h4>
          <p className="text-sm text-neutral-400 leading-relaxed">
            관리자 계정은 모든 게시글과 댓글을 강제로 삭제할 수 있는 권한을 가집니다. 특정 사용자가 커뮤니티 가이드를 위반할 경우 <span className="text-brand-red font-bold">Ban</span> 버튼을 사용하여 즉시 활동을 제한할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
