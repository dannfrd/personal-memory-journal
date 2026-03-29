import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { MemoryForm } from "@/src/components/admin/MemoryForm";

export default function NewPostPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-12">
        <PageContainer>
          <div className="mb-10 max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Draft a Memory</h1>
            <p className="mt-2 text-foreground/60">Capture a moment in time.</p>
          </div>
          <MemoryForm />
        </PageContainer>
      </main>
    </div>
  );
}
