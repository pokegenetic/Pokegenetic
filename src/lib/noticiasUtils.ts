import { noticias, type Noticia } from '@/data/noticias';

// Utilidades para gestionar noticias
export class NoticiasManager {
  
  // Obtener todas las noticias ordenadas por fecha (más recientes primero)
  static getAllNoticias(): Noticia[] {
    return [...noticias].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  // Obtener noticias por categoría
  static getNoticiasByCategory(categoria: Noticia['categoria']): Noticia[] {
    return noticias.filter(noticia => noticia.categoria === categoria);
  }

  // Obtener noticias recientes (últimos N días)
  static getRecentNoticias(days: number = 30): Noticia[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return noticias.filter(noticia => new Date(noticia.fecha) >= cutoffDate);
  }

  // Buscar noticias por término
  static searchNoticias(searchTerm: string): Noticia[] {
    const term = searchTerm.toLowerCase();
    return noticias.filter(noticia => 
      noticia.titulo.toLowerCase().includes(term) ||
      noticia.resumen.toLowerCase().includes(term) ||
      noticia.contenido.toLowerCase().includes(term)
    );
  }

  // Obtener una noticia por ID
  static getNoticiaById(id: string): Noticia | undefined {
    return noticias.find(noticia => noticia.id === id);
  }

  // Formatear fecha para mostrar
  static formatDate(fecha: string, locale: string = 'es-ES'): string {
    return new Date(fecha).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener estadísticas de noticias
  static getStats() {
    const categories = noticias.reduce((acc, noticia) => {
      acc[noticia.categoria] = (acc[noticia.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: noticias.length,
      categories,
      latestDate: Math.max(...noticias.map(n => new Date(n.fecha).getTime())),
      oldestDate: Math.min(...noticias.map(n => new Date(n.fecha).getTime()))
    };
  }
}

// Hook personalizado para gestionar noticias
export const useNoticias = () => {
  const getAllNoticias = () => NoticiasManager.getAllNoticias();
  const getNoticiasByCategory = (categoria: Noticia['categoria']) => NoticiasManager.getNoticiasByCategory(categoria);
  const getRecentNoticias = (days?: number) => NoticiasManager.getRecentNoticias(days);
  const searchNoticias = (searchTerm: string) => NoticiasManager.searchNoticias(searchTerm);
  const getNoticiaById = (id: string) => NoticiasManager.getNoticiaById(id);
  const getStats = () => NoticiasManager.getStats();

  return {
    getAllNoticias,
    getNoticiasByCategory,
    getRecentNoticias,
    searchNoticias,
    getNoticiaById,
    getStats,
    formatDate: NoticiasManager.formatDate
  };
};
