import fetch from 'isomorphic-fetch'

import {systems} from './consts'

export const REST = {
    rm: (resource, callback, method, data) => {
        return restFetch(`${systems.redmine.url}${resource}`, callback, method, Object.assign({
            key: systems.redmine.auth,
        }, data))
    },
    gl: (resource, callback, method, data) => {
        return restFetch(`${systems.gitlab.apiUrl}${resource}`, callback, method, Object.assign({
            private_token: systems.gitlab.auth,
        }, data))
    },
    td: (resource, callback, method, data) => {
        return restFetch(`${systems.timedoctor.url}${resource}`, callback, method, Object.assign({
            access_token: systems.timedoctor.auth,
        }, data))
    },
}

export const restFetch = (url, callback, method = `GET`, data) => {
    if (method === 'GET' && data) {
        url += /\?/.test(url) ? '&' : '?'
        for (let [key, value] of Object.entries(data)) {
            url += `${key}=${value}&`
        }
    }

    var apiFetch = fetch(url, {
        mode: 'cors',
        method: method,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        body: method === 'GET' ? null : JSON.stringify(data)
    })
        .then(
            response => {
                if (!response.ok) {
                    console.error(`Fetch on url ( ${response.url} ) failed: ${response.status} - ${response.statusText}`)
                }
                else {
                    return response.text().then(text => (text ? JSON.parse(text) : {}))
                }
            },
            error => console.error('Error occured while fetching:', error)
        )
        .then(response => callback(response));

    return apiFetch;
}


export const gitlabFetch = (resource_url, method, data = {}) => {
    return apiFetch(`${systems.gitlab.apiProjectUrl}${resource_url}`, method, Object.assign({}, data, {
        private_token: systems.gitlab.auth,
    }))
}
export const redmineFetch = (resource_url, method, data = {}) => {
    return apiFetch(`${systems.redmine.url}${resource_url}`, method, Object.assign({}, data, {
        key: systems.redmine.auth,
        project_id: systems.redmine.projectId,
    }))
}
export const apiFetch = (url, method = `GET`, data) => {
    if (method === 'GET' && data) {
        url += /\?/.test(url) ? '&' : '?'
        for (let [key, value] of Object.entries(data)) {
            url += `${key}=${value}&`
        }
    }

    var apiFetch = fetch(url, {
        mode: 'cors',
        method,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        body: method === 'GET' ? null : JSON.stringify(data)
    })
        .then(
            response => {
                if (!response.ok) {
                    return response
                }
                return response.text().then(text => (text ? JSON.parse(text) : {}))
            }
        )

    return apiFetch;
}