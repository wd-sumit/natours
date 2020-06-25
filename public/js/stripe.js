/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert'

const stripe = Stripe('pk_test_51GxJNpBTuxm47TYAKadvPK6d4TdXLbSDvdImWIXoPZwVnIAUFALV1hm47TG6goZZpnBvOEMM6flBWNGHFiDUiGNU00Q8eMlxxo');

export const bookTour = async tourId => {
  try {
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
}