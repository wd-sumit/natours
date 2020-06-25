/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
      const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if(res.data.success) {
      showAlert('success', 'You are successfuly logged In');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
}

export const logout = async () => {
  try{
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    
    if(res.data.success) location.reload(true);
  } catch(err) {
      showAlert('error', 'Error Logging Out! Try Again.')
  }
}