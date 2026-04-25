type StorageObject = { name: string }

type StorageBucketApi = {
  list: (path: string, options?: { limit?: number; offset?: number }) => Promise<{
    data: StorageObject[] | null
    error: { message: string } | null
  }>
  remove: (paths: string[]) => Promise<{ error: { message: string } | null }>
}

export type AdminClient = {
  storage: {
    from: (bucket: string) => StorageBucketApi
  }
  auth: {
    admin: {
      deleteUser: (id: string) => Promise<{ error: { message: string } | null }>
    }
  }
}

export type AccountDeleteResult = { success: true } | { error: string }

export async function deleteAccountWithCleanup(
  adminClient: AdminClient,
  userId: string,
  bucketName = process.env.NEXT_PUBLIC_ARCHIVE_BUCKET || 'archive-media'
): Promise<AccountDeleteResult> {
  const storage = adminClient.storage.from(bucketName)
  const { data: objects, error: listError } = await storage.list(userId, {
    limit: 1000,
    offset: 0,
  })

  if (listError) {
    return { error: listError.message }
  }

  if (objects && objects.length > 0) {
    const paths = objects.map(object => `${userId}/${object.name}`)
    const { error: removeError } = await storage.remove(paths)
    if (removeError) {
      return { error: removeError.message }
    }
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
  if (deleteError) {
    return { error: deleteError.message }
  }

  return { success: true }
}
