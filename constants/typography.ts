/**
 * Premium Medical UI Typography System
 * 
 * High-visibility, professional typography for medical applications
 * Ensures WCAG AA contrast compliance and premium feel
 */

export const typography = {
    // Primary Headings
    h1: "text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight",
    h2: "text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight",
    h3: "text-xl md:text-2xl font-semibold text-gray-900 dark:text-white tracking-tight leading-snug",
    
    // Secondary Headings / Subheadings
    subheading: "text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed",
    
    // Body Text
    body: "text-base text-gray-600 dark:text-gray-300 leading-relaxed",
    bodyBold: "text-base font-semibold text-gray-900 dark:text-white leading-relaxed",
    
    // Muted / Helper Text
    muted: "text-sm text-gray-400 dark:text-gray-500 leading-normal",
    helper: "text-xs text-gray-400 dark:text-gray-500 leading-normal",
    
    // Accent / Highlight Text
    accent: "text-blue-600 dark:text-blue-400 font-semibold",
    accentHover: "text-blue-700 dark:text-blue-300 font-semibold",
    
    // Status Colors
    success: "text-emerald-600 dark:text-emerald-400 font-medium",
    error: "text-red-600 dark:text-red-400 font-medium",
    warning: "text-amber-600 dark:text-amber-400 font-medium",
    info: "text-indigo-600 dark:text-indigo-400 font-medium",
    
    // Interactive Text
    link: "text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
    button: "font-semibold tracking-wide",
    
    // Labels
    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
    labelBold: "text-sm font-bold text-gray-900 dark:text-white",
    
    // Input Text
    input: "text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500",
    inputLabel: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
    
    // Card Text
    cardTitle: "text-lg font-bold text-gray-900 dark:text-white",
    cardSubtitle: "text-sm text-gray-600 dark:text-gray-400",
    cardBody: "text-base text-gray-700 dark:text-gray-300",
};

/**
 * Utility function to combine typography classes with custom classes
 */
export const text = {
    h1: (custom?: string) => `${typography.h1} ${custom || ''}`,
    h2: (custom?: string) => `${typography.h2} ${custom || ''}`,
    h3: (custom?: string) => `${typography.h3} ${custom || ''}`,
    subheading: (custom?: string) => `${typography.subheading} ${custom || ''}`,
    body: (custom?: string) => `${typography.body} ${custom || ''}`,
    bodyBold: (custom?: string) => `${typography.bodyBold} ${custom || ''}`,
    muted: (custom?: string) => `${typography.muted} ${custom || ''}`,
    helper: (custom?: string) => `${typography.helper} ${custom || ''}`,
    accent: (custom?: string) => `${typography.accent} ${custom || ''}`,
    success: (custom?: string) => `${typography.success} ${custom || ''}`,
    error: (custom?: string) => `${typography.error} ${custom || ''}`,
    link: (custom?: string) => `${typography.link} ${custom || ''}`,
    label: (custom?: string) => `${typography.label} ${custom || ''}`,
    input: (custom?: string) => `${typography.input} ${custom || ''}`,
    cardTitle: (custom?: string) => `${typography.cardTitle} ${custom || ''}`,
    cardSubtitle: (custom?: string) => `${typography.cardSubtitle} ${custom || ''}`,
    cardBody: (custom?: string) => `${typography.cardBody} ${custom || ''}`,
};

