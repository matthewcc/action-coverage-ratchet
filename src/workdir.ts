// eslint-disable-next-line import/prefer-default-export
export function isValid(dir: string): boolean {
    return !dir.startsWith('/') && !dir.startsWith('..');
}
