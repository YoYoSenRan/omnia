import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import zh from "./locales/zh"
import en from "./locales/en"

/** localStorage 中存储语言偏好的 key */
const LANG_STORAGE_KEY = "omnia-console-lang"

/** 支持的语言列表 */
export const SUPPORTED_LANGS = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
] as const

/** 语言代码类型 */
export type LangCode = (typeof SUPPORTED_LANGS)[number]["code"]

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  /* 优先读取缓存，否则使用中文 */
  lng: localStorage.getItem(LANG_STORAGE_KEY) ?? "zh",
  fallbackLng: "zh",
  interpolation: {
    /* React 已默认转义，无需 i18next 再转义 */
    escapeValue: false,
  },
})

/**
 * 切换语言并持久化到 localStorage
 *
 * @param lang - 目标语言代码
 */
export function changeLanguage(lang: LangCode): void {
  i18n.changeLanguage(lang)
  localStorage.setItem(LANG_STORAGE_KEY, lang)
}

export default i18n
