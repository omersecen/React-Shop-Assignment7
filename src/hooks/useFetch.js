import { useEffect, useReducer } from 'react';

const initialState = { loading: true, error: null, data: null };
function reducer(state, action) {
  switch (action.type) {
    case 'LOADING': return initialState;
    case 'SUCCESS': return { loading: false, error: null, data: action.data };
    case 'ERROR': return { loading: false, error: action.error, data: null };
    default: return state;
  }
}

// Pass a stable API function and a fixed-length array of primitive arguments.
// API functions receive (...inputs, signal), allowing lists and details to share logic.
export default function useFetch(fetcher, inputs = []) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    dispatch({ type: 'LOADING' });
    Promise.resolve().then(() => fetcher(...inputs, controller.signal))
      .then(data => {
        if (active) dispatch({ type: 'SUCCESS', data });
      })
      .catch(error => {
        if (active && error.name !== 'AbortError') dispatch({ type: 'ERROR', error });
      });
    return () => {
      active = false;
      controller.abort();
    };
    // Call sites supply every API input here; the array length must stay constant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, ...inputs]);
  return state;
}
