declare function logProgress(text: string): void;
declare function logProgressError(text: string): void;

interface SteamGetOwnedGamesResult {
    response: {
        game_count: number
        games: SteamGame[]
    }
}

interface SteamGame {
    appid: number
    content_descriptorids: number[]
    image_icon_url: string
    name: string
    playtime_disconnected: number
    playtime_forever: number
    playtime_linux_forever: number
    playtime_mac_forever: number
    playtime_windows_forever: number
    rtime_last_played: number
}

interface SGDBGridsResponse {
    success: boolean
    data: {
        author: {
            avatar: string
            name: string
            steam64: string
        }
        downvotes: number
        epilepsy: boolean
        height: number
        humor: boolean
        id: number
        language: string
        lock: boolean
        mime: string
        notes: unknown
        nsfw: boolean
        score: number
        style: string
        thumb: string
        upvotes: number
        url: string
        width: number
    }[]
}