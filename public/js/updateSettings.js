/* eslint-disable */
// Update Data

import axios from 'axios';
import { showAlert } from './alert.js';

export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updatePassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe'
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if(res.data.success) {
      showAlert('success', 'Account has been update');
    }
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
}