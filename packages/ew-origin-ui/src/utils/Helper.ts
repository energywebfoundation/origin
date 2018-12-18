export const isOffChainProperty = (name: string, offChainProps: any): boolean => {
 
    for (const offChainPropName of Object.keys(offChainProps)) {

        if (offChainPropName === name) {
            return true;
        }
    }
    return false;
};

export const getOffChainText = (name: string, offChainProps: any): string => {
    return isOffChainProperty(name, offChainProps) ? ' (private)' : '';
};