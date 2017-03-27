export interface ConfigUser {
    key: string;
    playerId: string;
    playerName: string;
    playerImageUrl: string;
}

export interface SessionInfo {
    user: ConfigUser;
    loginUrl: string;
    logoutUrl: string;

}
