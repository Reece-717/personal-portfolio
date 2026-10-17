import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { PostEditor } from "@/components/admin/PostEditor";

export default async function AdminNewPostPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">新建文章</h1>
      <div className="mt-8">
        <PostEditor />
      </div>
    </div>
  );
}
