export async function loadProgress(userId) {
  const { data, error } = await window.supabaseClient
    .from("mission_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data || [];
}

export async function saveMissionProgress(userId, missionId, score, completed = true) {
  const { data: old, error: readError } = await window.supabaseClient
    .from("mission_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();
  if (readError) throw readError;

  const payload = {
    score,
    best_score: Math.max(score, old?.best_score || 0),
    completed: completed || old?.completed || false,
    attempts: (old?.attempts || 0) + 1,
    completed_at: completed ? new Date().toISOString() : old?.completed_at || null,
    updated_at: new Date().toISOString()
  };

  if (old) {
    const { data, error } = await window.supabaseClient
      .from("mission_progress")
      .update(payload)
      .eq("id", old.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await window.supabaseClient
    .from("mission_progress")
    .insert({ user_id: userId, mission_id: missionId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveActivityResult(userId, missionId, activityId, score, benar, total) {
  const { data, error } = await window.supabaseClient
    .from("activity_results")
    .insert({ user_id: userId, mission_id: missionId, activity_id: activityId, score, benar, total_soal: total })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveFinalResult(userId, score, benar, total) {
  const { data: old, error: readError } = await window.supabaseClient
    .from("final_results")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;

  if (old) return old;
  const { data, error } = await window.supabaseClient
    .from("final_results")
    .insert({ user_id: userId, final_score: score, benar, jumlah_soal: total })
    .select()
    .single();
  if (error) throw error;
  return data;
}
