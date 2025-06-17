import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendSignInLinkToEmail, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { saveUserProfile, getUserProfile, updateUserFichas, UserProfile } from '../lib/userData'

type User = {
  uid: string
  username: string
  email?: string
  photoURL?: string
  profile?: UserProfile | null
  // Add other user properties as needed
}

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  syncUserProfile: () => Promise<void>
  updateUserInContext: (updates: Partial<User>) => void
  syncTeamWithFirebase: (team: any[]) => Promise<void>
  refreshUserProfile: () => Promise<void>
  triggerPokeballsUpdate: (pokeballs: any) => void
  triggerFichasUpdate: (fichas: number) => void
  triggerIncubadorasUpdate: (incubadoras: any[]) => void
  forceSyncComponents: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para sincronizar el perfil del usuario desde Firebase
  const syncUserProfile = async () => {
    if (!user?.uid) return
    
    try {
      const profile = await getUserProfile(user.uid, user.email)
      setUserState(prev => prev ? { ...prev, profile } : prev)
      
      console.log('✅ Perfil sincronizado desde Firestore:', profile)
    } catch (error) {
      console.error('Error syncing user profile:', error)
    }
  }

  // Función para actualizar el usuario en el contexto
  const updateUserInContext = (updates: Partial<User>) => {
    setUserState(prev => prev ? { ...prev, ...updates } : prev)
  }

  // Función para crear/actualizar perfil en Firebase
  const createOrUpdateFirebaseProfile = async (firebaseUser: FirebaseUser) => {
    try {
      // Primero verificar si ya existe un perfil
      const existingProfile = await getUserProfile(firebaseUser.uid, firebaseUser.email || undefined)
      
      if (existingProfile) {
        // Si ya existe, solo actualizar campos básicos sin sobrescribir datos importantes
        const updateData: Partial<UserProfile> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
        }
        
        // Solo agregar campos opcionales si tienen valor
        if (firebaseUser.displayName) {
          updateData.displayName = firebaseUser.displayName
        }
        if (firebaseUser.phoneNumber) {
          updateData.phoneNumber = firebaseUser.phoneNumber
        }
        
        // Actualizar solo los campos básicos sin tocar fichas, pokeballs, equipo, etc.
        await saveUserProfile({ ...existingProfile, ...updateData })
        
        return existingProfile
      }
      
      // Si no existe, crear perfil inicial con valores por defecto
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        equipo: [],
        pokeballs: {
          pokeball: 10,
          superball: 0,
          ultraball: 0,
          masterball: 0
        },
        incubadoras: [],
        fichas: 0,
        pedidos: []
      }
      
      // Solo agregar campos opcionales si tienen valor
      if (firebaseUser.displayName) {
        profile.displayName = firebaseUser.displayName
      }
      if (firebaseUser.phoneNumber) {
        profile.phoneNumber = firebaseUser.phoneNumber
      }
      
      // Guardar nuevo perfil en Firebase
      await saveUserProfile(profile)
      
      return profile
    } catch (error) {
      console.error('Error creating/updating Firebase profile:', error)
      return null
    }
  }

  // Función para sincronizar equipo con Firebase
  const syncTeamWithFirebase = async (team: any[]) => {
    if (!user?.uid || !user?.email) return
    
    try {
      const { updateUserEquipo } = await import('../lib/userData')
      await updateUserEquipo(user.uid, user.email, team)
      console.log('Equipo sincronizado con Firebase')
    } catch (error) {
      console.error('Error syncing team with Firebase:', error)
    }
  }

  // Función para notificar cambios en pokeballs
  const notifyPokeballsUpdate = () => {
    if (!user?.uid || !user?.profile) return
    
    try {
      // Solo disparar eventos de actualización si hay datos de pokeballs en Firebase
      if (user.profile.pokeballs) {
        // Notificar a componentes que usan pokeballs
        window.dispatchEvent(new CustomEvent('pokeballsUpdate'))
        console.log('Pokeballs update event dispatched:', user.profile.pokeballs)
      }
    } catch (error) {
      console.error('Error dispatching pokeballs update:', error)
    }
  }

  // Función para refrescar el perfil desde Firestore
  const refreshUserProfile = async () => {
    if (!user?.uid || !user?.email) return;
    
    try {
      console.log('🔄 Refrescando perfil desde Firestore...');
      const updatedProfile = await getUserProfile(user.uid, user.email);
      
      if (updatedProfile) {
        console.log('✅ Perfil actualizado desde Firestore:', {
          hasIncubadoras: !!updatedProfile.incubadoras,
          incubadorasLength: updatedProfile.incubadoras?.length || 0
        });
        
        setUserState(prev => prev ? {
          ...prev,
          profile: updatedProfile
        } : null);
      }
    } catch (error) {
      console.error('❌ Error refrescando perfil:', error);
    }
  };

  // Función para sincronizar pokeballs con Firebase
  const syncPokeballsWithFirebase = async (pokeballs: any) => {
    if (!user?.uid || !user?.email) return
    
    try {
      const { updateUserPokeballs } = await import('../lib/userData')
      await updateUserPokeballs(user.uid, user.email, pokeballs)
      console.log('Pokeballs sincronizadas con Firebase:', pokeballs)
    } catch (error) {
      console.error('Error syncing pokeballs with Firebase:', error)
    }
  }

  // Función para sincronizar incubadoras con Firebase
  const syncIncubadorasWithFirebase = async (incubadoras: any[]) => {
    if (!user?.uid || !user?.email) {
      console.log('⚠️ syncIncubadorasWithFirebase: Usuario no autenticado', {
        hasUid: !!user?.uid,
        hasEmail: !!user?.email
      });
      return;
    }
    
    try {
      console.log('🔄 syncIncubadorasWithFirebase: Iniciando sincronización...', {
        uid: user.uid,
        email: user.email,
        incubadorasCount: incubadoras.length
      });
      
      const { updateUserIncubadoras } = await import('../lib/userData')
      await updateUserIncubadoras(user.uid, user.email, incubadoras)
      
      console.log('✅ syncIncubadorasWithFirebase: Incubadoras sincronizadas exitosamente con Firebase:', incubadoras.length, 'huevos')
    } catch (error) {
      console.error('❌ syncIncubadorasWithFirebase: Error syncing incubadoras with Firebase:', error)
    }
  }

  // Función para sincronizar fichas con Firebase
  const syncFichasWithFirebase = async (fichas: number) => {
    if (!user?.uid || !user?.email) return
    
    try {
      // Guardar en localStorage como fuente de verdad local
      localStorage.setItem('userFichas', String(fichas))
      
      // Sincronizar con Firebase
      await updateUserFichas(user.uid, user.email, fichas)
      console.log('Fichas sincronizadas con Firebase:', fichas)
    } catch (error) {
      console.error('Error syncing fichas with Firebase:', error)
    }
  }

  // Funciones helper para disparar eventos de actualización
  const triggerPokeballsUpdate = (pokeballs: any) => {
    window.dispatchEvent(new CustomEvent('pokeballsUpdated', { 
      detail: { pokeballs, timestamp: Date.now() } 
    }));
  };

  const triggerFichasUpdate = (fichas: number) => {
    window.dispatchEvent(new CustomEvent('fichasUpdated', { 
      detail: { fichas, timestamp: Date.now() } 
    }));
  };

  const triggerIncubadorasUpdate = (incubadoras: any[]) => {
    window.dispatchEvent(new CustomEvent('incubadorasUpdated', { 
      detail: { incubadoras, timestamp: Date.now() } 
    }));
  };

  // Función para forzar la sincronización de todos los componentes
  const forceSyncComponents = () => {
    if (user?.profile) {
      console.log('🔄 UserContext: Forzando sincronización de todos los componentes');
      
      // Disparar evento general de perfil actualizado
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: user.profile 
      }));
      
      // Disparar evento de pokeballs si existen
      if (user.profile.pokeballs) {
        console.log('🔄 UserContext: Forzando sincronización de pokeballs:', user.profile.pokeballs);
        window.dispatchEvent(new CustomEvent('pokeballsUpdated', { 
          detail: user.profile.pokeballs 
        }));
      }
      
      // Disparar evento de incubadoras si existen
      if (user.profile.incubadoras) {
        console.log('🔄 UserContext: Forzando sincronización de incubadoras:', user.profile.incubadoras.length, 'huevos');
        window.dispatchEvent(new CustomEvent('incubadorasUpdated', { 
          detail: { incubadoras: user.profile.incubadoras, timestamp: Date.now() } 
        }));
      }
      
      // Disparar evento de fichas si existen
      if (typeof user.profile.fichas === 'number') {
        console.log('🔄 UserContext: Forzando sincronización de fichas:', user.profile.fichas);
        window.dispatchEvent(new CustomEvent('fichasUpdated', { 
          detail: user.profile.fichas 
        }));
      }
    }
  };

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our User type
        const user: User = {
          uid: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          profile: null
        }
        
        // Crear/actualizar perfil en Firebase y obtener datos existentes
        const profile = await createOrUpdateFirebaseProfile(firebaseUser)
        const existingProfile = await getUserProfile(firebaseUser.uid, firebaseUser.email || undefined)
        
        console.log('🔍 UserContext - Perfil cargado:', {
          hasExistingProfile: !!existingProfile,
          hasIncubadoras: !!existingProfile?.incubadoras,
          incubadorasLength: existingProfile?.incubadoras?.length || 0,
          fichas: existingProfile?.fichas,
          email: firebaseUser.email
        });
        
        user.profile = existingProfile || profile
        
        setUserState(user)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Disparar eventos iniciales para sincronizar componentes con los datos del perfil
        if (user.profile) {
          console.log('🔄 UserContext: Cargando datos del perfil a localStorage');
          
          // Disparar eventos iniciales solo para datos que se cargaron desde el perfil
          let pokeballsLoaded = false;
          let incubadorasLoaded = false;
          
          // Cargar pokeballs a localStorage si existen y no hay datos locales más recientes
          if (user.profile.pokeballs) {
            const localPokeballs = localStorage.getItem('userPokeballs');
            if (!localPokeballs) {
              // Solo cargar desde profile si no hay datos locales
              console.log('🔄 UserContext: Cargando pokeballs a localStorage (sin datos locales):', user.profile.pokeballs);
              localStorage.setItem('userPokeballs', JSON.stringify(user.profile.pokeballs));
              pokeballsLoaded = true;
            } else {
              console.log('⚠️ UserContext: Datos locales de pokeballs encontrados, no sobrescribiendo desde profile');
            }
          }
          
          // Cargar incubadoras a localStorage si existen y no hay datos locales más recientes
          if (user.profile.incubadoras) {
            const localIncubadoras = localStorage.getItem('userIncubadoras');
            if (!localIncubadoras) {
              // Solo cargar desde profile si no hay datos locales
              console.log('🔄 UserContext: Cargando incubadoras a localStorage (sin datos locales):', user.profile.incubadoras.length, 'huevos');
              localStorage.setItem('userIncubadoras', JSON.stringify(user.profile.incubadoras));
              incubadorasLoaded = true;
            } else {
              console.log('⚠️ UserContext: Datos locales de incubadoras encontrados, no sobrescribiendo desde profile');
            }
          }
          
          // Disparar evento general de perfil actualizado
          window.dispatchEvent(new CustomEvent('profileUpdated', { 
            detail: user.profile 
          }));
          
          // Disparar evento de pokeballs solo si se cargaron desde profile
          if (pokeballsLoaded && user.profile.pokeballs) {
            console.log('🔄 UserContext: Disparando evento inicial de pokeballs:', user.profile.pokeballs);
            window.dispatchEvent(new CustomEvent('pokeballsUpdated', { 
              detail: user.profile.pokeballs 
            }));
          }
          
          // Disparar evento de incubadoras solo si se cargaron desde profile
          if (incubadorasLoaded && user.profile.incubadoras) {
            console.log('🔄 UserContext: Disparando evento inicial de incubadoras:', user.profile.incubadoras.length, 'huevos');
            window.dispatchEvent(new CustomEvent('incubadorasUpdated', { 
              detail: { incubadoras: user.profile.incubadoras, timestamp: Date.now() } 
            }));
          }
          
          // Disparar evento de fichas si existen, pero solo si no hay datos locales más recientes
          if (typeof user.profile.fichas === 'number') {
            const localFichas = localStorage.getItem('userFichas');
            if (!localFichas) {
              // Solo cargar desde profile si no hay datos locales
              console.log('🔄 UserContext: Cargando fichas desde profile (sin datos locales):', user.profile.fichas);
              localStorage.setItem('userFichas', String(user.profile.fichas));
              window.dispatchEvent(new CustomEvent('fichasUpdated', { 
                detail: { fichas: user.profile.fichas, timestamp: Date.now() }
              }));
            } else {
              console.log('⚠️ UserContext: Datos locales de fichas encontrados, no sobrescribiendo desde profile. Local:', localFichas, 'Profile:', user.profile.fichas);
              // Disparar evento con los datos locales en lugar del profile
              const localFichasValue = parseInt(localFichas, 10);
              window.dispatchEvent(new CustomEvent('fichasUpdated', { 
                detail: { fichas: localFichasValue, timestamp: Date.now() }
              }));
            }
          }
        }
      } else {
        setUserState(null)
        localStorage.removeItem('user')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Sincronizar perfil cuando el usuario cambia
  // useEffect(() => {
  //   if (user?.uid) {
  //     syncUserProfile()
  //   }
  // }, [user?.uid])

  // Efecto para sincronizar equipo automáticamente cuando cambie en localStorage
  useEffect(() => {
    if (!user?.uid) return

    let lastTeam: string | null = null

    const checkTeamChanges = () => {
      const currentTeam = localStorage.getItem('pokemonTeam')
      if (currentTeam !== lastTeam) {
        lastTeam = currentTeam
        if (currentTeam) {
          try {
            const team = JSON.parse(currentTeam)
            if (Array.isArray(team)) {
              console.log('Team changed, syncing with Firebase...', team.length, 'items')
              syncTeamWithFirebase(team)
            }
          } catch (error) {
            console.error('Error parsing team from localStorage:', error)
          }
        } else {
          // Si no hay equipo, sincronizar equipo vacío
          console.log('Team cleared, syncing empty team with Firebase...')
          syncTeamWithFirebase([])
        }
      }
    }

    // Verificar inmediatamente
    checkTeamChanges()

    // Verificar cambios cada 2 segundos
    const interval = setInterval(checkTeamChanges, 2000)

    // También escuchar eventos de storage
    window.addEventListener('storage', checkTeamChanges)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkTeamChanges)
    }
  }, [user?.uid])

  // Efecto para sincronizar pokeballs automáticamente cuando cambien en localStorage
  useEffect(() => {
    if (!user?.uid) return

    let lastPokeballs: string | null = null

    const checkPokeballsChanges = () => {
      const currentPokeballs = localStorage.getItem('userPokeballs')
      if (currentPokeballs !== lastPokeballs) {
        lastPokeballs = currentPokeballs
        if (currentPokeballs) {
          try {
            const pokeballs = JSON.parse(currentPokeballs)
            if (pokeballs && typeof pokeballs === 'object') {
              console.log('Pokeballs changed, syncing with Firebase...', pokeballs)
              syncPokeballsWithFirebase(pokeballs)
            }
          } catch (error) {
            console.error('Error parsing pokeballs from localStorage:', error)
          }
        }
      }
    }

    // Verificar inmediatamente
    checkPokeballsChanges()

    // Verificar cambios cada 2 segundos
    const interval = setInterval(checkPokeballsChanges, 2000)

    // También escuchar eventos de storage
    window.addEventListener('storage', checkPokeballsChanges)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkPokeballsChanges)
    }
  }, [user?.uid])

  // Efecto para sincronizar incubadoras automáticamente cuando cambien en localStorage
  useEffect(() => {
    if (!user?.uid) return

    let lastIncubadoras: string | null = null

    const checkIncubadorasChanges = () => {
      const currentIncubadoras = localStorage.getItem('userIncubadoras')
      if (currentIncubadoras !== lastIncubadoras) {
        lastIncubadoras = currentIncubadoras
        if (currentIncubadoras) {
          try {
            const incubadoras = JSON.parse(currentIncubadoras)
            if (Array.isArray(incubadoras)) {
              console.log('Incubadoras changed, syncing with Firebase...', incubadoras.length, 'huevos')
              syncIncubadorasWithFirebase(incubadoras)
            }
          } catch (error) {
            console.error('Error parsing incubadoras from localStorage:', error)
          }
        } else {
          // Si no hay incubadoras, sincronizar array vacío
          console.log('Incubadoras cleared, syncing empty array with Firebase...')
          syncIncubadorasWithFirebase([])
        }
      }
    }

    // Verificar inmediatamente
    checkIncubadorasChanges()

    // Verificar cambios cada 2 segundos
    const interval = setInterval(checkIncubadorasChanges, 2000)

    // También escuchar eventos de storage
    window.addEventListener('storage', checkIncubadorasChanges)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkIncubadorasChanges)
    }
  }, [user?.uid])

  // Función para actualizar pokeballs en el contexto cuando cambien
  const updatePokeballsInContext = async (newPokeballs: any) => {
    if (user?.profile) {
      const updatedProfile = {
        ...user.profile,
        pokeballs: newPokeballs
      }
      updateUserInContext({ profile: updatedProfile })
      console.log('Pokeballs actualizadas en contexto:', newPokeballs)
    }
  }

  // Escuchar eventos de actualización de pokeballs
  useEffect(() => {
    const handlePokeballsUpdate = (event: CustomEvent) => {
      updatePokeballsInContext(event.detail)
    }

    window.addEventListener('pokeballsUpdated', handlePokeballsUpdate as EventListener)
    
    return () => {
      window.removeEventListener('pokeballsUpdated', handlePokeballsUpdate as EventListener)
    }
  }, [user])

  // Escuchar actualizaciones de fichas
  useEffect(() => {
    const handleFichasUpdate = (event: CustomEvent) => {
      if (user?.profile && typeof event.detail?.fichas === 'number') {
        const newFichas = event.detail.fichas;
        
        console.log('🔄 UserContext: Recibido evento fichasUpdated', {
          newFichas,
          currentFichas: user.profile.fichas,
          timestamp: event.detail.timestamp
        });
        
        // Actualizar fichas en el contexto local inmediatamente
        setUserState(prev => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            fichas: newFichas
          }
        } : null);
        
        // Sincronizar con Firebase
        syncFichasWithFirebase(newFichas);
      }
    }

    window.addEventListener('fichasUpdated', handleFichasUpdate as EventListener)
    
    return () => {
      window.removeEventListener('fichasUpdated', handleFichasUpdate as EventListener)
    }
  }, [user])

  // Listener en tiempo real para fichas del usuario
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const firestoreFichas = data?.fichas;
        
        if (typeof firestoreFichas === 'number') {
          console.log('🔄 UserContext: Fichas actualizadas desde Firestore:', firestoreFichas);
          
          // Actualizar el perfil del usuario en contexto
          if (user.profile) {
            const updatedProfile = {
              ...user.profile,
              fichas: firestoreFichas
            };
            updateUserInContext({ profile: updatedProfile });
          }
          
          // Disparar evento para que otros componentes se enteren
          triggerFichasUpdate(firestoreFichas);
        }
      }
    }, (error) => {
      console.error('Error listening to fichas changes:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const setUser = (user: User | null) => {
    setUserState(user)
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }

  const login = (user: User) => {
    setUser(user)
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    try {
      await signInWithPopup(auth, provider)
      // The user will be automatically set by onAuthStateChanged
    } catch (error) {
      console.error('Error with Google login:', error)
      throw error
    }
  }

  const loginWithEmail = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/auth/email-signin',
      handleCodeInApp: true,
    }
    
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      // Store email for later verification
      localStorage.setItem('emailForSignIn', email)
    } catch (error) {
      console.error('Error sending email link:', error)
      throw error
    }
  }

  const isLoggedIn = !!user

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      isLoggedIn,
      login,
      logout,
      isLoading,
      loginWithGoogle,
      loginWithEmail,
      syncUserProfile,
      updateUserInContext,
      syncTeamWithFirebase,
      refreshUserProfile,
      triggerPokeballsUpdate,
      triggerFichasUpdate,
      triggerIncubadorasUpdate,
      forceSyncComponents
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider')
  return context
}