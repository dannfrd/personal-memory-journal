import Link from "next/link";
import Image from "next/image";
import { Plus, Edit3 } from "lucide-react";
import prisma from "@/src/lib/prisma";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { DeleteMemoryButton } from "@/src/components/admin/DeleteMemoryButton";
import { formatDate } from "@/src/lib/utils";

export const revalidate = 0;

export default async function AdminPostsPage() {
  let posts: any[] = [];
  let error: any = null;
  
  try {
    const rawPosts = await prisma.memory.findMany({
      orderBy: { memory_date: 'desc' },
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    posts = rawPosts.map(m => ({
      ...m,
      likes: [{ count: m._count.likes }],
      comments: [{ count: m._count.comments }]
    }));
  } catch (err: any) {
    error = err;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-12">
        <PageContainer>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">All Memories</h1>
            <Link 
              href="/admin/posts/new" 
              className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Memory
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/5 dark:bg-zinc-900/50">
            {error ? (
              <div className="p-6 text-red-600">Error: {error.message}</div>
            ) : posts?.length === 0 ? (
              <div className="p-12 text-center text-foreground/50">No memories found. Time to create one!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-black/5 bg-black/[0.02] text-foreground/60 dark:border-white/5 dark:bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Cover</th>
                      <th className="px-6 py-4 font-medium">Story</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium text-center">Engagement</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {posts?.map((post) => (
                      <tr key={post.id} className="transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="px-6 py-4">
                          <div className="relative h-12 w-10 overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
                            <Image src={post.cover_image_url} alt="Memory" fill className="object-cover" unoptimized />
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs text-foreground/80">
                           {post.title && <div className="font-semibold">{post.title}</div>}
                           <div className="truncate text-xs opacity-70">{post.description}</div>
                        </td>
                        <td className="px-6 py-4 text-foreground/60 whitespace-nowrap">{formatDate(post.memory_date)}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-xs text-foreground/60 font-medium tracking-widest uppercase">
                           {post.likes?.[0]?.count || 0} L, {post.comments?.[0]?.count || 0} C
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/admin/posts/${post.id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <DeleteMemoryButton id={post.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
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
