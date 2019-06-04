export interface UiNotificationVariableData {
    title?:string,
    icon?:string,
    text?:string,
    action?:string,
    token?:number
}

export interface UiNotificationData {
    id:string,
    uid:string,
    type:string,
    data?:UiNotificationVariableData,
    date:number,
    seen:boolean
}
