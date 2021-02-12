import { useEffect, DependencyList } from 'react';

export function useIntervalFetch(
    fetchData: (checkIsMounted: () => boolean) => void,
    refreshInterval: number,
    dependencies: DependencyList = []
) {
    useEffect(() => {
        let isMounted = true;

        const checkIsMounted = () => isMounted;

        const _fetch = async () => {
            await fetchData(checkIsMounted);
        };

        _fetch();

        const intervalRef = setInterval(_fetch, refreshInterval);

        return () => {
            isMounted = false;
            clearInterval(intervalRef);
        };
    }, dependencies);
}
