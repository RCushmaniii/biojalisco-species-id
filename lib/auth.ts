export async function getAuthUserId(): Promise<string> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return userId;
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') throw e;
    // Clerk not configured — use demo mode placeholder
    throw new Error('Unauthorized');
  }
}

export async function getAuthUserWithRole(): Promise<{ userId: string; isReviewer: boolean }> {
  try {
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
    const user = await currentUser();
    const role = (user?.publicMetadata as Record<string, unknown>)?.role;
    return { userId, isReviewer: role === 'reviewer' };
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') throw e;
    throw new Error('Unauthorized');
  }
}

export async function requireReviewer(): Promise<string> {
  const { userId, isReviewer } = await getAuthUserWithRole();
  if (!isReviewer) throw new Error('Forbidden');
  return userId;
}
