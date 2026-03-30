import { notFound } from "next/navigation";
import prisma from "@/src/lib/prisma";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { MemoryForm } from "@/src/components/admin/MemoryForm";

export const revalidate = 0;

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  let memory: any = null;
  let error: any = null;
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
        post_images: rawMemory.images.map(img => ({ image_url: img.imageUrl })),
      };
    }
  } catch (err: any) {
    error = err;
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
