# Bug Investigation Report

## Executive Summary

This document details the results of a comprehensive bug investigation session conducted on the Boxwood template engine. A total of **11 bugs** were identified, ranging from minor code quality issues to potential security vulnerabilities.

## Bugs Identified

### BUG #1: Incorrect Variable Names in Error Message (CRITICAL)
**Location:** `index.js`, lines 218-222  
**Severity:** High  
**Type:** Runtime Error

**Description:**  
The `validateFile` function throws an error that references undefined variables `realPath` and `realBase`:

```javascript
if (!normalizedPath.startsWith(normalizedBase + "/")) {
  throw new Error(
    `FileError: real path "${realPath}" is not within the current working directory "${realBase}"`
  )
}
```

However, `realPath` and `realBase` are only defined in the calling function `readFile`. The function receives `path` and `base` as parameters.

**Impact:**  
If this error is triggered, it will cause a ReferenceError due to undefined variables, making debugging difficult.

**Fix:**  
Replace the error message to use the correct variable names:
```javascript
`FileError: path "${normalizedPath}" is not within the current working directory "${normalizedBase}"`
```

---

### BUG #2 & #5: Incomplete HTML/SVG Sanitization (CRITICAL)
**Location:** `index.js`, lines 452-459 (sanitizeHTML) and 898-905 (sanitizeSVG)  
**Severity:** Critical (Security)  
**Type:** XSS Vulnerability

**Description:**  
Both `sanitizeHTML` and `sanitizeSVG` functions have incomplete sanitization that doesn't handle:
- Unquoted event handlers: `<div onclick=alert(1)>`
- Event handlers without whitespace prefix: `<divonclick="...">` (though unlikely)
- Data URIs: `<a href="data:text/html,<script>alert(1)</script>">`
- Object data URIs: `<object data="data:text/html,...">`
- Form actions: `<form action="javascript:alert(1)">`

Current regex: `/\son\w+="[^"]*"/gi` requires whitespace before the attribute.

**Impact:**  
Potential XSS vulnerabilities if malicious HTML/SVG files bypass sanitization.

**Fix:**  
Enhanced sanitization patterns (see fixes section below).

---

### BUG #3: Misspelled Function Name
**Location:** `index.js`, line 588  
**Severity:** Low (Code Quality)  
**Type:** Typo

**Description:**  
The function `occurences` is misspelled. The correct spelling is `occurrences` (with two 'r's).

**Impact:**  
Code quality issue that may cause confusion for contributors.

**Fix:**  
Rename function to `occurrences`.

---

### BUG #4: Simplistic CSS Validation
**Location:** `index.js`, lines 608-635  
**Severity:** Medium  
**Type:** Logic Error

**Description:**  
The `isCSSValid` function only counts matching brackets/parentheses/braces but doesn't account for them appearing in:
- CSS strings: `.test::before { content: "{"; }`
- CSS comments: `/* { unmatched bracket in comment */`

**Impact:**  
False positives for valid CSS files, or false negatives for invalid CSS.

**Fix:**  
Either use a proper CSS parser (css-tree is already a dependency) or document this limitation clearly.

---

### BUG #6: Basic i18n Function Lacks Error Handling
**Location:** `index.js`, lines 978-982  
**Severity:** Medium  
**Type:** Missing Error Handling

**Description:**  
The basic `i18n` function returns undefined or throws unhelpful TypeErrors when translations are missing:

```javascript
function i18n(translations) {
  return function translate(language, key) {
    return translations[key][language]  // No validation
  }
}
```

Compare this to `i18n.load` which has proper error handling.

**Impact:**  
Poor developer experience with unclear error messages.

**Fix:**  
Add validation similar to `i18n.load`.

---

### BUG #7: Extension Function Doesn't Handle Edge Cases
**Location:** `index.js`, lines 854-857  
**Severity:** Medium  
**Type:** Edge Case

**Description:**  
The `extension` function doesn't properly handle:
- Files without extensions: `README` → returns "README"
- Hidden files: `.hidden` → returns "hidden"
- Multiple dots: `file.tar.gz` → returns "gz" only

```javascript
function extension(path) {
  const parts = path.split(".")
  return parts[parts.length - 1].toLowerCase()
}
```

**Impact:**  
Incorrect file type detection leading to confusing error messages.

**Fix:**  
Add validation for empty extension or check for files starting with dot.

---

### BUG #8: Component Function Missing Property Validation
**Location:** `index.js`, lines 1046-1054  
**Severity:** Medium  
**Type:** Missing Validation

**Description:**  
When mapping styles and scripts in the component function, there's no check for `.css` or `.js` properties:

```javascript
if (styles) {
  const data = Array.isArray(styles) ? styles : [styles]
  nodes = nodes.concat(data.map((style) => style.css))  // No check if .css exists
}
```

**Impact:**  
`undefined` values added to nodes array if properties don't exist.

**Fix:**  
Add validation or filter out undefined values.

---

### BUG #9: Redundant Variable Declaration
**Location:** `index.js`, line 312  
**Severity:** Low (Code Quality)  
**Type:** Code Smell

**Description:**  
The `attributes` function re-declares the `value` variable:

```javascript
const value = options[key]  // Line 301
// ...
const value = options[key]  // Line 312 - redundant
```

**Impact:**  
Code confusion, no functional impact.

**Fix:**  
Remove redundant declaration.

---

### BUG #10: Attribute Validation Doesn't Allow Colons
**Location:** `index.js`, lines 289-290  
**Severity:** Low  
**Type:** Limitation

**Description:**  
The key validation regex `/^[a-zA-Z0-9\-_]+$/` doesn't allow colons, which are valid in namespaced attributes:
- `xml:lang`
- `xlink:href`
- `xmlns:xlink`

**Impact:**  
Cannot use namespaced XML/SVG attributes.

**Fix:**  
Update regex to `/^[a-zA-Z0-9\-_:]+$/` or document this limitation.

---

### BUG #11: Render Function Doesn't Propagate Escape Parameter for Arrays
**Location:** `index.js`, lines 378-383  
**Severity:** Medium  
**Type:** Logic Error

**Description:**  
When rendering arrays, the recursive call doesn't pass the `escape` parameter:

```javascript
if (Array.isArray(input)) {
  let result = ""
  for (let i = 0, ilen = input.length; i < ilen; i++) {
    result += render(input[i])  // Missing escape parameter
  }
  return result
}
```

**Impact:**  
Array content inside `<script>` or `<style>` tags may be incorrectly escaped.

**Fix:**  
Pass the escape parameter: `render(input[i], escape)`

---

## Priority Ranking

1. **Critical:** BUG #2/#5 (XSS vulnerabilities)
2. **High:** BUG #1 (Undefined variable in error message)
3. **Medium:** BUG #11 (Escape parameter propagation)
4. **Medium:** BUG #6 (i18n error handling)
5. **Medium:** BUG #7 (Extension edge cases)
6. **Medium:** BUG #4 (CSS validation)
7. **Medium:** BUG #8 (Component validation)
8. **Low:** BUG #3 (Typo)
9. **Low:** BUG #9 (Redundant declaration)
10. **Low:** BUG #10 (Attribute colons)

## Recommendations

1. **Immediate Action Required:**
   - Fix BUG #1 (undefined variables)
   - Fix BUG #2/#5 (security vulnerabilities)
   - Fix BUG #11 (escape propagation)

2. **Short-term Improvements:**
   - Add comprehensive security tests
   - Improve error handling across the board
   - Fix typos and code quality issues

3. **Long-term Considerations:**
   - Consider using DOMPurify or similar for robust HTML/SVG sanitization
   - Add comprehensive input validation
   - Improve documentation about security limitations

## Test Coverage

All identified bugs have been documented with test cases in `test/bugs/investigation.test.js`.
