export function generateProfileUrl(userId: string, userName?: string): string {
  if (!userId) {
    throw new Error('User ID is required for profile URL generation');
  }

  const slugifiedName = userName 
    ? userName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : '';

  return slugifiedName 
    ? `/users/${userId}/${slugifiedName}`
    : `/users/${userId}`;
}