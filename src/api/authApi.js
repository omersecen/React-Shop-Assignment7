export const DEMO_USERNAME = '230408037@st.biruni.edu.tr';

// This fixed, public demo pair is not real authentication.
export function login(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === DEMO_USERNAME && password === 'demo123456') {
        resolve({ username });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
}
