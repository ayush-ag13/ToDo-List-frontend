import React, { useContext, useState, createContext } from "react"
import axios from 'axios';


const AuthContext = createContext();
export const API_URL = 'http://localhost:8080/api/v1'

export const useAuth = () => {
	return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {

	const [authState, setAuthState] = useState(() => {
		const accessToken = localStorage.getItem('accessToken')
		const refreshToken = localStorage.getItem('refreshToken')
		const userEmail = localStorage.getItem('userEmail')
		if (accessToken && refreshToken && userEmail) {
			axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
			return { accessToken: accessToken, refreshToken: refreshToken, authenticated: true, userEmail: userEmail }
		} else {
			return { accessToken: null, refreshToken: null, authenticated: null, userEmail: null }
		}
	})


	const signup = async (email, password) => {
		try {
			const response = await axios.post(`${API_URL}/user/signup`, { email, password });
			if (response.status !== 200) {
				return { error: true, message: response.data }
			}

			if (response.data.success !== true) {
				return { error: true, message: response.data.message }
			}

			return response
		} catch (err) {
			return { error: true, message: err.message }
		}
	}

	const getPosts = async () => {
		try {
			const response = await axios.get(`${API_URL}/post/allPosts`);
			if (response.status !== 200) {
				return { error: true, message: response.data }
			}

			if (response.data.success !== true) {
				return { error: true, message: response.data.message }
			}

			return response.data.list

		} catch (err) {
			await refresh()
			return { error: true, message: JSON.stringify([err.message, "We have refreshed the token also, can you try again?"]) }
		}
	}

	const deletePostById = async (postId) => {
		try {
			const response = await axios.delete(`${API_URL}/post/deletePost/${postId}`);
			if (response.status !== 200) {
				return { error: true, message: response.data }
			}

			if (response.data.success !== true) {
				return { error: true, message: response.data.message }
			}

			return response.data.message

		} catch (err) {
			await refresh()
			return { error: true, message: JSON.stringify([err.message, "We have refreshed the token also, can you try again?"]) }
		}
	}

	const login = async (email, password) => {
		try {
			const response = await axios.post(`${API_URL}/user/login`, { email, password });

			if (response.status !== 200) {
				return { error: true, message: response.data }
			}

			if (response.data.success !== true) {
				return { error: true, message: response.data.message }
			}

			setAuthState({
				accessToken: response.data.user.access_token,
				refreshToken: response.data.user.refresh_token,
				authenticated: true,
				userEmail: email,
			})

			axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.user.access_token}`
			localStorage.setItem('accessToken', response.data.user.access_token)
			localStorage.setItem('refreshToken', response.data.user.refresh_token)
			localStorage.setItem('userEmail', email)
			return response;

		} catch (err) {
			return { error: true, message: err.message }
		}
	}

	const refresh = async () => {
		try {
			const refreshToken = localStorage.getItem('refreshToken')
			const userEmail = localStorage.getItem('userEmail')

			if (!refreshToken || !userEmail) throw { error: true, message: "refresh token not found" }

			axios.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`


			const response = await axios.post(`${API_URL}/user/refresh`);

			if (response.status !== 200) {
				return { error: true, message: response.data }
			}

			if (response.data.success !== true) {
				return { error: true, message: response.data.message }
			}

			setAuthState({
				accessToken: response.data.user.access_token,
				refreshToken: refreshToken,
				authenticated: true,
				userEmail: userEmail,
			})

			axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.user.access_token}`
			localStorage.setItem('accessToken', response.data.user.access_token)

			return response;

		} catch (err) {
			// there is an error in refresh also, so logout
			await logout()
			alert('Refresh token failed. Logging out.')
			return { error: true, message: err.message }
		}
	}

	const createPost = async (description, imgLink, unixTime) => {
		try {
			const response = await axios.post(`${API_URL}/post/createPost`, { description, imgLink, unixTime});

			if (response.status !== 200) {
				return { error: true, message: response.data }
			}

			if (response.data.success !== true) {
				return { error: true, message: response.data.message }
			}

			return response.data.message;

		} catch (err) {
			await refresh()
			return { error: true, message: JSON.stringify([err.message, "We have refreshed the token also, can you try again?"]) }
		}
	}

	const whoami = async () => {
		try {
			const response = await axios.get(`${API_URL}/user/whoami`);

			if (response.status !== 200) {
				return { error: true, message: response.data }
			}

			if (response.data.success !== true) {
				return { error: true, message: response.data.message }
			}
			return response.data.user;

		} catch (err) {
			await refresh()
			return { error: true, message: JSON.stringify([err.message, "We have refreshed the token also, can you try again?"]) }
		}
	}

	const logout = async () => {
		try {
			setAuthState({
				accessToken: null,
				refreshToken: null,
				authenticated: null,
				userEmail: null,
			})

			axios.defaults.headers.common['Authorization'] = ''
			localStorage.clear()
		} catch (err) {
			return { error: true, message: err.message }
		}
	}

	const value = {
		signup,
		login,
		logout,
		createPost,
		whoami,
		getPosts,
		deletePostById,
		authState
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}