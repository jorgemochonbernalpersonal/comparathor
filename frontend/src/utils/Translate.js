import i18n from "./i18n";

export const translate = (key, options = {}) => {
    if (!key) {
        console.warn("translate called with an empty key");
        return "";
    }
    
    const translation = i18n.t(key, options);

    if (translation === key) {
        console.warn(`Missing translation for key: "${key}"`);
    }

    return translation;
};
