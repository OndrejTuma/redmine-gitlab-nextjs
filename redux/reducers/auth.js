export default (state = {
    user: {
        id: 0,
        glKey: '',
        rmKey: '',
        tdKey: '',
    },
    isLogged: false,
}, action) => {
    switch (action.type) {
        case 'AUTH_USER':
            return Object.assign({}, state, {
                user: action.payload
            })
        case 'LOG_IN':
            return Object.assign({}, state, {
                isLogged: true
            })
        case 'LOG_OUT':
            return Object.assign({}, state, {
                isLogged: false
            })
        default:
            return state
    }
}