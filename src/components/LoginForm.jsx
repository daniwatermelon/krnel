import './LoginForm.css'; // Crea este archivo para tus estilos

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Maneja el inicio de sesión exitoso
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Nombre de usuario</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
        <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
      </div>
      <div className="register-section">
        <p>¿Todavía no tienes cuenta? <a href="/register">¡Regístrate!</a></p>
      </div>
    </div>
  );
};

export default LoginForm;