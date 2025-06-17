import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const BattlefieldBackground = ({ gymType }) => {
    const getBackgroundStyle = () => {
        switch (gymType.toLowerCase()) {
            case 'roca':
                return {
                    background: 'linear-gradient(to bottom, #8B4513 0%, #D2691E 50%, #8B4513 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23654321' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`
                };
            case 'agua':
                return {
                    background: 'linear-gradient(to bottom, #4169E1 0%, #1E90FF 50%, #4169E1 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230066cc' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='45' cy='45' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                };
            case 'eléctrico':
                return {
                    background: 'linear-gradient(to bottom, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff8800' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M10 2l8 8-8 8-8-8z'/%3E%3C/g%3E%3C/svg%3E")`
                };
            case 'planta':
                return {
                    background: 'linear-gradient(to bottom, #228B22 0%, #32CD32 50%, #228B22 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23006600' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v40c11.046 0 20-8.954 20-20z'/%3E%3C/g%3E%3C/svg%3E")`
                };
            case 'fuego':
                return {
                    background: 'linear-gradient(to bottom, #DC143C 0%, #FF4500 50%, #DC143C 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cc3300' fill-opacity='0.4'%3E%3Cpath d='M30 30l15-15v15l-15 15v-15zm0 0l-15-15v15l15 15v-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                };
            case 'psíquico':
                return {
                    background: 'linear-gradient(to bottom, #9370DB 0%, #BA55D3 50%, #9370DB 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236633cc' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='10'/%3E%3C/g%3E%3C/svg%3E")`
                };
            case 'veneno':
                return {
                    background: 'linear-gradient(to bottom, #800080 0%, #9932CC 50%, #800080 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23663399' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E")`
                };
            case 'tierra':
                return {
                    background: 'linear-gradient(to bottom, #8B7355 0%, #DEB887 50%, #8B7355 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23aa8866' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`
                };
            default:
                return {
                    background: 'linear-gradient(to bottom, #696969 0%, #A9A9A9 50%, #696969 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23555555' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`
                };
        }
    };
    return (_jsxs("div", { className: "absolute inset-0 w-full h-full", style: getBackgroundStyle(), children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute top-1/2 left-0 right-0 h-1 bg-white/20 transform -translate-y-0.5" }), _jsx("div", { className: "absolute bottom-0 left-1/4 w-1 h-1/2 bg-white/10 transform -skew-x-12 origin-bottom" }), _jsx("div", { className: "absolute bottom-0 right-1/4 w-1 h-1/2 bg-white/10 transform skew-x-12 origin-bottom" }), _jsx("div", { className: "absolute top-1/3 left-1/4 w-8 h-8 border-2 border-white/20 rounded-full" }), _jsx("div", { className: "absolute bottom-1/3 right-1/4 w-8 h-8 border-2 border-white/20 rounded-full" })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" })] }));
};
