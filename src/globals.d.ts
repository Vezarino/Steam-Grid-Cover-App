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

interface SteamAppDetailsResponse {
    [k: number]: {
        success: boolean
        data: SteamAppDetails
    }
}

interface SteamAppDetails {
    type:                 string;
    name:                 string;
    steam_appid:          number;
    required_age:         number;
    is_free:              boolean;
    detailed_description: string;
    about_the_game:       string;
    short_description:    string;
    supported_languages:  string;
    header_image:         string;
    capsule_image:        string;
    capsule_imagev5:      string;
    website:              null;
    pc_requirements:      PCRequirements;
    mac_requirements:     any[];
    linux_requirements:   any[];
    developers:           string[];
    publishers:           string[];
    price_overview:       PriceOverview;
    packages:             number[];
    package_groups:       PackageGroup[];
    platforms:            Platforms;
    metacritic:           Metacritic;
    categories:           Category[];
    genres:               Genre[];
    screenshots:          Screenshot[];
    recommendations:      Recommendations;
    release_date:         ReleaseDate;
    support_info:         SupportInfo;
    background:           string;
    background_raw:       string;
    content_descriptors:  ContentDescriptors;
}


interface Category {
    id:          number;
    description: string;
}

interface ContentDescriptors {
    ids:   any[];
    notes: null;
}

interface Genre {
    id:          string;
    description: string;
}

interface Metacritic {
    score: number;
    url:   string;
}

interface PackageGroup {
    name:                      string;
    title:                     string;
    description:               string;
    selection_text:            string;
    save_text:                 string;
    display_type:              number;
    is_recurring_subscription: string;
    subs:                      Sub[];
}

interface Sub {
    packageid:                    number;
    percent_savings_text:         string;
    percent_savings:              number;
    option_text:                  string;
    option_description:           string;
    can_get_free_license:         string;
    is_free_license:              boolean;
    price_in_cents_with_discount: number;
}

interface PCRequirements {
    minimum: string;
}

interface Platforms {
    windows: boolean;
    mac:     boolean;
    linux:   boolean;
}

interface PriceOverview {
    currency:          string;
    initial:           number;
    final:             number;
    discount_percent:  number;
    initial_formatted: string;
    final_formatted:   string;
}

interface Recommendations {
    total: number;
}

interface ReleaseDate {
    coming_soon: boolean;
    date:        string;
}

interface Screenshot {
    id:             number;
    path_thumbnail: string;
    path_full:      string;
}

interface SupportInfo {
    url:   string;
    email: string;
}