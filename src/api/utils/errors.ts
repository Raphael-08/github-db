export function EmptyTableError(message: string) {
    return { name: 'EmptyTableError', message };
}
export function UserMessedWithDBError(message: string){
    return { name: 'UserMessedWithDBError', message };
}