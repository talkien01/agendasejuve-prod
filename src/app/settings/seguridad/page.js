'use client';

export default function SecuritySettingsPage() {
  return (
    <div className="settings-section">
      <h2>Seguridad de la Cuenta</h2>
      <div className="security-form-container">
        <form className="password-form" onSubmit={async (e) => {
          e.preventDefault();
          const currentPassword = e.target.currentPassword.value;
          const newPassword = e.target.newPassword.value;
          const confirmPassword = e.target.confirmPassword.value;

          if (newPassword !== confirmPassword) {
            alert('Las contraseñas nuevas no coinciden');
            return;
          }

          try {
            const res = await fetch('/api/user/change-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
              alert('Contraseña actualizada correctamente');
              e.target.reset();
            } else {
              alert(data.error || 'Error al actualizar contraseña');
            }
          } catch (err) {
            alert('Error de conexión');
          }
        }}>
          <div className="form-group">
            <label>Contraseña Actual</label>
            <input type="password" name="currentPassword" required />
          </div>
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input type="password" name="newPassword" required />
          </div>
          <div className="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input type="password" name="confirmPassword" required />
          </div>
          <button type="submit" className="btn-primary">Actualizar Contraseña</button>
        </form>
      </div>
    </div>
  );
}
