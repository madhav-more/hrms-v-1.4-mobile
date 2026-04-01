import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'hrms_user';

export const storage = {
  getAccessToken: () => AsyncStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, token),
  
  getRefreshToken: () => AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => AsyncStorage.setItem(REFRESH_TOKEN_KEY, token),
  
  getUserInfo: async () => {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUserInfo: (user) => AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user)),
  
  clearAll: async () => {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_DATA_KEY,
    ]);
  }
};
