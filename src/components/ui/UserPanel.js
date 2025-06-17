import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../../context/UserContext';
import { useGame } from '../../context/GameContext';
import { updateTrainerName, updateUserProfile } from '../../lib/userData';
import { User, Package, Trophy, Gamepad2, X, LogOut, Loader2 } from 'lucide-react';
import countryCodes from '../../data/countryCodes';
// Función para formatear número de teléfono
const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber)
        return '';
    // Remover caracteres no numéricos
    const numbers = phoneNumber.replace(/\D/g, '');
    // Formatear según longitud (ejemplo para números chilenos)
    if (numbers.length === 8) {
        return `${numbers.slice(0, 1)} ${numbers.slice(1, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7)}`;
    }
    else if (numbers.length === 9) {
        return `${numbers.slice(0, 1)} ${numbers.slice(1, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7)}`;
    }
    else if (numbers.length >= 10) {
        return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8)}`;
    }
    // Si no coincide con un formato conocido, agregar espacios cada 4 dígitos
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
};
const UserPanel = ({ isOpen, onClose }) => {
    const { user, logout, syncUserProfile, updateUserInContext } = useUser();
    const { pokemonTeam } = useGame();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editingTrainer, setEditingTrainer] = useState(false);
    const [editingPhone, setEditingPhone] = useState(false);
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
            }
            catch (err) {
                console.error('Error saving phone number:', err);
                setError('Error al guardar el número de teléfono.');
            }
        }
        else {
            console.error('Missing user or profile:', { user: !!user, userProfile: !!userProfile });
        }
    };
    const handleCountryChange = async (code) => {
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
            }
            catch (err) {
                console.error('Error al actualizar el país:', err);
            }
        }
    };
    const handleUpdateTrainerName = async () => {
        if (!user?.uid || !userProfile)
            return;
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
        }
        catch (error) {
            console.error('Error updating trainer name:', error);
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
                            }, children: error })), successMessage && (_jsx("div", { style: {
                                padding: '8px 12px',
                                backgroundColor: '#dcfce7',
                                border: '1px solid #22c55e',
                                borderRadius: '6px',
                                color: '#15803d',
                                fontSize: '12px',
                                marginBottom: '16px',
                                textAlign: 'center'
                            }, children: successMessage })), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '20px'
                            }, children: [_jsxs("div", { style: {
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: '#f9fafb'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(User, { size: 20, style: { color: '#7c3aed' } }), _jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Informaci\u00F3n Personal" })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("div", { style: { marginBottom: '8px' }, children: _jsx("h4", { style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#374151' }, children: "Nombre de Entrenador" }) }), editingTrainer ? (_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("input", { type: "text", value: trainerNameInput, onChange: e => setTrainerNameInput(e.target.value), style: {
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
                                                            }, children: "Cancelar" })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("span", { style: { fontSize: '15px', color: '#1f2937', fontWeight: '500' }, children: userProfile?.trainerName || _jsx("span", { style: { color: '#9ca3af' }, children: "[Sin asignar]" }) }), _jsx("button", { onClick: () => {
                                                                console.log('Edit button clicked');
                                                                setEditingTrainer(true);
                                                            }, style: {
                                                                background: '#f3f4f6',
                                                                color: '#374151',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '6px',
                                                                padding: '4px 10px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }, children: "Editar" })] }))] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("div", { style: { marginBottom: '8px' }, children: _jsx("h4", { style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#374151' }, children: "N\u00FAmero de Tel\u00E9fono" }) }), editingPhone ? (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }, children: "Pa\u00EDs:" }), _jsx("select", { value: countryCode, onChange: (e) => handleCountryChange(e.target.value), style: {
                                                                        width: '100%',
                                                                        border: '1px solid #ccc',
                                                                        borderRadius: '4px',
                                                                        padding: '8px',
                                                                        fontSize: '14px'
                                                                    }, children: countryCodes.map((country) => (_jsxs("option", { value: country.code, children: [country.flag, " ", country.name] }, country.code))) })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("span", { style: {
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
                                                                    } })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: handlePhoneNumberSave, disabled: !phoneNumberInput.trim(), style: {
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
                                                                    }, children: "Guardar" }), _jsx("button", { onClick: () => {
                                                                        setPhoneNumberInput(userProfile?.phoneNumber || '');
                                                                        setCountryCode(userProfile?.countryCode || 'ES');
                                                                        setEditingPhone(false);
                                                                    }, style: {
                                                                        background: '#f3f4f6',
                                                                        color: '#374151',
                                                                        border: '1px solid #d1d5db',
                                                                        borderRadius: '6px',
                                                                        padding: '6px 14px',
                                                                        fontSize: '13px',
                                                                        fontWeight: '600',
                                                                        cursor: 'pointer'
                                                                    }, children: "Cancelar" })] })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("div", { style: { fontSize: '15px', color: '#1f2937', fontWeight: '500' }, children: userProfile?.phoneNumber ? (_jsxs("span", { children: [countryCodes.find(c => c.code === (userProfile?.countryCode || 'ES'))?.flag, " ", ' ', countryCodes.find(c => c.code === (userProfile?.countryCode || 'ES'))?.dialCode, " ", ' ', formatPhoneNumber(userProfile.phoneNumber)] })) : (_jsx("span", { style: { color: '#9ca3af' }, children: "[Sin asignar]" })) }), _jsx("button", { onClick: () => setEditingPhone(true), style: {
                                                                background: '#f3f4f6',
                                                                color: '#374151',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '6px',
                                                                padding: '4px 10px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }, children: "Editar" })] }))] })] }), _jsxs("div", { style: {
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
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }, children: [_jsx(Gamepad2, { size: 20, style: { color: '#059669' } }), _jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Estad\u00EDsticas Minigames" })] }), _jsxs("div", { style: { fontSize: '14px', color: '#6b7280' }, children: [_jsx("div", { style: { marginBottom: '16px' }, children: _jsxs("p", { style: { margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Email:" }), " ", user.email] }) }), _jsxs("div", { style: {
                                                        marginBottom: '16px',
                                                        padding: '12px',
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb'
                                                    }, children: [_jsx("div", { style: { marginBottom: '8px' }, children: _jsx("strong", { style: { color: '#374151' }, children: "Pok\u00E9balls" }) }), userProfile?.pokeballs && typeof userProfile.pokeballs === 'object' ? (_jsxs("div", { children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }, children: [_jsx("img", { src: "/src/img/pokeballs/pokeball.png", alt: "Pok\u00E9ball", style: { width: '20px', height: '20px', flexShrink: 0 } }), _jsxs("span", { style: { fontSize: '13px', whiteSpace: 'nowrap' }, children: ["Pok\u00E9ball: ", _jsx("strong", { children: userProfile.pokeballs.pokeball || 0 })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }, children: [_jsx("img", { src: "/src/img/pokeballs/superball.png", alt: "Superball", style: { width: '20px', height: '20px', flexShrink: 0 } }), _jsxs("span", { style: { fontSize: '13px', whiteSpace: 'nowrap' }, children: ["Superball: ", _jsx("strong", { children: userProfile.pokeballs.superball || 0 })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }, children: [_jsx("img", { src: "/src/img/pokeballs/ultraball.png", alt: "Ultraball", style: { width: '20px', height: '20px', flexShrink: 0 } }), _jsxs("span", { style: { fontSize: '13px', whiteSpace: 'nowrap' }, children: ["Ultraball: ", _jsx("strong", { children: userProfile.pokeballs.ultraball || 0 })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }, children: [_jsx("img", { src: "/src/img/pokeballs/masterball.png", alt: "Masterball", style: { width: '20px', height: '20px', flexShrink: 0 } }), _jsxs("span", { style: { fontSize: '13px', whiteSpace: 'nowrap' }, children: ["Masterball: ", _jsx("strong", { children: userProfile.pokeballs.masterball || 0 })] })] })] }), _jsx("div", { style: {
                                                                        paddingTop: '8px',
                                                                        borderTop: '1px solid #f3f4f6',
                                                                        fontSize: '13px',
                                                                        color: '#6b7280',
                                                                        textAlign: 'center'
                                                                    }, children: _jsxs("strong", { children: ["Total: ", (() => {
                                                                                const pokeballs = userProfile.pokeballs;
                                                                                return (pokeballs.pokeball || 0) + (pokeballs.superball || 0) + (pokeballs.ultraball || 0) + (pokeballs.masterball || 0);
                                                                            })()] }) })] })) : (_jsx("span", { style: { color: '#9ca3af' }, children: "No hay pok\u00E9balls" }))] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }, children: [_jsxs("div", { style: {
                                                                        padding: '16px',
                                                                        backgroundColor: '#ffffff',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e5e7eb',
                                                                        textAlign: 'center'
                                                                    }, children: [_jsx("div", { style: {
                                                                                fontSize: '13px',
                                                                                color: '#6b7280',
                                                                                marginBottom: '8px'
                                                                            }, children: "Fichas" }), _jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#374151' }, children: userProfile?.fichas || 0 })] }), _jsxs("div", { style: {
                                                                        padding: '16px',
                                                                        backgroundColor: '#ffffff',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e5e7eb',
                                                                        textAlign: 'center'
                                                                    }, children: [_jsx("div", { style: {
                                                                                fontSize: '13px',
                                                                                color: '#6b7280',
                                                                                marginBottom: '8px'
                                                                            }, children: "Incubadoras" }), _jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#374151' }, children: userProfile?.incubadoras?.length || 0 })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }, children: [_jsxs("div", { style: {
                                                                        padding: '16px',
                                                                        backgroundColor: '#ffffff',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e5e7eb',
                                                                        textAlign: 'center'
                                                                    }, children: [_jsx("div", { style: {
                                                                                fontSize: '13px',
                                                                                color: '#6b7280',
                                                                                marginBottom: '8px'
                                                                            }, children: "Pok\u00E9mon Eclosionados" }), _jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#059669' }, children: userProfile?.hatchedHistory?.length || 0 })] }), _jsxs("div", { style: {
                                                                        padding: '16px',
                                                                        backgroundColor: '#ffffff',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e5e7eb',
                                                                        textAlign: 'center'
                                                                    }, children: [_jsx("div", { style: {
                                                                                fontSize: '13px',
                                                                                color: '#6b7280',
                                                                                marginBottom: '8px'
                                                                            }, children: "Pok\u00E9mon Adivinados" }), _jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }, children: (() => {
                                                                                try {
                                                                                    return parseInt(localStorage.getItem('pokemon_guessed') || '0', 10);
                                                                                }
                                                                                catch {
                                                                                    return 0;
                                                                                }
                                                                            })() })] })] })] }), userProfile?.updatedAt && (_jsxs("div", { style: {
                                                        fontSize: '12px',
                                                        color: '#9ca3af',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #f3f4f6',
                                                        paddingTop: '12px'
                                                    }, children: [_jsx("strong", { children: "\u00DAltima actualizaci\u00F3n:" }), " ", new Date(userProfile.updatedAt.seconds * 1000).toLocaleDateString()] }))] })] })] })] }), _jsxs("div", { style: {
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
