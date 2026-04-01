// In development on Android emulator, use 10.0.2.2 to connect to localhost on the host machine.
// On physical device or iOS simulator, cuse your computer's local network IP address
// e.g. 'http://192.168.1.5:5001'

const BASE_URL = 'http://10.85.54.48:5001'; // Machine's current local IP
// const BASE_URL = 'http://10.0.2.2:5001'; // For Android emulator (standard)
// const BASE_URL = 'http://localhost:5001'; // For iOS Simulator or web

export default {
  API_URL: `${BASE_URL}/api`,
  BASE_URL
};
