import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../../context/UserContext';
import { useGame } from '../../context/GameContext';
import { getUserProfile, UserProfile, updateTrainerName, updateUserProfile } from '../../lib/userData';
import { User, Package, Trophy, Gamepad2, X, Loader2 } from 'lucide-react';
import countryCodes from '../../data/countryCodes';

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ isOpen, onClose }) => {
  const { user, logout, syncUserProfile, updateUserInContext } = useUser();
  const { pokemonTeam } = useGame();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTrainer, setEditingTrainer] = useState(false);
  const [trainerNameInput, setTrainerNameInput] = useState<string>('');
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');

  // Usar el perfil del contexto directamente
  const userProfile = user?.profile;

  // Sincronizar perfil cuando se abre el panel
  useEffect(() => {
    if (isOpen && user?.uid) {
      setLoading(true);
      setError(null);
      setEditingTrainer(false);
      
      // Sincronizar datos desde Firebase
      syncUserProfile().finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, user?.uid, syncUserProfile]);

  // Inicializar campos cuando el perfil cambia
  useEffect(() => {
    if (userProfile) {
      setTrainerNameInput(userProfile.trainerName || '');
      setPhoneNumberInput(userProfile.phoneNumber || '');
      setCountryCode(userProfile.countryCode || 'ES');
    }
  }, [userProfile]);

  const handlePhoneNumberSave = async () => {
    if (user && userProfile) {
      try {
        const updatedProfile = {
          ...userProfile,
          phoneNumber: phoneNumberInput,
          countryCode,
        };
        await updateUserProfile(updatedProfile);
        
        // Actualizar el perfil en el contexto
        updateUserInContext({ 
          profile: updatedProfile 
        });
        
        setError(null);
      } catch (err) {
        setError('Error al guardar el número de teléfono.');
      }
    }
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const selectedCountry = countryCodes.find(c => c.code === code);
    setPhoneNumberInput(''); // Clear the phone number input
    if (selectedCountry) {
      setPhoneNumberInput(selectedCountry.placeholder || '');
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
              <span>Cargando datos adicionales...</span>
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
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
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
                          <strong>Pedido #{index + 1}:</strong> {pedido.equipo?.length || 0} Pokémon
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
                {pokemonTeam && Array.isArray(pokemonTeam) && pokemonTeam.length > 0 ? (() => {
                  // Calcular cantidades
                  const individualCount = pokemonTeam.filter(p => !('type' in p)).length;
                  const packCount = pokemonTeam.filter(p => 'type' in p && p.type === 'pack').length;
                  const homePackCount = pokemonTeam.filter(p => 'type' in p && p.type === 'homepack').length;
                  return (
                    <>
                      <p style={{ marginBottom: 12 }}>
                        Tienes <b>{individualCount}</b> Pokémon, <b>{packCount}</b> pack{packCount !== 1 ? 's' : ''} y <b>{homePackCount}</b> HOME pack{homePackCount !== 1 ? 's' : ''} en tu equipo.
                      </p>
                      <button
                        style={{
                          marginTop: '8px',
                          padding: '6px 14px',
                          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.location.hash = '#/equipo';
                          }
                        }}
                      >
                        Ir a equipo para ver detalles
                      </button>
                    </>
                  );
                })() : (
                  <div>
                    <p>Tu equipo está vacío.</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      Ve al laboratorio para crear y personalizar tu equipo Pokémon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mini Juegos */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Gamepad2 size={20} style={{ color: '#059669' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Progreso en Juegos</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <p><strong>Incubadoras:</strong> {userProfile?.incubadoras?.length || 0} huevos</p>
                <p><strong>Pokéballs:</strong> {userProfile?.pokeballs || 0}</p>
                <p><strong>Fichas:</strong> {userProfile?.fichas || 0}</p>
                <p style={{ fontSize: '12px', marginTop: '8px', color: '#9ca3af' }}>
                  Los datos de minijuegos se guardan automáticamente.
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Estadísticas</h3>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Total de pedidos:</strong> {userProfile?.pedidos?.length || 0}</p>
                <p><strong>Pokémon en equipo:</strong> {pokemonTeam?.length || 0}</p>
                {userProfile?.updatedAt && (
                  <p><strong>Última actualización:</strong> {new Date(userProfile.updatedAt.seconds * 1000).toLocaleDateString()}</p>
                )}
              </div>

              {/* Nombre de entrenador y teléfono */}
              <div className="user-panel-section" style={{ marginTop: '16px' }}>
                <div className="user-panel-field">
                  <label htmlFor="trainerName">Nombre de Entrenador:</label>
                  {editingTrainer ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <input
                        id="trainerName"
                        type="text"
                        value={trainerNameInput}
                        onChange={e => setTrainerNameInput(e.target.value)}
                        className="user-panel-input user-panel-standardized"
                      />
                      <button
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 14px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={async () => {
                          if (!user?.uid) return;
                          await updateTrainerName(user.uid, user.email || '', trainerNameInput.trim());
                          
                          // Actualizar el perfil en el contexto
                          updateUserInContext({ 
                            profile: userProfile ? { ...userProfile, trainerName: trainerNameInput.trim() } : userProfile
                          });
                          
                          setEditingTrainer(false);
                        }}
                        disabled={!trainerNameInput.trim()}
                      >
                        Guardar
                      </button>
                      <button
                        style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          padding: '6px 14px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setTrainerNameInput(userProfile?.trainerName || '');
                          setEditingTrainer(false);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      <span style={{ fontSize: 15, color: '#1f2937', fontWeight: 500 }}>
                        {userProfile?.trainerName || <span style={{ color: '#9ca3af' }}>[Sin asignar]</span>}
                      </span>
                      <button
                        style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => setEditingTrainer(true)}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                <div className="user-panel-field">
                  <label htmlFor="countryCode">País:</label>
                  <select
                    id="countryCode"
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="user-panel-input user-panel-standardized"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="user-panel-field">
                  <label htmlFor="phoneNumber">Número de Teléfono:</label>
                  <div className="user-panel-phone-wrapper">
                    <span className="user-panel-phone-prefix">{countryCode}</span>
                    <input
                      id="phoneNumber"
                      type="text"
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      placeholder={countryCodes.find(c => c.code === countryCode)?.placeholder || ''}
                      className="user-panel-input user-panel-standardized"
                    />
                  </div>
                </div>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={handlePhoneNumberSave}
                  disabled={!phoneNumberInput.trim()}
                >
                  Guardar
                </button>
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
              Cerrar Sesión
            </button>
          </div>
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

          /* Add standardized styling for the trainer name and phone number fields */
          .user-panel-standardized {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            font-size: 14px;
            width: 100%;
          }

          .user-panel-phone-wrapper {
            display: flex;
            align-items: center;
          }

          .user-panel-phone-prefix {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px 0 0 4px;
            padding: 8px;
            font-size: 14px;
            white-space: nowrap;
          }

          .user-panel-section {
            margin-top: 16px;
          }

          .user-panel-field {
            margin-bottom: 16px;
          }

          .user-panel-save-button {
            background: linear-gradient(135deg, #7c3aed, #ec4899);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          }

          .user-panel-save-button:disabled {
            background: #e5e7eb;
            color: #6b7280;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default UserPanel;
