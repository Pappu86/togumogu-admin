import Swal from 'sweetalert2';

export const successMessage = (text) => {
  return Swal.fire({
    title: 'Success!',
    text,
    icon: 'success',
  });
};

export const errorMessage = (text) => {
  return Swal.fire({
    title: 'Error!',
    text,
    icon: 'error',
  });
};

export const confirmationAlert = (text, confirmButtonText, options) => {
  let config = {
    title: 'Are you sure?',
    text: text || "You won't be able to revert this!",
    icon: 'warning',
    confirmButtonText: confirmButtonText || 'Yes, delete it!',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  };

  if (options && options.isInput) {
    config = { ...config, input: options.inputType || 'text' };
  }

  return Swal.fire(config);
};

export const toast = (title) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: 'success',
    title: title || 'Success!',
    background: '#2e7d32',
    padding: '10px 15px',
    iconColor: '#ffffff',
  });
};
