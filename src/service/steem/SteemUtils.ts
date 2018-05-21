import {preLoadImage} from "../ImageUtil";

export function loadUserAvatar(user:string):Promise<string>{
    /*return new Promise<string>((resolve, reject) => {
        steem.api.getAccounts([user], (err, result:SteemAccount[]) =>{
            preLoadImage(JSON.parse(result[0].json_metadata).profile.profile_image).then(value => {
                resolve(value);
            });
        });
    });*/
    return new Promise<string>((resolve, reject) => {
        preLoadImage("https://steemitimages.com/u/"+user+"/avatar").then(value => {
            resolve(value);
        }).catch(reason => {
            resolve("https://avatar.admin.rphstudio.net/avatar/avatars/avatar-067.jpeg");//default avatar
        });
    });
}

export function markdownImageLink(text:string):string{
    if(text.indexOf('![')!=-1){
        return text;//Markdown probably already applied //TODO find a better way to do that
    }
    let isImgUrl= /https?:\/\/.*?\.(?:png|jpg|jpeg|gif)/ig;
    return text.replace(isImgUrl,'\n![img]($&)\n');
}