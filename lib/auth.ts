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
