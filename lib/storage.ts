import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "contentos-exports";

export async function uploadFile(
  path: string,
  file: File | Blob | ArrayBuffer,
  contentType?: string,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType });

  if (error) throw new Error(error.message);
  return data;
}

export async function getPublicUrl(path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}
