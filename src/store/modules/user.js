import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { setTheme, defaultTheme } from '@/assets/theme/setTheme.js'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    theme: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_THEME: (state, theme) => {
    state.theme = theme
  }
}

const actions = {
  // user login
  login({ commit, state, dispatch }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        commit('SET_THEME', data.theme || defaultTheme)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 设置用户数据
  SetUserData({ commit, dispatch }, info) {
    commit('setStateAttr', { info })
    // 设置主题
    setTheme(info.theme)
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },
  // 改变用户主题
  ChangeTheme({ commit, state }, theme) {
    commit('SET_THEME', theme)
    setTheme(theme)
    // 再将该用户选的主题存到数据库（不方便mock所以省略）
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

