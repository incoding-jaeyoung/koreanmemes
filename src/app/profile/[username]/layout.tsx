import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, comment, avatar_url")
    .eq("username", username)
    .single();

  if (!profile) {
    return { title: "User Not Found" };
  }

  const description =
    profile.comment ||
    `${profile.username}'s profile on VFMANIA. Virtua Fighter community member.`;

  return {
    title: profile.username,
    description,
    openGraph: {
      title: `${profile.username} | VFMANIA`,
      description,
      type: "profile",
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
    twitter: {
      card: "summary",
      title: `${profile.username} | VFMANIA`,
      description,
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
  };
}

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
