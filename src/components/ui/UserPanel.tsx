import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../../context/UserContext';
import { useGame } from '../../context/GameContext';
import { updateTrainerName, updateUserProfile } from '../../lib/userData';
import { User, Package, Trophy, Gamepad2, X, LogOut, Loader2 } from 'lucide-react';
import countryCodes from '../../data/countryCodes';

// Función para formatear número de teléfono
const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remover caracteres no numéricos
  const numbers = phoneNumber.replace(/\D/g, '');
  
  // Formatear según longitud (ejemplo para números chilenos)
  if (numbers.length === 8) {
    return `${numbers.slice(0, 1)} ${numbers.slice(1, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7)}`;
  } else if (numbers.length === 9) {
    return `${numbers.slice(0, 1)} ${numbers.slice(1, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7)}`;
  } else if (numbers.length >= 10) {
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8)}`;
  }
  
  // Si no coincide con un formato conocido, agregar espacios cada 4 dígitos
  return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
};

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ isOpen, onClose }) => {
  const { user, logout, syncUserProfile, updateUserInContext } = useUser();
  const { pokemonTeam } = useGame();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingTrainer, setEditingTrainer] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [trainerNameInput, setTrainerNameInput] = useState<string>('');
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('ES');

  // Usar el perfil del contexto directamente
  const userProfile = user?.profile;

  // Sincronizar perfil cuando se abre el panel
  useEffect(() => {
    if (isOpen && user?.uid) {
      setLoading(true);
      setError(null);
      
      // Sincronizar datos desde Firebase
      syncUserProfile().finally(() => {
        setLoading(false);
      });
    }
    
    // Resetear estados de edición cuando se cierra el panel
    if (!isOpen) {
      setEditingTrainer(false);
      setEditingPhone(false);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, user?.uid]); // Removemos syncUserProfile de las dependencias

  // Inicializar campos solo la primera vez que se abre el panel
  useEffect(() => {
    if (isOpen && userProfile && !editingTrainer && !editingPhone) {
      console.log('Initializing fields with profile:', userProfile);
      setTrainerNameInput(userProfile.trainerName || '');
      setPhoneNumberInput(userProfile.phoneNumber || '');
      setCountryCode(userProfile.countryCode || 'ES');
    }
  }, [isOpen]); // Solo cuando se abre/cierra el panel

  const handlePhoneNumberSave = async () => {
    console.log('Saving phone number:', phoneNumberInput, 'with country:', countryCode);
    console.log('User:', user?.uid, 'Profile:', userProfile);
    
    if (user && userProfile) {
      try {
        setError(null);
        setSuccessMessage(null);
        
        const updatedProfile = {
          ...userProfile,
          phoneNumber: phoneNumberInput,
          countryCode,
        };
        
        console.log('Updating profile with:', updatedProfile);
        await updateUserProfile(updatedProfile);
        
        // Actualizar el perfil en el contexto
        updateUserInContext({ 
          profile: updatedProfile 
        });
        
        setEditingPhone(false); // Desactivar estado de edición
        setSuccessMessage('Teléfono guardado exitosamente');
        console.log('Phone number saved successfully');
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error('Error saving phone number:', err);
        setError('Error al guardar el número de teléfono.');
      }
    } else {
      console.error('Missing user or profile:', { user: !!user, userProfile: !!userProfile });
    }
  };

  const handleCountryChange = async (code: string) => {
    console.log('Changing country to:', code);
    setCountryCode(code);
    setPhoneNumberInput(''); // Limpiar el número cuando cambia el país
    setEditingPhone(true); // Activar modo edición ya que se cambió algo
    
    // Solo actualizar en Firebase si realmente cambió
    if (user && userProfile && userProfile.countryCode !== code) {
      try {
        const updatedProfile = {
          ...userProfile,
          countryCode: code,
        };
        console.log('Updating country in Firebase:', updatedProfile);
        await updateUserProfile(updatedProfile);
        
        // Actualizar el perfil en el contexto
        updateUserInContext({ 
          profile: updatedProfile 
        });
        console.log('Country updated successfully');
      } catch (err) {
        console.error('Error al actualizar el país:', err);
      }
    }
  };

  const handleUpdateTrainerName = async () => {
    if (!user?.uid || !userProfile) return;
    
    try {
      setError(null);
      const trimmedName = trainerNameInput.trim();
      
      console.log('Updating trainer name:', trimmedName);
      
      // Actualizar en Firebase
      await updateTrainerName(user.uid, user.email || '', trimmedName);
      
      // Crear perfil actualizado
      const updatedProfile = { 
        ...userProfile, 
        trainerName: trimmedName 
      };
      
      console.log('Updated profile:', updatedProfile);
      
      // Actualizar el perfil en el contexto
      updateUserInContext({ 
        profile: updatedProfile
      });
      
      setEditingTrainer(false);
      console.log('Trainer name updated successfully');
    } catch (error) {
      console.error('Error updating trainer name:', error);
      setError('Error al actualizar el nombre del entrenador');
    }
  };

  if (!isOpen || !user) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          zIndex: 1000000,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          padding: '0',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                Mi Perfil
              </h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '24px',
          overflow: 'auto',
          flex: 1
        }}>
          {loading && !userProfile ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Cargando datos...</span>
            </div>
          ) : null}
          
          {error && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              color: '#92400e',
              fontSize: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          {successMessage && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#dcfce7',
              border: '1px solid #22c55e',
              borderRadius: '6px',
              color: '#15803d',
              fontSize: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {successMessage}
            </div>
          )}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Información Personal */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <User size={20} style={{ color: '#7c3aed' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Información Personal</h3>
              </div>
              
              {/* Nombre de entrenador */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#374151' }}>Nombre de Entrenador</h4>
                </div>
                {editingTrainer ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={trainerNameInput}
                      onChange={e => setTrainerNameInput(e.target.value)}
                      style={{
                        flex: 1,
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={handleUpdateTrainerName}
                      disabled={!trainerNameInput.trim()}
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setTrainerNameInput(userProfile?.trainerName || '');
                        setEditingTrainer(false);
                      }}
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', color: '#1f2937', fontWeight: '500' }}>
                      {userProfile?.trainerName || <span style={{ color: '#9ca3af' }}>[Sin asignar]</span>}
                    </span>
                    <button
                      onClick={() => {
                        console.log('Edit button clicked');
                        setEditingTrainer(true);
                      }}
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>

              {/* Número de teléfono */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#374151' }}>Número de Teléfono</h4>
                </div>
                {editingPhone ? (
                  <div>
                    {/* Selector de país */}
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                        País:
                      </label>
                      <select
                        value={countryCode}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        style={{
                          width: '100%',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px',
                          fontSize: '14px'
                        }}
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Input del teléfono */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: '#f0f0f0',
                        border: '1px solid #ccc',
                        borderRadius: '4px 0 0 4px',
                        padding: '8px',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}>
                        {countryCodes.find(c => c.code === countryCode)?.dialCode}
                      </span>
                      <input
                        type="text"
                        value={phoneNumberInput}
                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                        placeholder={countryCodes.find(c => c.code === countryCode)?.placeholder || ''}
                        style={{
                          flex: 1,
                          border: '1px solid #ccc',
                          borderLeft: 'none',
                          borderRadius: '0 4px 4px 0',
                          padding: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    {/* Botones */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handlePhoneNumberSave}
                        disabled={!phoneNumberInput.trim()}
                        style={{
                          background: !phoneNumberInput.trim() 
                            ? '#d1d5db' 
                            : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: !phoneNumberInput.trim() ? 'not-allowed' : 'pointer',
                          opacity: !phoneNumberInput.trim() ? 0.6 : 1
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setPhoneNumberInput(userProfile?.phoneNumber || '');
                          setCountryCode(userProfile?.countryCode || 'ES');
                          setEditingPhone(false);
                        }}
                        style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '15px', color: '#1f2937', fontWeight: '500' }}>
                      {userProfile?.phoneNumber ? (
                        <span>
                          {countryCodes.find(c => c.code === (userProfile?.countryCode || 'ES'))?.flag} {' '}
                          {countryCodes.find(c => c.code === (userProfile?.countryCode || 'ES'))?.dialCode} {' '}
                          {formatPhoneNumber(userProfile.phoneNumber)}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>[Sin asignar]</span>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingPhone(true)}
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Equipo Actual */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Trophy size={20} style={{ color: '#ec4899' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Equipo Actual</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {pokemonTeam && Array.isArray(pokemonTeam) && pokemonTeam.length > 0 ? (
                  <div>
                    <p style={{ marginBottom: '12px' }}>
                      Tienes <strong>{pokemonTeam.length}</strong> elemento(s) en tu equipo.
                    </p>
                    <button
                      onClick={() => window.location.hash = '#/equipo'}
                      style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Ver Equipo
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>Tu equipo está vacío.</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      Ve al laboratorio para crear y personalizar tu equipo Pokémon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pedidos */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Package size={20} style={{ color: '#7c3aed' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Mis Pedidos</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {userProfile?.pedidos && userProfile.pedidos.length > 0 ? (
                  <div>
                    <p><strong>Total de pedidos:</strong> {userProfile.pedidos.length}</p>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '8px' }}>
                      {userProfile.pedidos.slice(-3).map((pedido, index) => (
                        <div key={index} style={{
                          padding: '8px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          marginBottom: '6px',
                          fontSize: '13px'
                        }}>
                          <strong>Pedido #{index + 1}:</strong> {pedido.equipo?.length || 0} elementos
                          {pedido.fecha && (
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                              {new Date(pedido.fecha.seconds * 1000).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>No tienes pedidos aún.</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      Crea un equipo y envíalo al laboratorio para hacer tu primer pedido.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats del usuario */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Gamepad2 size={20} style={{ color: '#059669' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Estadísticas Minigames</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> {user.email}</p>
                </div>
                
                {/* Pokéballs desglosadas por tipo */}
                <div style={{ 
                  marginBottom: '16px', 
                  padding: '12px', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#374151' }}>Pokéballs</strong>
                  </div>
                  {userProfile?.pokeballs && typeof userProfile.pokeballs === 'object' ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                          <img 
                            src="/src/img/pokeballs/pokeball.png" 
                            alt="Pokéball" 
                            style={{ width: '20px', height: '20px', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                            Pokéball: <strong>{userProfile.pokeballs.pokeball || 0}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                          <img 
                            src="/src/img/pokeballs/superball.png" 
                            alt="Superball" 
                            style={{ width: '20px', height: '20px', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                            Superball: <strong>{userProfile.pokeballs.superball || 0}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                          <img 
                            src="/src/img/pokeballs/ultraball.png" 
                            alt="Ultraball" 
                            style={{ width: '20px', height: '20px', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                            Ultraball: <strong>{userProfile.pokeballs.ultraball || 0}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                          <img 
                            src="/src/img/pokeballs/masterball.png" 
                            alt="Masterball" 
                            style={{ width: '20px', height: '20px', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                            Masterball: <strong>{userProfile.pokeballs.masterball || 0}</strong>
                          </span>
                        </div>
                      </div>
                      <div style={{ 
                        paddingTop: '8px', 
                        borderTop: '1px solid #f3f4f6',
                        fontSize: '13px', 
                        color: '#6b7280',
                        textAlign: 'center'
                      }}>
                        <strong>Total: {(() => {
                          const pokeballs = userProfile.pokeballs;
                          return (pokeballs.pokeball || 0) + (pokeballs.superball || 0) + (pokeballs.ultraball || 0) + (pokeballs.masterball || 0);
                        })()}</strong>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>No hay pokéballs</span>
                  )}
                </div>
                
                {/* Otras estadísticas */}
                <div style={{ marginBottom: '16px' }}>
                  {/* Primera fila: Fichas e Incubadoras */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#6b7280', 
                        marginBottom: '8px'
                      }}>
                        Fichas
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>
                        {userProfile?.fichas || 0}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#6b7280', 
                        marginBottom: '8px'
                      }}>
                        Incubadoras
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>
                        {userProfile?.incubadoras?.length || 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Segunda fila: Eclosionados y Adivinados */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#6b7280', 
                        marginBottom: '8px'
                      }}>
                        Pokémon Eclosionados
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                        {userProfile?.hatchedHistory?.length || 0}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#6b7280', 
                        marginBottom: '8px'
                      }}>
                        Pokémon Adivinados
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                        {(() => {
                          try {
                            return parseInt(localStorage.getItem('pokemon_guessed') || '0', 10);
                          } catch {
                            return 0;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {userProfile?.updatedAt && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#9ca3af', 
                    textAlign: 'center',
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: '12px'
                  }}>
                    <strong>Última actualización:</strong> {new Date(userProfile.updatedAt.seconds * 1000).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
        
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default UserPanel;
