import { notFound } from "next/navigation";
import prisma from "@/src/lib/prisma";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { MemoryForm } from "@/src/components/admin/MemoryForm";
import type { Memory } from "@/src/types";

export const revalidate = 0;

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  let memory: Memory | null = null;
  let error: Error | null = null;
  try {
    const rawMemory = await prisma.memory.findUnique({
      where: { id },
      include: {
        images: { select: { imageUrl: true }, orderBy: { sortOrder: 'asc' } }
      }
    });

    if (rawMemory) {
      memory = {
        ...rawMemory,
        memory_date: rawMemory.memory_date.toISOString(),
        createdAt: rawMemory.createdAt.toISOString(),
        updatedAt: rawMemory.updatedAt.toISOString(),
        post_images: rawMemory.images.map(img => ({ image_url: img.imageUrl })),
      } as unknown as Memory;
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  if (error || !memory) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-12">
        <PageContainer>
          <div className="mb-10 max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Memory</h1>
            <p className="mt-2 text-foreground/60">Refine your past reflections.</p>
          </div>
          <MemoryForm initialData={memory} />
        </PageContainer>
      </main>
    </div>
  );
}
