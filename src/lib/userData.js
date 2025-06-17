import { db } from './firebase';
import { doc, setDoc, getDocFromServer, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
export async function saveUserProfile(profile) {
    // Filtrar valores undefined para evitar errores de Firestore
    const cleanProfile = Object.fromEntries(Object.entries(profile).filter(([_, value]) => value !== undefined));
    // Usar el email como ID del documento para fácil identificación
    const documentId = profile.email || profile.uid;
    await setDoc(doc(db, 'users', documentId), {
        ...cleanProfile,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}
export async function getUserProfile(uid, email) {
    // Intentar primero con email, luego con UID
    const documentId = email || uid;
    console.log('📖 getUserProfile: Leyendo perfil desde Firestore:', { documentId, email, uid });
    const ref = doc(db, 'users', documentId);
    // Forzar lectura desde el servidor para evitar problemas de cache
    const snap = await getDocFromServer(ref);
    if (snap.exists()) {
        const data = snap.data();
        console.log('✅ getUserProfile: Perfil encontrado:', {
            documentId,
            fichas: data.fichas,
            hasEquipo: !!data.equipo,
            hasPokeballs: !!data.pokeballs
        });
        return data;
    }
    // Si no existe con email, intentar con UID (para retrocompatibilidad)
    if (email) {
        console.log('🔄 getUserProfile: No encontrado con email, intentando con UID:', uid);
        const refUid = doc(db, 'users', uid);
        const snapUid = await getDocFromServer(refUid);
        if (snapUid.exists()) {
            // Migrar el documento del UID al email
            const data = snapUid.data();
            console.log('📦 getUserProfile: Perfil encontrado con UID, migrando:', {
                uid,
                fichas: data.fichas
            });
            await saveUserProfile(data);
            return data;
        }
    }
    console.log('❌ getUserProfile: No se encontró perfil para:', { documentId, email, uid });
    return null;
}
export async function updateUserEquipo(uid, email, equipo) {
    // Importar la función para convertir a Showdown
    const { teamToShowdownText } = await import('../components/ui/equipo');
    // Convertir el equipo a formato Showdown
    const showdownText = teamToShowdownText(equipo);
    // Usar email como ID del documento
    const documentId = email || uid;
    await updateDoc(doc(db, 'users', documentId), {
        equipo,
        equipoShowdown: showdownText, // Formato legible para Firestore
        updatedAt: serverTimestamp(),
    });
}
export async function addUserPedido(uid, email, pedido) {
    // Usar email como ID del documento
    const documentId = email || uid;
    await updateDoc(doc(db, 'users', documentId), {
        pedidos: arrayUnion({ ...pedido, fecha: serverTimestamp() }),
        updatedAt: serverTimestamp(),
    });
}
export async function updateTrainerName(uid, email, trainerName) {
    // Usar email como ID del documento
    const documentId = email || uid;
    await updateDoc(doc(db, 'users', documentId), {
        trainerName,
        updatedAt: serverTimestamp(),
    });
}
export async function updateUserProfile(profile) {
    const { uid, email, ...rest } = profile;
    // Filtrar valores undefined para evitar errores de Firestore
    const cleanProfile = Object.fromEntries(Object.entries(rest).filter(([_, value]) => value !== undefined));
    // Usar email como ID del documento
    const documentId = email || uid;
    await updateDoc(doc(db, 'users', documentId), {
        ...cleanProfile,
        updatedAt: serverTimestamp(),
    });
}
export async function updateUserPokeballs(uid, email, pokeballs) {
    // Usar email como ID del documento
    const documentId = email || uid;
    await updateDoc(doc(db, 'users', documentId), {
        pokeballs,
        updatedAt: serverTimestamp(),
    });
}
export async function updateUserIncubadoras(uid, email, incubadoras) {
    // Usar email como ID del documento
    const documentId = email || uid;
    await updateDoc(doc(db, 'users', documentId), {
        incubadoras,
        updatedAt: serverTimestamp(),
    });
}
export async function updateUserHatchedHistory(uid, email, hatchedHistory) {
    // Usar email como ID del documento
    const documentId = email || uid;
    await updateDoc(doc(db, 'users', documentId), {
        hatchedHistory,
        updatedAt: serverTimestamp(),
    });
}
export async function updateUserFichas(uid, email, fichas) {
    // Usar email como ID del documento
    const documentId = email || uid;
    console.log('💰 updateUserFichas: Guardando fichas en Firestore:', { documentId, fichas });
    await updateDoc(doc(db, 'users', documentId), {
        fichas,
        updatedAt: serverTimestamp(),
    });
    console.log('✅ updateUserFichas: Fichas guardadas exitosamente en Firestore');
}
