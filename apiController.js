import { systems } from './consts'
import fetch from 'isomorphic-fetch'

export const REST = {
	rm: (resource, callback, method, data) => {
		return restFetch(`${systems.redmine.url}${resource}`, callback, method, Object.assign({
			key: systems.redmine.auth,
		}, data))
	},
	gl: (resource, callback, method, data) => {
		return restFetch(`${systems.gitlab.url}${resource}`, callback, method, Object.assign({
			private_token: systems.gitlab.auth,
		}, data))
	},
	td: (resource, callback, method, data) => {
		return restFetch(`${systems.timedoctor.url}${resource}`, callback, method, Object.assign({
			access_token: systems.timedoctor.auth,
		}, data))
	},
}

const restFetch = (url, callback, method = `GET`, data) => {
	if (method === 'GET') {
		url += /\?/.test(url) ? '&' : '?'
		for (let [key, value] of Object.entries(data)) {
			url += `${key}=${value}&`
		}
	}
	return fetch(url, {
		//;mode: 'cors',
		method: method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: method === 'GET' ? null : JSON.stringify(data)
	})
		.then(
			response => {
				//console.log('REST fetch response', response);
				if (!response.ok) {
					alert(`Fetch on url ( ${response.url} ) failed: ${response.status} - ${response.statusText}`)
				}
				if (method === 'GET') {
					return response.json()
				}
			},
			error => console.error('Error occured while fetching:', error)
		)
		.then(response => {
			callback(response)
		})
}