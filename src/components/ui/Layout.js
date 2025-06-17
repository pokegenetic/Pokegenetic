import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Footer from './footer';
const Layout = ({ children, className }) => (_jsxs("div", { className: `min-h-screen flex flex-col bg-[#f8fafc] ${className ?? ''}`, children: [_jsx("main", { className: "flex-1 w-full flex flex-col items-center justify-start", children: children }), _jsx(Footer, {})] }));
export default Layout;
