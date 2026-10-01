export async function getStudent(userId) {
  const { data, error } = await window.supabaseClient
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createStudentProfile(userId, nama, kelas) {
  const existing = await getStudent(userId);
  if (existing) return existing;
  const { data, error } = await window.supabaseClient
    .from("students")
    .insert({ user_id: userId, nama, kelas })
    .select()
    .single();
  if (error) throw error;
  return data;
}
