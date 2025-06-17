import { noticias } from '@/data/noticias';
// Utilidades para gestionar noticias
export class NoticiasManager {
    // Obtener todas las noticias ordenadas por fecha (más recientes primero)
    static getAllNoticias() {
        return [...noticias].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
    // Obtener noticias por categoría
    static getNoticiasByCategory(categoria) {
        return noticias.filter(noticia => noticia.categoria === categoria);
    }
    // Obtener noticias recientes (últimos N días)
    static getRecentNoticias(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return noticias.filter(noticia => new Date(noticia.fecha) >= cutoffDate);
    }
    // Buscar noticias por término
    static searchNoticias(searchTerm) {
        const term = searchTerm.toLowerCase();
        return noticias.filter(noticia => noticia.titulo.toLowerCase().includes(term) ||
            noticia.resumen.toLowerCase().includes(term) ||
            noticia.contenido.toLowerCase().includes(term));
    }
    // Obtener una noticia por ID
    static getNoticiaById(id) {
        return noticias.find(noticia => noticia.id === id);
    }
    // Formatear fecha para mostrar
    static formatDate(fecha, locale = 'es-ES') {
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
        }, {});
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
    const getNoticiasByCategory = (categoria) => NoticiasManager.getNoticiasByCategory(categoria);
    const getRecentNoticias = (days) => NoticiasManager.getRecentNoticias(days);
    const searchNoticias = (searchTerm) => NoticiasManager.searchNoticias(searchTerm);
    const getNoticiaById = (id) => NoticiasManager.getNoticiaById(id);
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
