import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Ruta para manejar la solicitud de restablecimiento de contraseña
app.post('/api/request-reset-password', async (req, res) => {
  const { email } = req.body;
  const code = generateCode();

  // Configura el transporte de nodemailer
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'krnelapp@gmail.com',
      pass: 'Panchodatecuenta22.',
    },
  });

  // Configura el correo electrónico
  let mailOptions = {
    from: 'krnelapp@gmail.com',
    to: email,
    subject: 'Restablecimiento de contraseña',
    text: `El código para recuperar tu contraseña es ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Correo electrónico enviado' });
  } catch (error) {
    res.status(500).send({ message: 'Error al enviar el correo electrónico', error });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
