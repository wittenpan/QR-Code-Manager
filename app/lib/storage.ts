// lib/storage.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImage(file: File): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("menu-images")
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}