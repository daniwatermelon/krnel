const sendPasswordResetEmail = async (email) => {
  const response = await fetch('https://localhost:5000/api/request-reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  if (response.status !== 200) {
    throw new Error(data.message || 'Error al enviar el correo');
  }

  return data.message;
};

export default sendPasswordResetEmail;
