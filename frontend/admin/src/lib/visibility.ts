import { Brand, Category, Series, Product } from '@/types';

export type VisibilityStatus = 'visible' | 'hidden';

export interface VisibilityResult {
    status: VisibilityStatus;
    reasons: string[];
}

/**
 * Compute visibility for a Brand
 * Visible = brand.isActive === true
 */
export function computeBrandVisibility(brand: Brand): VisibilityResult {
    const reasons: string[] = [];

    if (!brand.isActive) {
        reasons.push('Brand is inactive');
    }

    return {
        status: reasons.length === 0 ? 'visible' : 'hidden',
        reasons,
    };
}

/**
 * Compute visibility for a Category
 * Visible = category.isActive === true AND brand.isActive === true
 */
export function computeCategoryVisibility(
    category: Category,
    brand: Brand | undefined
): VisibilityResult {
    const reasons: string[] = [];

    if (!category.isActive) {
        reasons.push('Category is inactive');
    }

    if (brand && !brand.isActive) {
        reasons.push('Parent brand is inactive');
    }

    return {
        status: reasons.length === 0 ? 'visible' : 'hidden',
        reasons,
    };
}

/**
 * Compute visibility for a Series
 * Visible = series.isActive === true AND category.isActive === true AND brand.isActive === true
 */
export function computeSeriesVisibility(
    series: Series,
    category: Category | undefined,
    brand: Brand | undefined
): VisibilityResult {
    const reasons: string[] = [];

    if (!series.isActive) {
        reasons.push('Series is inactive');
    }

    if (category && !category.isActive) {
        reasons.push('Parent category is inactive');
    }

    if (brand && !brand.isActive) {
        reasons.push('Parent brand is inactive');
    }

    return {
        status: reasons.length === 0 ? 'visible' : 'hidden',
        reasons,
    };
}

/**
 * Compute visibility for a Product
 * Visible = product.isActive === true AND series.isActive === true 
 *           AND category.isActive === true AND brand.isActive === true
 */
export function computeProductVisibility(
    product: Product,
    series: Series | undefined,
    category: Category | undefined,
    brand: Brand | undefined
): VisibilityResult {
    const reasons: string[] = [];

    if (!product.isActive) {
        reasons.push('Product is inactive');
    }

    if (series && !series.isActive) {
        reasons.push('Parent series is inactive');
    }

    if (category && !category.isActive) {
        reasons.push('Parent category is inactive');
    }

    if (brand && !brand.isActive) {
        reasons.push('Parent brand is inactive');
    }

    return {
        status: reasons.length === 0 ? 'visible' : 'hidden',
        reasons,
    };
}

/**
 * Check if a parent entity is inactive (used for highlighting)
 */
export function isParentInactive(parent: { isActive: boolean } | undefined): boolean {
    return parent ? !parent.isActive : false;
}
