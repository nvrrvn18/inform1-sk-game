const localProgressKey = "sistemKomputer_progress_cache";

function cacheProgress(userId, rows) {
  try {
    const all = JSON.parse(localStorage.getItem(localProgressKey) || "{}");
    all[userId] = rows;
    localStorage.setItem(localProgressKey, JSON.stringify(all));
  } catch (_) {}
}

function readCachedProgress(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(localProgressKey) || "{}");
    return all[userId] || [];
  } catch (_) {
    return [];
  }
}

export async function loadProgress(userId) {
  const { data, error } = await window.supabaseClient
    .from("mission_progress")
    .select("*")
    .eq("user_id", userId)
    .order("mission_id");

  if (error) {
    console.warn("Supabase progress gagal dibaca, memakai cache lokal.", error);
    return readCachedProgress(userId);
  }

  cacheProgress(userId, data || []);
  return data || [];
}

export async function saveMissionProgress(
  userId,
  missionId,
  score,
  completed = true
) {
  const now = new Date().toISOString();

  const { data: old, error: readError } = await window.supabaseClient
    .from("mission_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (readError) {
    console.warn("Progress lama tidak dapat dibaca.", readError);
    throw readError;
  }

  const payload = {
    user_id: userId,
    mission_id: missionId,
    score: Number(score) || 0,
    best_score: Math.max(Number(score) || 0, Number(old?.best_score) || 0),
    completed: Boolean(completed || old?.completed),
    attempts: (Number(old?.attempts) || 0) + 1,
    completed_at: completed
      ? now
      : old?.completed_at || null,
    updated_at: now
  };

  const { data, error } = await window.supabaseClient
    .from("mission_progress")
    .upsert(payload, {
      onConflict: "user_id,mission_id"
    })
    .select()
    .single();

  if (error) {
    console.warn("Gagal menyimpan progress ke Supabase.", error);

    // Simpan sementara agar progress sesi tidak langsung hilang.
    const cached = readCachedProgress(userId);
    const index = cached.findIndex(
      row => row.mission_id === missionId
    );

    const localRow = {
      ...(index >= 0 ? cached[index] : {}),
      ...payload
    };

    if (index >= 0) {
      cached[index] = localRow;
    } else {
      cached.push(localRow);
    }

    cacheProgress(userId, cached);
    throw error;
  }

  const cached = readCachedProgress(userId);
  const index = cached.findIndex(
    row => row.mission_id === missionId
  );

  if (index >= 0) {
    cached[index] = data;
  } else {
    cached.push(data);
  }

  cacheProgress(userId, cached);
  return data;
}

export async function saveActivityResult(
  userId,
  missionId,
  activityId,
  score,
  benar,
  total
) {
  const { data, error } = await window.supabaseClient
    .from("activity_results")
    .insert({
      user_id: userId,
      mission_id: missionId,
      activity_id: activityId,
      score: Number(score) || 0,
      benar: Number(benar) || 0,
      total_soal: Number(total) || 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveFinalResult(
  userId,
  score,
  benar,
  total
) {
  const { data: old, error: readError } = await window.supabaseClient
    .from("final_results")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw readError;

  const payload = {
    user_id: userId,
    final_score: Number(score) || 0,
    benar: Number(benar) || 0,
    jumlah_soal: Number(total) || 0,
    selesai_at: new Date().toISOString()
  };

  if (old) {
    // Hasil final terbaru menggantikan hasil sebelumnya.
    const { data, error } = await window.supabaseClient
      .from("final_results")
      .update(payload)
      .eq("id", old.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await window.supabaseClient
    .from("final_results")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}
