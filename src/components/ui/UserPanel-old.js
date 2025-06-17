import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../../context/UserContext';
import { useGame } from '../../context/GameContext';
import { updateTrainerName, updateUserProfile } from '../../lib/userData';
import { User, Package, Trophy, Gamepad2, X, Loader2 } from 'lucide-react';
import countryCodes from '../../data/countryCodes';
const UserPanel = ({ isOpen, onClose }) => {
    const { user, logout, syncUserProfile, updateUserInContext } = useUser();
    const { pokemonTeam } = useGame();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingTrainer, setEditingTrainer] = useState(false);
    const [trainerNameInput, setTrainerNameInput] = useState('');
    const [phoneNumberInput, setPhoneNumberInput] = useState('');
    const [countryCode, setCountryCode] = useState('');
    // Usar el perfil del contexto directamente
    const userProfile = user?.profile;
    // Sincronizar perfil cuando se abre el panel
    useEffect(() => {
        if (isOpen && user?.uid) {
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
                    }
                    catch (err) {
                        setError('Error al guardar el número de teléfono.');
                    }
                }
            };
            const handleCountryChange = (code) => {
                setCountryCode(code);
                const selectedCountry = countryCodes.find(c => c.code === code);
                setPhoneNumberInput(''); // Clear the phone number input
                if (selectedCountry) {
                    setPhoneNumberInput(selectedCountry.placeholder || '');
                }
            };
            if (!isOpen || !user)
                return null;
            return createPortal(_jsx("div", { style: {
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
                }, onClick: onClose, children: _jsxs("div", { style: {
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
                    }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                color: 'white',
                                padding: '20px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("div", { style: {
                                                width: '48px',
                                                height: '48px',
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }, children: _jsx(User, { size: 24 }) }), _jsxs("div", { children: [_jsx("h2", { style: { margin: 0, fontSize: '20px', fontWeight: '700' }, children: "Mi Perfil" }), _jsx("p", { style: { margin: 0, fontSize: '14px', opacity: 0.9 }, children: user.email })] })] }), _jsx("button", { onClick: onClose, style: {
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { style: {
                                padding: '24px',
                                overflow: 'auto',
                                flex: 1
                            }, children: [loading && !userProfile ? (_jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        padding: '20px',
                                        color: '#6b7280',
                                        fontSize: '14px'
                                    }, children: [_jsx(Loader2, { size: 20, style: { animation: 'spin 1s linear infinite' } }), _jsx("span", { children: "Cargando datos adicionales..." })] })) : null, error && (_jsx("div", { style: {
                                        padding: '8px 12px',
                                        backgroundColor: '#fef3c7',
                                        border: '1px solid #f59e0b',
                                        borderRadius: '6px',
                                        color: '#92400e',
                                        fontSize: '12px',
                                        marginBottom: '16px',
                                        textAlign: 'center'
                                    }, children: error })), _jsxs("div", { style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        gap: '20px'
                                    }, children: [_jsxs("div", { style: {
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                backgroundColor: '#f9fafb'
                                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(Package, { size: 20, style: { color: '#7c3aed' } }), _jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Mis Pedidos" })] }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: userProfile?.pedidos && userProfile.pedidos.length > 0 ? (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Total de pedidos:" }), " ", userProfile.pedidos.length] }), _jsx("div", { style: { maxHeight: '150px', overflowY: 'auto', marginTop: '8px' }, children: userProfile.pedidos.slice(-3).map((pedido, index) => (_jsxs("div", { style: {
                                                                        padding: '8px',
                                                                        backgroundColor: 'white',
                                                                        borderRadius: '6px',
                                                                        marginBottom: '6px',
                                                                        fontSize: '13px'
                                                                    }, children: [_jsxs("strong", { children: ["Pedido #", index + 1, ":"] }), " ", pedido.equipo?.length || 0, " Pok\u00E9mon", pedido.fecha && (_jsx("div", { style: { color: '#9ca3af', fontSize: '12px' }, children: new Date(pedido.fecha.seconds * 1000).toLocaleDateString() }))] }, index))) })] })) : (_jsxs("div", { children: [_jsx("p", { children: "No tienes pedidos a\u00FAn." }), _jsx("p", { style: { fontSize: '12px', marginTop: '8px' }, children: "Crea un equipo y env\u00EDalo al laboratorio para hacer tu primer pedido." })] })) })] }), _jsxs("div", { style: {
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                backgroundColor: '#f9fafb'
                                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(Trophy, { size: 20, style: { color: '#ec4899' } }), _jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Equipo Actual" })] }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: pokemonTeam && Array.isArray(pokemonTeam) && pokemonTeam.length > 0 ? (() => {
                                                        // Calcular cantidades
                                                        const individualCount = pokemonTeam.filter(p => !('type' in p)).length;
                                                        const packCount = pokemonTeam.filter(p => 'type' in p && p.type === 'pack').length;
                                                        const homePackCount = pokemonTeam.filter(p => 'type' in p && p.type === 'homepack').length;
                                                        return (_jsxs(_Fragment, { children: [_jsxs("p", { style: { marginBottom: 12 }, children: ["Tienes ", _jsx("b", { children: individualCount }), " Pok\u00E9mon, ", _jsx("b", { children: packCount }), " pack", packCount !== 1 ? 's' : '', " y ", _jsx("b", { children: homePackCount }), " HOME pack", homePackCount !== 1 ? 's' : '', " en tu equipo."] }), _jsx("button", { style: {
                                                                        marginTop: '8px',
                                                                        padding: '6px 14px',
                                                                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        fontSize: '13px',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 600
                                                                    }, onClick: () => {
                                                                        if (typeof window !== 'undefined') {
                                                                            window.location.hash = '#/equipo';
                                                                        }
                                                                    }, children: "Ir a equipo para ver detalles" })] }));
                                                    })() : (_jsxs("div", { children: [_jsx("p", { children: "Tu equipo est\u00E1 vac\u00EDo." }), _jsx("p", { style: { fontSize: '12px', marginTop: '8px' }, children: "Ve al laboratorio para crear y personalizar tu equipo Pok\u00E9mon." })] })) })] }), _jsxs("div", { style: {
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                backgroundColor: '#f9fafb'
                                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(Gamepad2, { size: 20, style: { color: '#059669' } }), _jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Progreso en Juegos" })] }), _jsxs("div", { style: { fontSize: '14px', color: '#6b7280' }, children: [_jsxs("p", { children: [_jsx("strong", { children: "Incubadoras:" }), " ", userProfile?.incubadoras?.length || 0, " huevos"] }), _jsxs("p", { children: [_jsx("strong", { children: "Pok\u00E9balls:" }), " ", userProfile?.pokeballs || 0] }), _jsxs("p", { children: [_jsx("strong", { children: "Fichas:" }), " ", userProfile?.fichas || 0] }), _jsx("p", { style: { fontSize: '12px', marginTop: '8px', color: '#9ca3af' }, children: "Los datos de minijuegos se guardan autom\u00E1ticamente." })] })] }), _jsxs("div", { style: {
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                backgroundColor: '#f9fafb'
                                            }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }, children: "Estad\u00EDsticas" }), _jsxs("div", { style: { fontSize: '14px', color: '#6b7280' }, children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", user.email] }), _jsxs("p", { children: [_jsx("strong", { children: "Total de pedidos:" }), " ", userProfile?.pedidos?.length || 0] }), _jsxs("p", { children: [_jsx("strong", { children: "Pok\u00E9mon en equipo:" }), " ", pokemonTeam?.length || 0] }), userProfile?.updatedAt && (_jsxs("p", { children: [_jsx("strong", { children: "\u00DAltima actualizaci\u00F3n:" }), " ", new Date(userProfile.updatedAt.seconds * 1000).toLocaleDateString()] }))] }), _jsxs("div", { className: "user-panel-section", style: { marginTop: '16px' }, children: [_jsxs("div", { className: "user-panel-field", children: [_jsx("label", { htmlFor: "trainerName", children: "Nombre de Entrenador:" }), editingTrainer ? (_jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 6 }, children: [_jsx("input", { id: "trainerName", type: "text", value: trainerNameInput, onChange: e => setTrainerNameInput(e.target.value), className: "user-panel-input user-panel-standardized" }), _jsx("button", { style: {
                                                                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                                                                color: 'white',
                                                                                border: 'none',
                                                                                borderRadius: 6,
                                                                                padding: '6px 14px',
                                                                                fontSize: 13,
                                                                                fontWeight: 600,
                                                                                cursor: 'pointer'
                                                                            }, onClick: async () => {
                                                                                if (!user?.uid)
                                                                                    return;
                                                                                await updateTrainerName(user.uid, trainerNameInput.trim());
                                                                                // Actualizar el perfil en el contexto
                                                                                updateUserInContext({
                                                                                    profile: userProfile ? { ...userProfile, trainerName: trainerNameInput.trim() } : userProfile
                                                                                });
                                                                                setEditingTrainer(false);
                                                                            }, disabled: !trainerNameInput.trim(), children: "Guardar" }), _jsx("button", { style: {
                                                                                background: '#f3f4f6',
                                                                                color: '#374151',
                                                                                border: '1px solid #d1d5db',
                                                                                borderRadius: 6,
                                                                                padding: '6px 14px',
                                                                                fontSize: 13,
                                                                                fontWeight: 600,
                                                                                cursor: 'pointer'
                                                                            }, onClick: () => {
                                                                                setTrainerNameInput(userProfile?.trainerName || '');
                                                                                setEditingTrainer(false);
                                                                            }, children: "Cancelar" })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }, children: [_jsx("span", { style: { fontSize: 15, color: '#1f2937', fontWeight: 500 }, children: userProfile?.trainerName || _jsx("span", { style: { color: '#9ca3af' }, children: "[Sin asignar]" }) }), _jsx("button", { style: {
                                                                                background: '#f3f4f6',
                                                                                color: '#374151',
                                                                                border: '1px solid #d1d5db',
                                                                                borderRadius: 6,
                                                                                padding: '4px 10px',
                                                                                fontSize: 12,
                                                                                fontWeight: 600,
                                                                                cursor: 'pointer'
                                                                            }, onClick: () => setEditingTrainer(true), children: "Editar" })] }))] }), _jsxs("div", { className: "user-panel-field", children: [_jsx("label", { htmlFor: "countryCode", children: "Pa\u00EDs:" }), _jsx("select", { id: "countryCode", value: countryCode, onChange: (e) => handleCountryChange(e.target.value), className: "user-panel-input user-panel-standardized", children: countryCodes.map((country) => (_jsx("option", { value: country.code, children: country.name }, country.code))) })] }), _jsxs("div", { className: "user-panel-field", children: [_jsx("label", { htmlFor: "phoneNumber", children: "N\u00FAmero de Tel\u00E9fono:" }), _jsxs("div", { className: "user-panel-phone-wrapper", children: [_jsx("span", { className: "user-panel-phone-prefix", children: countryCode }), _jsx("input", { id: "phoneNumber", type: "text", value: phoneNumberInput, onChange: (e) => setPhoneNumberInput(e.target.value), placeholder: countryCodes.find(c => c.code === countryCode)?.placeholder || '', className: "user-panel-input user-panel-standardized" })] })] }), _jsx("button", { style: {
                                                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: 6,
                                                                padding: '6px 14px',
                                                                fontSize: 13,
                                                                fontWeight: 600,
                                                                cursor: 'pointer'
                                                            }, onClick: handlePhoneNumberSave, disabled: !phoneNumberInput.trim(), children: "Guardar" })] })] })] }), _jsxs("div", { style: {
                                        borderTop: '1px solid #e5e7eb',
                                        padding: '16px 24px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: '#f9fafb'
                                    }, children: [_jsx("button", { onClick: onClose, style: {
                                                padding: '8px 16px',
                                                backgroundColor: '#f3f4f6',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                cursor: 'pointer'
                                            }, children: "Cerrar" }), _jsx("button", { onClick: async () => {
                                                await logout();
                                                onClose();
                                            }, style: {
                                                padding: '8px 16px',
                                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }, children: "Cerrar Sesi\u00F3n" })] })] }), _jsx("style", { children: `
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
        ` })] }) }), document.body);
        }
        ;
        export default UserPanel;
    });
};
