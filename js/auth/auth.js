export async function getSessionUser() {
  const { data, error } = await window.supabaseClient.auth.getUser();
  if (error) return null;
  return data?.user || null;
}

export async function startAnonymousSession() {
  const existing = await getSessionUser();
  if (existing) return existing;
  const { data, error } = await window.supabaseClient.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await window.supabaseClient.auth.signOut();
}
