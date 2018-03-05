export default (state = {
    fetching: false,
}, action) => {
    switch (action.type) {
        case 'IS_FETCHING':
            return Object.assign({}, state, {
                fetching: action.payload,
            })
        default:
            return state
    }
}