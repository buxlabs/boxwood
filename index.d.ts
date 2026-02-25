// TypeScript definitions for boxwood
declare module "boxwood" {
  // Core types
  type Child = string | number | Node | Node[] | null | undefined
  type Children = Child | Child[]

  interface Node {
    name: string
    attributes?: Record<string, any>
    children?: Children
    ignore?: boolean
  }

  interface ComponentProps {
    [key: string]: any
  }

  interface TranslateFunction {
    (key: string): string
  }

  interface ComponentWithI18n<T = ComponentProps> {
    (
      props: T & { translate: TranslateFunction },
      children?: Children,
    ): Node | Node[]
  }

  interface Component<T = ComponentProps> {
    (props?: T, children?: Children): Node | Node[]
  }

  // HTML Attributes
  interface GlobalAttributes {
    accesskey?: string
    autocapitalize?: string
    class?: string
    className?: string
    contenteditable?: boolean | "true" | "false"
    contextmenu?: string
    dir?: "ltr" | "rtl" | "auto"
    draggable?: boolean | "true" | "false"
    hidden?: boolean
    id?: string
    lang?: string
    slot?: string
    spellcheck?: boolean | "true" | "false"
    style?: string | Record<string, string | number>
    tabindex?: number | string
    title?: string
    translate?: "yes" | "no"
    role?: string
    // Data attributes
    [key: `data-${string}`]: any
    // Event handlers
    onclick?: string | Function
    ondblclick?: string | Function
    onmousedown?: string | Function
    onmouseup?: string | Function
    onmouseover?: string | Function
    onmousemove?: string | Function
    onmouseout?: string | Function
    onmouseenter?: string | Function
    onmouseleave?: string | Function
    onkeydown?: string | Function
    onkeyup?: string | Function
    onkeypress?: string | Function
    onfocus?: string | Function
    onblur?: string | Function
    onchange?: string | Function
    oninput?: string | Function
    onsubmit?: string | Function
    onreset?: string | Function
    onload?: string | Function
    onerror?: string | Function
    onresize?: string | Function
    onscroll?: string | Function
  }

  // Element-specific attributes
  interface AnchorAttributes extends GlobalAttributes {
    href?: string
    target?: "_blank" | "_self" | "_parent" | "_top"
    rel?: string
    download?: string | boolean
    hreflang?: string
    ping?: string
    referrerpolicy?: string
    type?: string
  }

  interface ImageAttributes extends GlobalAttributes {
    src?: string
    alt?: string
    width?: number | string
    height?: number | string
    loading?: "lazy" | "eager"
    decoding?: "sync" | "async" | "auto"
    srcset?: string
    sizes?: string
    crossorigin?: "anonymous" | "use-credentials"
    referrerpolicy?: string
  }

  interface InputAttributes extends GlobalAttributes {
    type?:
      | "text"
      | "password"
      | "email"
      | "number"
      | "tel"
      | "url"
      | "search"
      | "date"
      | "time"
      | "datetime-local"
      | "month"
      | "week"
      | "color"
      | "checkbox"
      | "radio"
      | "file"
      | "submit"
      | "reset"
      | "button"
      | "hidden"
      | "image"
      | "range"
    name?: string
    value?: string | number
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    checked?: boolean
    min?: number | string
    max?: number | string
    step?: number | string
    pattern?: string
    multiple?: boolean
    accept?: string
    autocomplete?: string
    autofocus?: boolean
    form?: string
    list?: string
    maxlength?: number
    minlength?: number
    size?: number
  }

  interface FormAttributes extends GlobalAttributes {
    action?: string
    method?: "get" | "post" | "dialog"
    enctype?:
      | "application/x-www-form-urlencoded"
      | "multipart/form-data"
      | "text/plain"
    name?: string
    target?: string
    novalidate?: boolean
    autocomplete?: "on" | "off"
  }

  interface ButtonAttributes extends GlobalAttributes {
    type?: "submit" | "reset" | "button"
    name?: string
    value?: string
    disabled?: boolean
    form?: string
    formaction?: string
    formenctype?: string
    formmethod?: string
    formnovalidate?: boolean
    formtarget?: string
    autofocus?: boolean
  }

  interface TextAreaAttributes extends GlobalAttributes {
    name?: string
    rows?: number
    cols?: number
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    placeholder?: string
    autofocus?: boolean
    form?: string
    maxlength?: number
    minlength?: number
    wrap?: "hard" | "soft"
  }

  interface SelectAttributes extends GlobalAttributes {
    name?: string
    disabled?: boolean
    required?: boolean
    multiple?: boolean
    size?: number
    form?: string
    autofocus?: boolean
  }

  interface OptionAttributes extends GlobalAttributes {
    value?: string
    label?: string
    selected?: boolean
    disabled?: boolean
  }

  interface LabelAttributes extends GlobalAttributes {
    for?: string
    htmlFor?: string
  }

  interface ScriptAttributes extends GlobalAttributes {
    src?: string
    type?: string
    async?: boolean
    defer?: boolean
    crossorigin?: "anonymous" | "use-credentials"
    integrity?: string
    nomodule?: boolean
    referrerpolicy?: string
    target?: "head" | "body"
  }

  interface LinkAttributes extends GlobalAttributes {
    href?: string
    rel?: string
    type?: string
    media?: string
    as?: string
    crossorigin?: "anonymous" | "use-credentials"
    integrity?: string
    referrerpolicy?: string
    sizes?: string
    imagesrcset?: string
    imagesizes?: string
  }

  interface MetaAttributes extends GlobalAttributes {
    charset?: string
    content?: string
    httpEquiv?: string
    name?: string
    property?: string
  }

  interface MediaAttributes extends GlobalAttributes {
    src?: string
    controls?: boolean
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
    preload?: "none" | "metadata" | "auto"
    crossorigin?: "anonymous" | "use-credentials"
  }

  interface VideoAttributes extends MediaAttributes {
    width?: number | string
    height?: number | string
    poster?: string
    playsinline?: boolean
  }

  interface AudioAttributes extends MediaAttributes {}

  interface IframeAttributes extends GlobalAttributes {
    src?: string
    srcdoc?: string
    name?: string
    width?: number | string
    height?: number | string
    allow?: string
    allowfullscreen?: boolean
    allowpaymentrequest?: boolean
    loading?: "lazy" | "eager"
    referrerpolicy?: string
    sandbox?: string
  }

  interface TableCellAttributes extends GlobalAttributes {
    colspan?: number
    rowspan?: number
    headers?: string
  }

  // SVG Attributes
  interface SVGAttributes extends GlobalAttributes {
    // Core SVG attributes
    viewBox?: string
    preserveAspectRatio?: string
    xmlns?: string
    xmlnsXlink?: string
    version?: string
    baseProfile?: string
    x?: number | string
    y?: number | string
    width?: number | string
    height?: number | string
    // Presentation attributes
    fill?: string
    fillOpacity?: number | string
    fillRule?: "nonzero" | "evenodd"
    stroke?: string
    strokeWidth?: number | string
    strokeOpacity?: number | string
    strokeLinecap?: "butt" | "round" | "square"
    strokeLinejoin?: "miter" | "round" | "bevel"
    strokeDasharray?: string
    strokeDashoffset?: number | string
    opacity?: number | string
    transform?: string
    vectorEffect?: string
    shapeRendering?: string
    pathLength?: number
    // Common SVG attributes
    d?: string
    points?: string
    cx?: number | string
    cy?: number | string
    r?: number | string
    rx?: number | string
    ry?: number | string
    x1?: number | string
    y1?: number | string
    x2?: number | string
    y2?: number | string
    href?: string
    xlinkHref?: string
    id?: string
    clipPath?: string
    mask?: string
    filter?: string
    markerStart?: string
    markerMid?: string
    markerEnd?: string
    // Animation attributes
    attributeName?: string
    from?: string | number
    to?: string | number
    dur?: string
    repeatCount?: number | "indefinite"
    // Gradient attributes
    gradientUnits?: "userSpaceOnUse" | "objectBoundingBox"
    gradientTransform?: string
    fx?: number | string
    fy?: number | string
    offset?: string
    stopColor?: string
    stopOpacity?: number | string
    // Text attributes
    textAnchor?: "start" | "middle" | "end"
    dominantBaseline?: string
    fontSize?: number | string
    fontFamily?: string
    fontWeight?: number | string
    letterSpacing?: number | string
    textDecoration?: string
    // Pattern attributes
    patternUnits?: "userSpaceOnUse" | "objectBoundingBox"
    patternTransform?: string
    patternContentUnits?: "userSpaceOnUse" | "objectBoundingBox"
  }

  // Element type functions
  type ElementFunction<T = GlobalAttributes> = (
    attributes?: T,
    children?: Children,
  ) => Node

  // HTML Elements
  export const A: ElementFunction<AnchorAttributes>
  export const Abbr: ElementFunction<GlobalAttributes>
  export const Address: ElementFunction<GlobalAttributes>
  export const Area: ElementFunction<
    GlobalAttributes & {
      alt?: string
      coords?: string
      shape?: string
      href?: string
      target?: string
      rel?: string
    }
  >
  export const Article: ElementFunction<GlobalAttributes>
  export const Aside: ElementFunction<GlobalAttributes>
  export const Audio: ElementFunction<AudioAttributes>
  export const B: ElementFunction<GlobalAttributes>
  export const Base: ElementFunction<
    GlobalAttributes & { href?: string; target?: string }
  >
  export const Bdi: ElementFunction<GlobalAttributes>
  export const Bdo: ElementFunction<GlobalAttributes>
  export const Blockquote: ElementFunction<GlobalAttributes & { cite?: string }>
  export const Body: ElementFunction<GlobalAttributes>
  export const Br: ElementFunction<GlobalAttributes>
  export const Button: ElementFunction<ButtonAttributes>
  export const Canvas: ElementFunction<
    GlobalAttributes & { width?: number | string; height?: number | string }
  >
  export const Caption: ElementFunction<GlobalAttributes>
  export const Cite: ElementFunction<GlobalAttributes>
  export const Code: ElementFunction<GlobalAttributes>
  export const Col: ElementFunction<GlobalAttributes & { span?: number }>
  export const Colgroup: ElementFunction<GlobalAttributes & { span?: number }>
  export const Data: ElementFunction<GlobalAttributes & { value?: string }>
  export const Datalist: ElementFunction<GlobalAttributes>
  export const Dd: ElementFunction<GlobalAttributes>
  export const Del: ElementFunction<
    GlobalAttributes & { cite?: string; datetime?: string }
  >
  export const Details: ElementFunction<GlobalAttributes & { open?: boolean }>
  export const Dfn: ElementFunction<GlobalAttributes>
  export const Dialog: ElementFunction<GlobalAttributes & { open?: boolean }>
  export const Div: ElementFunction<GlobalAttributes>
  export const Dl: ElementFunction<GlobalAttributes>
  export const Dt: ElementFunction<GlobalAttributes>
  export const Em: ElementFunction<GlobalAttributes>
  export const Embed: ElementFunction<
    GlobalAttributes & {
      src?: string
      type?: string
      width?: number | string
      height?: number | string
    }
  >
  export const Fieldset: ElementFunction<
    GlobalAttributes & { disabled?: boolean; form?: string; name?: string }
  >
  export const Figcaption: ElementFunction<GlobalAttributes>
  export const Figure: ElementFunction<GlobalAttributes>
  export const Footer: ElementFunction<GlobalAttributes>
  export const Form: ElementFunction<FormAttributes>
  export const H1: ElementFunction<GlobalAttributes>
  export const H2: ElementFunction<GlobalAttributes>
  export const H3: ElementFunction<GlobalAttributes>
  export const H4: ElementFunction<GlobalAttributes>
  export const H5: ElementFunction<GlobalAttributes>
  export const H6: ElementFunction<GlobalAttributes>
  export const Head: ElementFunction<GlobalAttributes>
  export const Header: ElementFunction<GlobalAttributes>
  export const Hgroup: ElementFunction<GlobalAttributes>
  export const Hr: ElementFunction<GlobalAttributes>
  export const Html: ElementFunction<GlobalAttributes & { lang?: string }>
  export const I: ElementFunction<GlobalAttributes>
  export const Iframe: ElementFunction<IframeAttributes>
  export const Img: ElementFunction<ImageAttributes>
  export const Input: ElementFunction<InputAttributes>
  export const Ins: ElementFunction<
    GlobalAttributes & { cite?: string; datetime?: string }
  >
  export const Kbd: ElementFunction<GlobalAttributes>
  export const Label: ElementFunction<LabelAttributes>
  export const Legend: ElementFunction<GlobalAttributes>
  export const Li: ElementFunction<GlobalAttributes & { value?: number }>
  export const Link: ElementFunction<LinkAttributes>
  export const Main: ElementFunction<GlobalAttributes>
  export const Map: ElementFunction<GlobalAttributes & { name?: string }>
  export const Mark: ElementFunction<GlobalAttributes>
  export const Menu: ElementFunction<GlobalAttributes>
  export const Meta: ElementFunction<MetaAttributes>
  export const Meter: ElementFunction<
    GlobalAttributes & {
      value?: number
      min?: number
      max?: number
      low?: number
      high?: number
      optimum?: number
    }
  >
  export const Nav: ElementFunction<GlobalAttributes>
  export const Noscript: ElementFunction<GlobalAttributes>
  export const Object: ElementFunction<
    GlobalAttributes & {
      data?: string
      type?: string
      name?: string
      form?: string
      width?: number | string
      height?: number | string
    }
  >
  export const Ol: ElementFunction<
    GlobalAttributes & {
      reversed?: boolean
      start?: number
      type?: "1" | "a" | "A" | "i" | "I"
    }
  >
  export const Optgroup: ElementFunction<
    GlobalAttributes & { disabled?: boolean; label?: string }
  >
  export const Option: ElementFunction<OptionAttributes>
  export const Output: ElementFunction<
    GlobalAttributes & { for?: string; form?: string; name?: string }
  >
  export const P: ElementFunction<GlobalAttributes>
  export const Param: ElementFunction<
    GlobalAttributes & { name?: string; value?: string }
  >
  export const Picture: ElementFunction<GlobalAttributes>
  export const Pre: ElementFunction<GlobalAttributes>
  export const Progress: ElementFunction<
    GlobalAttributes & { value?: number; max?: number }
  >
  export const Q: ElementFunction<GlobalAttributes & { cite?: string }>
  export const Rp: ElementFunction<GlobalAttributes>
  export const Rt: ElementFunction<GlobalAttributes>
  export const Ruby: ElementFunction<GlobalAttributes>
  export const S: ElementFunction<GlobalAttributes>
  export const Samp: ElementFunction<GlobalAttributes>
  export const Script: ElementFunction<ScriptAttributes>
  export const Section: ElementFunction<GlobalAttributes>
  export const Select: ElementFunction<SelectAttributes>
  export const Slot: ElementFunction<GlobalAttributes & { name?: string }>
  export const Small: ElementFunction<GlobalAttributes>
  export const Source: ElementFunction<
    GlobalAttributes & {
      src?: string
      type?: string
      srcset?: string
      sizes?: string
      media?: string
    }
  >
  export const Span: ElementFunction<GlobalAttributes>
  export const Strong: ElementFunction<GlobalAttributes>
  export const Style: ElementFunction<
    GlobalAttributes & { type?: string; media?: string; nonce?: string }
  >
  export const Sub: ElementFunction<GlobalAttributes>
  export const Summary: ElementFunction<GlobalAttributes>
  export const Sup: ElementFunction<GlobalAttributes>
  export const Table: ElementFunction<GlobalAttributes>
  export const Tbody: ElementFunction<GlobalAttributes>
  export const Td: ElementFunction<TableCellAttributes>
  export const Template: ElementFunction<GlobalAttributes>
  export const Textarea: ElementFunction<TextAreaAttributes>
  export const Tfoot: ElementFunction<GlobalAttributes>
  export const Th: ElementFunction<
    TableCellAttributes & {
      scope?: "row" | "col" | "rowgroup" | "colgroup"
      abbr?: string
    }
  >
  export const Thead: ElementFunction<GlobalAttributes>
  export const Time: ElementFunction<GlobalAttributes & { datetime?: string }>
  export const Title: ElementFunction<GlobalAttributes>
  export const Tr: ElementFunction<GlobalAttributes>
  export const Track: ElementFunction<
    GlobalAttributes & {
      kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata"
      src?: string
      srclang?: string
      label?: string
      default?: boolean
    }
  >
  export const U: ElementFunction<GlobalAttributes>
  export const Ul: ElementFunction<GlobalAttributes>
  export const Var: ElementFunction<GlobalAttributes>
  export const Video: ElementFunction<VideoAttributes>
  export const Wbr: ElementFunction<GlobalAttributes>

  // SVG Elements
  export const Svg: ElementFunction<SVGAttributes>
  export const Animate: ElementFunction<SVGAttributes>
  export const AnimateMotion: ElementFunction<SVGAttributes & { path?: string }>
  export const AnimateTransform: ElementFunction<
    SVGAttributes & { type?: string }
  >
  export const Circle: ElementFunction<SVGAttributes>
  export const ClipPath: ElementFunction<SVGAttributes>
  export const Defs: ElementFunction<SVGAttributes>
  export const Desc: ElementFunction<SVGAttributes>
  export const Ellipse: ElementFunction<SVGAttributes>
  export const Filter: ElementFunction<SVGAttributes>
  export const ForeignObject: ElementFunction<SVGAttributes>
  export const G: ElementFunction<SVGAttributes>
  export const Image: ElementFunction<SVGAttributes>
  export const Line: ElementFunction<SVGAttributes>
  export const LinearGradient: ElementFunction<SVGAttributes>
  export const Marker: ElementFunction<
    SVGAttributes & {
      markerWidth?: number | string
      markerHeight?: number | string
      refX?: number | string
      refY?: number | string
      orient?: string | number
    }
  >
  export const Mask: ElementFunction<SVGAttributes>
  export const Metadata: ElementFunction<SVGAttributes>
  export const Path: ElementFunction<SVGAttributes>
  export const Pattern: ElementFunction<SVGAttributes>
  export const Polygon: ElementFunction<SVGAttributes>
  export const Polyline: ElementFunction<SVGAttributes>
  export const RadialGradient: ElementFunction<SVGAttributes>
  export const Rect: ElementFunction<SVGAttributes>
  export const Set: ElementFunction<SVGAttributes>
  export const Stop: ElementFunction<SVGAttributes>
  export const Switch: ElementFunction<SVGAttributes>
  export const Symbol: ElementFunction<SVGAttributes>
  export const Text: ElementFunction<SVGAttributes>
  export const TextPath: ElementFunction<SVGAttributes>
  export const Tspan: ElementFunction<SVGAttributes>
  export const Use: ElementFunction<SVGAttributes>
  export const View: ElementFunction<SVGAttributes>

  // Special elements
  export function Doctype(attributes?: { html?: boolean }): Node

  // Utility functions
  export function escape(text: string): string
  export function raw(html: string): { html: string }
  export function tag(
    name: string,
    attributes?: Record<string, any>,
    children?: Children,
  ): Node

  // Asset loaders
  export function css(path: string): { css: Node }
  export function js(path: string): { js: Node }
  export function json(path: string): any

  // Component system
  interface ComponentOptions {
    styles?: string | string[] | { css: Node } | { css: Node }[]
    scripts?: string | string[] | { js: Node } | { js: Node }[]
  }

  export function component<T = ComponentProps>(
    fn: Component<T> | ComponentWithI18n<T>,
    options?: ComponentOptions,
  ): Component<T>

  // CSS utilities
  export function classes(
    ...args: Array<string | Record<string, boolean> | undefined | null | false>
  ): string

  // Internationalization
  export function i18n<T = ComponentProps>(
    fn: ComponentWithI18n<T>,
    translations: Record<string, Record<string, string>>,
  ): Component<T>

  // Compile function
  interface CompileResult {
    template(...args: any[]): string
  }

  export function compile(path: string): CompileResult

  // Error types
  export class CompileError extends Error {
    constructor(message: string)
  }

  export class SecurityError extends Error {
    constructor(message: string)
  }

  export class TranslationError extends Error {
    constructor(message: string)
  }

  export class FileError extends Error {
    constructor(message: string)
  }

  export class RawError extends Error {
    constructor(message: string)
  }

  export class CSSError extends Error {
    constructor(message: string)
  }

  export class ImageError extends Error {
    constructor(message: string)
  }

  export class SVGError extends Error {
    constructor(message: string)
  }

  export class JSONError extends Error {
    constructor(message: string)
  }
}
