import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../../context/UserContext';
import { useGame } from '../../context/GameContext';
import { updateTrainerName, updateUserProfile } from '../../lib/userData';
import { User, Package, Trophy, Gamepad2, X, LogOut, Loader2 } from 'lucide-react';
import countryCodes from '../../data/countryCodes';
const UserPanel = ({ isOpen, onClose }) => {
    const { user, logout, syncUserProfile, updateUserInContext } = useUser();
    const { pokemonTeam } = useGame();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingTrainer, setEditingTrainer] = useState(false);
    const [trainerNameInput, setTrainerNameInput] = useState('');
    const [phoneNumberInput, setPhoneNumberInput] = useState('');
    const [countryCode, setCountryCode] = useState('ES');
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
            }
            catch (err) {
                setError('Error al guardar el número de teléfono.');
            }
        }
    };
    const handleCountryChange = (code) => {
        setCountryCode(code);
        const selectedCountry = countryCodes.find(c => c.code === code);
        setPhoneNumberInput('');
        if (selectedCountry) {
            setPhoneNumberInput(selectedCountry.placeholder || '');
        }
    };
    const handleUpdateTrainerName = async () => {
        if (!user?.uid)
            return;
        try {
            await updateTrainerName(user.uid, trainerNameInput.trim());
            // Actualizar el perfil en el contexto
            updateUserInContext({
                profile: userProfile ? { ...userProfile, trainerName: trainerNameInput.trim() } : userProfile
            });
            setEditingTrainer(false);
        }
        catch (error) {
            setError('Error al actualizar el nombre del entrenador');
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
                            }, children: [_jsx(Loader2, { size: 20, style: { animation: 'spin 1s linear infinite' } }), _jsx("span", { children: "Cargando datos..." })] })) : null, error && (_jsx("div", { style: {
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
                                    }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }, children: "Informaci\u00F3n Personal" }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }, children: "Nombre de Entrenador:" }), editingTrainer ? (_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("input", { type: "text", value: trainerNameInput, onChange: e => setTrainerNameInput(e.target.value), style: {
                                                                flex: 1,
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px',
                                                                padding: '8px',
                                                                fontSize: '14px'
                                                            } }), _jsx("button", { onClick: handleUpdateTrainerName, disabled: !trainerNameInput.trim(), style: {
                                                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                padding: '6px 14px',
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }, children: "Guardar" }), _jsx("button", { onClick: () => {
                                                                setTrainerNameInput(userProfile?.trainerName || '');
                                                                setEditingTrainer(false);
                                                            }, style: {
                                                                background: '#f3f4f6',
                                                                color: '#374151',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '6px',
                                                                padding: '6px 14px',
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }, children: "Cancelar" })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("span", { style: { fontSize: '15px', color: '#1f2937', fontWeight: '500' }, children: userProfile?.trainerName || _jsx("span", { style: { color: '#9ca3af' }, children: "[Sin asignar]" }) }), _jsx("button", { onClick: () => setEditingTrainer(true), style: {
                                                                background: '#f3f4f6',
                                                                color: '#374151',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '6px',
                                                                padding: '4px 10px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }, children: "Editar" })] }))] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }, children: "Pa\u00EDs:" }), _jsx("select", { value: countryCode, onChange: (e) => handleCountryChange(e.target.value), style: {
                                                        width: '100%',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        fontSize: '14px'
                                                    }, children: countryCodes.map((country) => (_jsxs("option", { value: country.code, children: [country.flag, " ", country.name] }, country.code))) })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }, children: "N\u00FAmero de Tel\u00E9fono:" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx("span", { style: {
                                                                background: '#f0f0f0',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px 0 0 4px',
                                                                padding: '8px',
                                                                fontSize: '14px',
                                                                whiteSpace: 'nowrap'
                                                            }, children: countryCodes.find(c => c.code === countryCode)?.dialCode }), _jsx("input", { type: "text", value: phoneNumberInput, onChange: (e) => setPhoneNumberInput(e.target.value), placeholder: countryCodes.find(c => c.code === countryCode)?.placeholder || '', style: {
                                                                flex: 1,
                                                                border: '1px solid #ccc',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 4px 4px 0',
                                                                padding: '8px',
                                                                fontSize: '14px'
                                                            } })] }), _jsx("button", { onClick: handlePhoneNumberSave, disabled: !phoneNumberInput.trim(), style: {
                                                        marginTop: '8px',
                                                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '6px 14px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }, children: "Guardar Tel\u00E9fono" })] })] }), _jsxs("div", { style: {
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: '#f9fafb'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(Trophy, { size: 20, style: { color: '#ec4899' } }), _jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Equipo Actual" })] }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: pokemonTeam && Array.isArray(pokemonTeam) && pokemonTeam.length > 0 ? (_jsxs("div", { children: [_jsxs("p", { style: { marginBottom: '12px' }, children: ["Tienes ", _jsx("strong", { children: pokemonTeam.length }), " elemento(s) en tu equipo."] }), _jsx("button", { onClick: () => window.location.hash = '#/equipo', style: {
                                                            padding: '6px 14px',
                                                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontSize: '13px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }, children: "Ver Equipo" })] })) : (_jsxs("div", { children: [_jsx("p", { children: "Tu equipo est\u00E1 vac\u00EDo." }), _jsx("p", { style: { fontSize: '12px', marginTop: '8px' }, children: "Ve al laboratorio para crear y personalizar tu equipo Pok\u00E9mon." })] })) })] }), _jsxs("div", { style: {
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
                                                            }, children: [_jsxs("strong", { children: ["Pedido #", index + 1, ":"] }), " ", pedido.equipo?.length || 0, " elementos", pedido.fecha && (_jsx("div", { style: { color: '#9ca3af', fontSize: '12px' }, children: new Date(pedido.fecha.seconds * 1000).toLocaleDateString() }))] }, index))) })] })) : (_jsxs("div", { children: [_jsx("p", { children: "No tienes pedidos a\u00FAn." }), _jsx("p", { style: { fontSize: '12px', marginTop: '8px' }, children: "Crea un equipo y env\u00EDalo al laboratorio para hacer tu primer pedido." })] })) })] }), _jsxs("div", { style: {
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: '#f9fafb'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(Gamepad2, { size: 20, style: { color: '#059669' } }), _jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Estad\u00EDsticas" })] }), _jsxs("div", { style: { fontSize: '14px', color: '#6b7280' }, children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", user.email] }), _jsxs("p", { children: [_jsx("strong", { children: "Pok\u00E9balls:" }), " ", userProfile?.pokeballs || 0] }), _jsxs("p", { children: [_jsx("strong", { children: "Fichas:" }), " ", userProfile?.fichas || 0] }), _jsxs("p", { children: [_jsx("strong", { children: "Incubadoras:" }), " ", userProfile?.incubadoras?.length || 0] }), userProfile?.updatedAt && (_jsxs("p", { children: [_jsx("strong", { children: "\u00DAltima actualizaci\u00F3n:" }), " ", new Date(userProfile.updatedAt.seconds * 1000).toLocaleDateString()] }))] })] })] })] }), _jsxs("div", { style: {
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
                            }, children: "Cerrar" }), _jsxs("button", { onClick: async () => {
                                await logout();
                                onClose();
                            }, style: {
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
                            }, children: [_jsx(LogOut, { size: 16 }), "Cerrar Sesi\u00F3n"] })] }), _jsx("style", { children: `
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
        ` })] }) }), document.body);
};
export default UserPanel;
