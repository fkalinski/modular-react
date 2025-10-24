"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk_modular_platform_shared_components"] = self["webpackChunk_modular_platform_shared_components"] || []).push([["__federation_expose_Layout"],{

/***/ "./src/components/Layout.tsx":
/*!***********************************!*\
  !*** ./src/components/Layout.tsx ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Card: () => (/* binding */ Card),\n/* harmony export */   Container: () => (/* binding */ Container),\n/* harmony export */   Layout: () => (/* binding */ Layout),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ \"./node_modules/react/jsx-runtime.js\");\n\nconst Layout = ({ children, direction = 'column', gap = '16px', padding = '0', align = 'stretch', justify = 'start', }) => {\n    const styles = {\n        display: 'flex',\n        flexDirection: direction,\n        gap,\n        padding,\n        alignItems: align,\n        justifyContent: justify,\n    };\n    return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(\"div\", { style: styles, children: children });\n};\nconst Container = ({ children, maxWidth = '1200px', padding = '20px', }) => {\n    const styles = {\n        maxWidth,\n        margin: '0 auto',\n        padding,\n        width: '100%',\n    };\n    return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(\"div\", { style: styles, children: children });\n};\nconst Card = ({ children, title, padding = '20px', }) => {\n    const cardStyles = {\n        backgroundColor: '#fff',\n        borderRadius: '8px',\n        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',\n        overflow: 'hidden',\n    };\n    const headerStyles = {\n        padding: '16px 20px',\n        borderBottom: '1px solid #e9ecef',\n        fontSize: '18px',\n        fontWeight: 600,\n        color: '#212529',\n    };\n    const contentStyles = {\n        padding,\n    };\n    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(\"div\", { style: cardStyles, children: [title && (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(\"div\", { style: headerStyles, children: title }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(\"div\", { style: contentStyles, children: children })] }));\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ Layout, Container, Card });\n\n\n//# sourceURL=webpack://@modular-platform/shared-components/./src/components/Layout.tsx?\n}");

/***/ })

}]);