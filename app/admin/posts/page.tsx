import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit3,
  BookOpen,
  Heart,
  MessageCircle,
  Images,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { DeleteMemoryButton } from "@/src/components/admin/DeleteMemoryButton";
import { formatDate } from "@/src/lib/utils";
import { fetchMemories } from "@/src/lib/vpsMemoryApi";
import type { Memory } from "@/src/types";

export const revalidate = 0;

export default async function AdminPostsPage() {
  let posts: Memory[] = [];
  let error: Error | null = null;

  try {
    posts = await fetchMemories();
  } catch (err: unknown) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.[0]?.count || 0), 0);
  const totalComments = posts.reduce(
    (acc, p) => acc + (p.comments?.[0]?.count || 0),
    0
  );
  const totalPhotos = posts.reduce(
    (acc, p) => acc + 1 + (p.post_images?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-10">
        <PageContainer>
          {/* Studio Dashboard Title & Primary CTA */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400">
                Curator Overview
              </span>
              <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Manajemen Koleksi Memori
              </h1>
            </div>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-background shadow-md transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah Memori Baru</span>
            </Link>
          </div>

          {/* KPI Metric Cards */}
          <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between text-foreground/60 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Memori
                </span>
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-bold text-foreground">
                {posts.length}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                Cerita terpublikasi
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between text-foreground/60 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Foto
                </span>
                <Images className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-bold text-foreground">
                {totalPhotos}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                Sampul &amp; album galeri
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Apresiasi
                </span>
                <Heart className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-bold text-foreground">
                {totalLikes}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                Suka dari pengunjung
              </p>
            </div>

            <Link
              href="/admin/comments"
              className="group rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:border-foreground/30 dark:border-white/10 dark:bg-zinc-900/60"
            >
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Refleksi Masuk
                </span>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-bold text-foreground">
                {totalComments}
              </p>
              <p className="mt-1 text-xs text-foreground/50 group-hover:text-foreground transition-colors">
                Kelola komentar &rarr;
              </p>
            </Link>
          </div>

          {/* Memories Table / List */}
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
            {error ? (
              <div className="p-6 text-red-600">Error: {error.message}</div>
            ) : posts?.length === 0 ? (
              <div className="p-16 text-center">
                <p className="font-serif text-2xl text-foreground/70">
                  Belum ada memori yang tersimpan.
                </p>
                <p className="mt-1 text-sm text-foreground/50">
                  Mulai abadikan momen pertama Anda sekarang.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-black/10 bg-black/[0.02] text-[11px] font-bold uppercase tracking-wider text-foreground/60 dark:border-white/10 dark:bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4">Memori &amp; Kisah</th>
                      <th className="px-6 py-4">Metadata</th>
                      <th className="px-6 py-4 text-center">Album</th>
                      <th className="px-6 py-4 text-center">Interaksi</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {posts?.map((post) => {
                      const photoCount = 1 + (post.post_images?.length || 0);
                      const likeCount = post.likes?.[0]?.count || 0;
                      const commentCount = post.comments?.[0]?.count || 0;

                      return (
                        <tr
                          key={post.id}
                          className="group transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
                        >
                          {/* Cover + Story Title & Description */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-black/5 dark:border-white/10">
                                <Image
                                  src={post.cover_image_url}
                                  alt={post.title || "Memory"}
                                  fill
                                  sizes="80px"
                                  quality={65}
                                  className="object-cover"
                                />
                              </div>
                              <div className="max-w-md min-w-0">
                                <div className="font-serif text-lg font-semibold text-foreground truncate">
                                  {post.title || "Tanpa Judul"}
                                </div>
                                <div className="mt-0.5 line-clamp-2 text-xs text-foreground/65 leading-relaxed">
                                  {post.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date, Location & Mood */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                                <Calendar className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                                {formatDate(post.memory_date)}
                              </span>
                              {post.location && (
                                <span className="inline-flex items-center gap-1.5 text-foreground/55">
                                  <MapPin className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                                  {post.location}
                                </span>
                              )}
                              {post.mood && (
                                <span className="mt-0.5 inline-flex self-start rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                  {post.mood}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Photo Count & Frame Style */}
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-foreground/80 dark:bg-white/10">
                                <Images className="h-3.5 w-3.5" aria-hidden="true" />
                                {photoCount} Foto
                              </span>
                              <span className="text-[10px] uppercase tracking-widest text-foreground/45">
                                {post.frame_style || "minimal"}
                              </span>
                            </div>
                          </td>

                          {/* Likes & Comments */}
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-3 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-foreground/75 dark:border-white/10">
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                                {likeCount}
                              </span>
                              <span className="text-foreground/20">|</span>
                              <span className="inline-flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                {commentCount}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/memories/${post.id}`}
                                target="_blank"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-foreground/55 transition-colors hover:border-black/10 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                                title="Lihat halaman publik"
                              >
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </Link>
                              <Link
                                href={`/admin/posts/${post.id}/edit`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-foreground/55 transition-colors hover:border-black/10 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                                title="Edit Memori"
                              >
                                <Edit3 className="h-4 w-4" aria-hidden="true" />
                              </Link>
                              <DeleteMemoryButton id={post.id} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
