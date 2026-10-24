/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sanitize SVG content by stripping scripts, event handlers, and dangerous attributes.
 * Shared between the browser compression path and the server security validator.
 */
export function sanitizeSvg(svgContent: string): string {
  let cleaned = svgContent;

  // Remove script tags and content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove XML entities (prevent XXE attack)
  cleaned = cleaned.replace(/<!ENTITY\b[^>]*>/gi, '');
  cleaned = cleaned.replace(/<!DOCTYPE\b[^>]*>/gi, '');

  // Remove inline event handlers (onload, onerror, onclick, etc.)
  cleaned = cleaned.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: and data: in href/xlink:href/src
  cleaned = cleaned.replace(/(href|xlink:href|src)\s*=\s*["']\s*(?:javascript|data):[^"']*["']/gi, '');

  // Remove <foreignObject> tags which can embed HTML/JS
  cleaned = cleaned.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');

  return cleaned.trim();
}

/**
 * Minify SVG text without breaking structure
 */
export function minifySvgText(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .replace(/\s+/g, ' ') // collapse whitespaces
    .replace(/>\s+</g, '><') // remove whitespace between tags
    .trim();
}
