const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let loading;

// Loads Razorpay's payment popup script once, on the first Pay click
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      loading = undefined;
      script.remove();
      reject(new Error('Could not load the payment window. Check your connection and try again.'));
    };
    document.body.appendChild(script);
  });

  return loading;
}
