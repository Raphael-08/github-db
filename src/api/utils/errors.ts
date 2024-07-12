export function EmptyTableError(message: string) {
    return { name: 'EmptyTableError', message };
}
export function UserMessedWithDBError(message: string){
    return { name: 'UserMessedWithDBError', message };
}
export function MetaDataNotOFoundError(message: string){
    return { name: 'MetaDataNotOFoundError', message };
}
export function UnsuccesfullError(message: string){
    return { name: 'UnsuccesfullError', message };
}