import { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext(null);
export function authReducer(state, action) {
  switch (action.type) {
    case 'LOGGED_IN': return { user: action.user };
    case 'LOGGED_OUT': return { user: null };
    default: return state;
  }
}
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, { user: null });
  return <AuthContext.Provider value={{ user: state.user, dispatch }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}
