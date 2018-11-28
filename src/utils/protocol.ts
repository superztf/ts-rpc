// proxy server receive option
export const enum SERVER_OP {
    client_registe,
    client_unregiste,
    client_message,
    client_broadcast,
}

// client receive option
export const enum CLIENT_OP {
    registe_result, // my app registe result
    notice,
    request,
    response,
    s2c_registe, // other apps registed name
    s2c_unregiste, // other apps unregisted name
}
