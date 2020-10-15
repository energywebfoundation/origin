const registry = new Set<string>();

export async function ensureSingleProcessOnly<T>(
    token: string,
    bucket: string,
    fn: () => Promise<T>,
    throttledError: Error
): Promise<T> {
    const key = `${token}${bucket}`;
    if (registry.has(key)) {
        throw throttledError;
    }

    try {
        registry.add(key);
        const res = await fn();
        return res;
    } finally {
        registry.delete(key);
    }
}
