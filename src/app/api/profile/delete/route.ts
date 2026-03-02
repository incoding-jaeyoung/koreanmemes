import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/profile/delete - 본인 계정 탈퇴 (자기 자신만 삭제 가능)
 */
export async function DELETE() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const admin = createAdminClient();

    // 1. 연관 데이터 삭제 (FK 제약으로 인한 auth 삭제 실패 방지)
    await admin.from("post_likes").delete().eq("user_id", userId);
    await admin.from("comments").delete().eq("author_id", userId);
    await admin.from("posts").delete().eq("author_id", userId);
    await admin.from("profiles").delete().eq("id", userId);

    // 2. Auth 유저 삭제
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/profile/delete error:", error);
    return NextResponse.json(
      { error: error.message || "탈퇴 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
