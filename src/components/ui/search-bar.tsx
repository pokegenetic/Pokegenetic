// src/components/ui/search-bar.tsx

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Search, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import pokemonList from "@/data/sv/pokemon-sv.json"
import { getSpriteForPokemon } from './crear';

// Define el tipo Pokemon basándote en tu JSON
type Pokemon = typeof pokemonList[number]

interface SearchBarProps {
  placeholder?: string
  onSelect?: (name: string) => void    // al elegir de la lista
  onCreate?: (name: string) => void    // al presionar “Crear”
  onFocus?: () => void                 // callback al enfocar
  onBlur?: () => void                  // callback al perder foco
  autoFocus?: boolean                  // NUEVO: para forzar el foco
}

const GooeyFilter: React.FC = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
)

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Busca un Pokémon",
  onSelect,
  onCreate,
  onFocus,
  onBlur,
  autoFocus = false,
  }) => {  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isDropdownHovered, setIsDropdownHovered] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [suggestions, setSuggestions] = useState<Pokemon[]>([])
  const [isClicked, setIsClicked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Índice de Pokémon por primera letra para acelerar filtrado
  const nameIndex = useMemo(() => {
    const idx: Record<string, Pokemon[]> = {}
    pokemonList.forEach(p => {
      const key = p.name[0].toLowerCase()
      if (!idx[key]) idx[key] = []
      idx[key].push(p)
    })
    return idx
  }, [])

  // Detecta navegadores Safari / Chrome iOS para filtrar efectos
  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    const isSafari =
      ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")
    const isChromeOniOS = ua.includes("crios")
    return isSafari || isChromeOniOS
  }, [])

  // Filtra sugerencias al tipear usando nameIndex y limitando a 10 resultados
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim()) {
      const letter = value[0].toLowerCase()
      const listToFilter = nameIndex[letter] || pokemonList
      const filtered = listToFilter
        .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10)
      setSuggestions(filtered)
    } else {
  setSuggestions([])
  setSearchQuery("")           // Borra también el texto del input
  if (onSelect) onSelect("")   // Notifica al padre que no hay selección
}
  }

  // Enviar búsqueda
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (onCreate && searchQuery.trim()) {
    onCreate(searchQuery)       // Navegará solo cuando pulses Crear
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1000)
  }
}

  // Efectos de partículas al pasar y click
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isFocused) return
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 800)
  }
  useEffect(() => {
    if (isFocused) inputRef.current?.focus()
  }, [isFocused])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  }, [autoFocus]);  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (!isDropdownHovered) {
          setIsFocused(false);
          setSuggestions([]);
          if (onBlur) onBlur();
        }
      }
    };

    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused, isDropdownHovered, onBlur]);

  // Animaciones para icono y sugerencias
  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  }
  const suggestionVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: i * 0.05 },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 15, delay: i * 0.07 },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: i * 0.03 },
    }),
  }

  // Partículas de foco
  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0 }}
      animate={{
        x: [0, (Math.random() - 0.5) * 40],
        y: [0, (Math.random() - 0.5) * 40],
        scale: [0, Math.random() * 0.8 + 0.4],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: Math.random() * 1.5 + 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
      style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, filter: "blur(2px)" }}
    />
  ))

  // Partículas de click
  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => (
        <motion.div
          key={`click-${i}`}
          initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
          animate={{
            x: mousePosition.x + (Math.random() - 0.5) * 160,
            y: mousePosition.y + (Math.random() - 0.5) * 160,
            scale: Math.random() * 0.8 + 0.2,
            opacity: [1, 0],
          }}
          transition={{ duration: Math.random() * 0.8 + 0.5, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 200 + 55
            )}, ${Math.floor(Math.random() * 255)}, 0.8)`,
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
          }}
        />
      ))
    : null

  // Helper para obtener el sprite correcto, usando el campo sprite del JSON si existe, o generando la URL robustamente
function getSpriteForSearchBar(pokemon: Pokemon): string {
  return getSpriteForPokemon(pokemon);
}  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onClick={() => inputRef.current?.focus() // <-- Asegura que cualquier click enfoca el input
      }
      className={cn(
        "relative w-full max-w-md mx-auto my-2",
        isFocused && !isUnsupportedBrowser && "filter url(#gooey-effect)"
      )}
      onMouseMove={handleMouseMove}
    >
      <GooeyFilter />

      {/* Formulario de búsqueda */}
      <motion.div
        onMouseMove={handleMouseMove}
        className="relative flex items-center justify-center w-full mx-auto"
        initial={{ width: "240px" }}
        animate={{ width: isFocused ? "340px" : "240px", scale: isFocused ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          onClick={handleClick}
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md",
            isFocused
              ? "border-transparent shadow-xl"
              : "border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/50"
          )}
          animate={{
            boxShadow: isClicked
              ? "0 0 40px rgba(139, 92, 246, 0.5), inset 0 0 15px rgba(236, 72, 153, 0.7)"
              : isFocused
              ? "0 15px 35px rgba(0, 0, 0, 0.2)"
              : "none",
          }}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.15,
                background: [
                  "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                  "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                  "linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)",
                  "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                ],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
          >
            {particles}
          </div>

          {isClicked && clickParticles}

          <motion.div className="pl-4 pr-2 py-3" variants={searchIconVariants} initial="initial" animate="animate"> {/* Added pr-2 for spacing */}
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                isAnimating
                  ? "text-purple-500"
                  : isFocused
                  ? "text-purple-600"
                  : "text-gray-500 dark:text-gray-300"
              )}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => { // THIS IS THE INPUT'S ACTUAL onFocus
              setIsFocused(true); // Sets internal state
              if (onFocus) {      // Calls the prop from Crear
                onFocus();
              }
            }}            onBlur={() => {  // THIS IS THE INPUT'S ACTUAL onBlur
              // Don't immediately close dropdown - let click outside handler manage this
              // This prevents the dropdown from closing before clicks can register
            }}
            className={cn(
              "w-full py-3 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium text-base relative z-10",
              isFocused ? "text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-300"
            )}
          />          <AnimatePresence>
            {searchQuery && (
              <div className="flex items-center gap-2 mr-2">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  whileHover={{
                    scale: 1.05,
                    background: "linear-gradient(45deg, #EF4444 0%, #F97316 100%)",
                    boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    if (onSelect) onSelect("");
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white backdrop-blur-sm shadow-lg"
                >
                  Limpiar
                </motion.button>
                <motion.button
                  type="submit"
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  whileHover={{
                    scale: 1.05,
                    background: "linear-gradient(45deg, #8B5CF6 0%, #EC4899 100%)",
                    boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white backdrop-blur-sm shadow-lg"
                >
                  Crear
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[9999] w-full mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            style={{ 
              maxHeight: 300, 
              pointerEvents: 'auto',
            }}
            onMouseEnter={() => setIsDropdownHovered(true)}
            onMouseLeave={() => setIsDropdownHovered(false)}
          >
            <div className="p-2 overflow-y-auto max-h-72">
              {suggestions.map((s, i) => (
                <motion.div
                  key={s.id}
                  custom={i}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => {
                    setSearchQuery(s.name);
                    setSuggestions([]);
                    if (onSelect) onSelect(s.name);
                    setIsFocused(false);
                    setIsDropdownHovered(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200 select-none"
                  style={{ pointerEvents: 'auto' }}
                >
                  <img src={getSpriteForSearchBar(s)} alt={s.name} className="w-6 h-6" />
                  <span className="text-gray-700 dark:text-gray-100">{s.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

export default SearchBar