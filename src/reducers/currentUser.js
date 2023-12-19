const initial_state = {
    user: null,
    loggedIn: false,
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IjIzOTci.ASI11g6uQTb8IRDND8F2EF9IUDZO463bH6P7Cr5vLFc',
  };
  
  const currentUser = (state = initial_state, action) => {
    switch (action.type) {
      case 'SET_USER':
        return {
          ...state,
          user: action.payload,
          loggedIn: true,
        };
      case 'SET_TOKEN':
        return {
          ...state,
          token: action.payload,
        };
      case 'LOG_OUT':
        return {
          ...state,
          user: null,
          loggedIn: false,
        };
      default:
        return state;
    }
  };
  
  export default currentUser;
  