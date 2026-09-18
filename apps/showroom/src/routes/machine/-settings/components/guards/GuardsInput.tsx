import type { GuardConfig } from '@bemedev/app';
import { deepEqual } from '@bemedev/app/utils';
import { cn } from '@bemedev/mind-flow';
import { createEffect, createSignal, onMount, Show, type Component } from 'solid-js';

import { formatGuards } from '../../helpers';

/** Structural category classification for guard nodes in the syntax tree. */
export type GuardNodeType = 'key' | 'describer' | 'and' | 'or';

/** Type of guard node construct to insert at the current editor cursor position. */
export type InsertGuardType = 'and' | 'or' | 'key';

/** Result payload produced after inserting a guard construct into text. */
export interface InsertGuardResult {
  /** Updated text content with the new guard snippet inserted. */
  text: string;
  /** New selection start index highlighting the placeholder name. */
  selectionStart: number;
  /** New selection end index highlighting the placeholder name. */
  selectionEnd: number;
}

/**
 * Determines the structural category of a guard configuration.
 *
 * @param guard - The guard configuration of type {@linkcode GuardConfig}.
 *
 * @returns The category string of type {@linkcode GuardNodeType}.
 */
export const getGuardNodeType = (guard: GuardConfig): GuardNodeType => {
  if (typeof guard === 'string') return 'key';
  if (guard && typeof guard === 'object') {
    if ('and' in guard && Array.isArray(guard.and)) return 'and';
    if ('or' in guard && Array.isArray(guard.or)) return 'or';
    if ('name' in guard) return 'describer';
  }
  return 'key';
};

/**
 * Deeply strips empty strings or invalid nodes from a guard structure.
 *
 * @param guard - Raw or partial guard structure.
 *
 * @returns Cleaned guard configuration of type {@linkcode GuardConfig}, or
 *   `undefined` if empty.
 */
export const cleanGuardConfig = (guard: unknown): GuardConfig | undefined => {
  if (!guard) return undefined;
  if (typeof guard === 'string') {
    const trimmed = guard.trim();
    return trimmed ? trimmed : undefined;
  }
  if (Array.isArray(guard)) {
    const cleaned = guard
      .map(cleanGuardConfig)
      .filter((c): c is GuardConfig => c !== undefined);
    return cleaned.length > 0 ? (cleaned as any) : undefined;
  }
  if (typeof guard === 'object') {
    const obj = guard as Record<string, any>;
    if ('and' in obj && Array.isArray(obj.and)) {
      const cleanedChildren = obj.and
        .map(cleanGuardConfig)
        .filter((c): c is GuardConfig => c !== undefined);
      return cleanedChildren.length > 0 ? { and: cleanedChildren } : undefined;
    }
    if ('or' in obj && Array.isArray(obj.or)) {
      const cleanedChildren = obj.or
        .map(cleanGuardConfig)
        .filter((c): c is GuardConfig => c !== undefined);
      return cleanedChildren.length > 0 ? { or: cleanedChildren } : undefined;
    }
    if ('name' in obj && typeof obj.name === 'string') {
      const name = obj.name.trim();
      if (!name) return undefined;
      const desc = obj.description ? String(obj.description).trim() : undefined;
      return desc ? { name, description: desc } : name;
    }
  }
  return undefined;
};

/**
 * Normalizes any guard input into an array of structured type {@linkcode GuardConfig}
 * elements.
 *
 * @param value - Guard configuration value, array, string, or comma-separated list.
 *
 * @returns Array of normalized type {@linkcode GuardConfig} items.
 */
export const toGuardArray = (
  value?: GuardConfig | GuardConfig[] | string | string[],
): GuardConfig[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap(item => toGuardArray(item));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return toGuardArray(parsed);
      } catch {
        // Fall back to comma-separated
      }
    }
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    return [trimmed];
  }
  if (typeof value === 'object') {
    return [value as GuardConfig];
  }
  return [];
};

/**
 * Formats a GuardConfig value into a readable string representation for the editor.
 *
 * @param value - Guard configuration value, array, or string.
 *
 * @returns Formatted JSON or string representation.
 */
export const formatGuardValue = (
  value?: GuardConfig | GuardConfig[] | string | string[],
): string => {
  if (!value) return '';
  const arr = toGuardArray(value);
  if (arr.length === 0) return '';
  if (arr.length === 1 && typeof arr[0] === 'string') {
    return `"${arr[0]}"`;
  }
  if (arr.every(item => typeof item === 'string')) {
    return JSON.stringify(arr, null, 2);
  }
  if (arr.length === 1) {
    return JSON.stringify(arr[0], null, 2);
  }
  return JSON.stringify(arr, null, 2);
};

/**
 * Evaluates whether an AND / OR / key guard construct can be syntactically inserted
 * at the given cursor or selection position in a JSON string.
 *
 * @param text - Full source JSON text.
 * @param selectionStart - Starting character position of cursor or selection.
 * @param selectionEnd - Ending character position of cursor or selection.
 *
 * @returns `true` if insertion is valid at the position, `false` otherwise.
 */
export const canInsertGuardAtCursor = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
): boolean => {
  const trimmed = text.trim();

  // 1. If empty or whitespace, always valid to insert a new guard at root
  if (!trimmed) return true;

  // 2. If selection is active
  if (selectionStart !== selectionEnd) {
    const selected = text.slice(selectionStart, selectionEnd).trim();
    if (!selected) return false;

    // Check if selection starts inside quotes
    let inQuote = false;
    for (let i = 0; i < selectionStart; i++) {
      const c = text[i];
      if (c === '"' && (i === 0 || text[i - 1] !== '\\')) {
        inQuote = !inQuote;
      }
    }
    if (inQuote) return false;

    // Check if selection has balanced brackets/braces
    let brackets = 0;
    let braces = 0;
    for (let i = 0; i < selected.length; i++) {
      const c = selected[i];
      if (c === '"' && (i === 0 || selected[i - 1] !== '\\')) {
        inQuote = !inQuote;
      } else if (!inQuote) {
        if (c === '[') brackets++;
        else if (c === ']') brackets--;
        else if (c === '{') braces++;
        else if (c === '}') braces--;
      }
    }
    if (inQuote || brackets !== 0 || braces !== 0) return false;

    return true;
  }

  // 3. Single cursor position
  const pos = Math.min(selectionStart, text.length);

  let inQuote = false;
  const containerStack: ('array' | 'object')[] = [];

  for (let i = 0; i < pos; i++) {
    const c = text[i];
    if (c === '"' && (i === 0 || text[i - 1] !== '\\')) {
      inQuote = !inQuote;
    } else if (!inQuote) {
      if (c === '[') {
        containerStack.push('array');
      } else if (c === ']') {
        if (containerStack[containerStack.length - 1] === 'array') {
          containerStack.pop();
        }
      } else if (c === '{') {
        containerStack.push('object');
      } else if (c === '}') {
        if (containerStack[containerStack.length - 1] === 'object') {
          containerStack.pop();
        }
      }
    }
  }

  // If inside quotes, cannot insert
  if (inQuote) return false;

  // If between alphanumeric characters (middle of a token/word/number), cannot insert
  const prevChar = pos > 0 ? text[pos - 1] : '';
  const nextChar = pos < text.length ? text[pos] : '';
  if (/\w/.test(prevChar) && /\w/.test(nextChar)) {
    return false;
  }

  const currentContainer = containerStack[containerStack.length - 1];

  // Inside an array: valid insertion location for any guard element
  if (currentContainer === 'array') {
    return true;
  }

  // Inside an object: cannot insert bare guard (must be in an array)
  if (currentContainer === 'object') {
    return false;
  }

  // At root level: valid if cursor is at the very beginning or end of text
  const before = text.slice(0, pos).trim();
  const after = text.slice(pos).trim();

  if (!before || !after) {
    return true;
  }

  return false;
};

/**
 * Inserts a new guard construct (AND, OR, or simple key) at the exact cursor or
 * selection position inside a JSON string, automatically handling syntax commas,
 * nesting, and selecting the new guard placeholder name.
 *
 * @param currentText - Current raw text from the editor.
 * @param selectionStart - Start cursor character index.
 * @param selectionEnd - End cursor character index.
 * @param type - Guard category to insert of type {@linkcode InsertGuardType}.
 *
 * @returns An insertion result object of interface {@linkcode InsertGuardResult}.
 */
export const insertGuardAtCursor = (
  currentText: string,
  selectionStart: number,
  selectionEnd: number,
  type: InsertGuardType,
): InsertGuardResult => {
  const trimmed = currentText.trim();

  // Case 1: Empty text
  if (!trimmed) {
    let snippet = '';
    let target = '';
    if (type === 'key') {
      snippet = '"newGuard"';
      target = 'newGuard';
    } else if (type === 'and') {
      snippet = JSON.stringify({ and: ['conditionA', 'conditionB'] }, null, 2);
      target = 'conditionA';
    } else {
      snippet = JSON.stringify({ or: ['optionA', 'optionB'] }, null, 2);
      target = 'optionA';
    }
    const idx = snippet.indexOf(target);
    return {
      text: snippet,
      selectionStart: idx >= 0 ? idx : 0,
      selectionEnd: idx >= 0 ? idx + target.length : snippet.length,
    };
  }

  // Case 2: Text selection active (wrap or replace selection)
  if (selectionStart !== selectionEnd) {
    const selected = currentText.slice(selectionStart, selectionEnd).trim();
    let snippet = '';
    let target = '';

    if (type === 'key') {
      snippet = '"newGuard"';
      target = 'newGuard';
    } else {
      let parsedSelected: any = selected;
      try {
        parsedSelected = JSON.parse(selected);
      } catch {
        if (
          selected &&
          !selected.startsWith('"') &&
          !selected.startsWith('{') &&
          !selected.startsWith('[')
        ) {
          parsedSelected = selected;
        }
      }
      const wrapped = {
        [type]: [parsedSelected, type === 'and' ? 'conditionB' : 'optionB'],
      };
      snippet = JSON.stringify(wrapped, null, 2);
      target = type === 'and' ? 'conditionB' : 'optionB';
    }

    const newText =
      currentText.slice(0, selectionStart) +
      snippet +
      currentText.slice(selectionEnd);
    const targetIdx = snippet.indexOf(target);
    const selStart = selectionStart + (targetIdx >= 0 ? targetIdx : 0);
    return {
      text: newText,
      selectionStart: selStart,
      selectionEnd: selStart + target.length,
    };
  }

  // Case 3: Cursor is at a single position
  const pos = selectionStart;

  // Track depth up to cursor pos (ignoring string contents)
  let inQuote = false;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i < pos; i++) {
    const c = currentText[i];
    if (c === '"' && (i === 0 || currentText[i - 1] !== '\\')) {
      inQuote = !inQuote;
    } else if (!inQuote) {
      if (c === '[') bracketDepth++;
      else if (c === ']') bracketDepth = Math.max(0, bracketDepth - 1);
      else if (c === '{') braceDepth++;
      else if (c === '}') braceDepth = Math.max(0, braceDepth - 1);
    }
  }

  let snippet = '';
  let target = '';
  if (type === 'key') {
    snippet = '"newGuard"';
    target = 'newGuard';
  } else if (type === 'and') {
    snippet = JSON.stringify({ and: ['conditionA', 'conditionB'] }, null, 2);
    target = 'conditionA';
  } else {
    snippet = JSON.stringify({ or: ['optionA', 'optionB'] }, null, 2);
    target = 'optionA';
  }

  // Sub-case A: Inside an array ([ ... ])
  if (bracketDepth > 0) {
    let prevChar = '';
    for (let i = pos - 1; i >= 0; i--) {
      if (!/\s/.test(currentText[i])) {
        prevChar = currentText[i];
        break;
      }
    }

    let nextChar = '';
    for (let i = pos; i < currentText.length; i++) {
      if (!/\s/.test(currentText[i])) {
        nextChar = currentText[i];
        break;
      }
    }

    const needPrefixComma = prevChar !== '' && prevChar !== '[' && prevChar !== ',';
    const needSuffixComma = nextChar !== '' && nextChar !== ']' && nextChar !== ',';

    const prefix = needPrefixComma ? ', ' : '';
    const suffix = needSuffixComma ? ', ' : '';
    const inserted = prefix + snippet + suffix;

    const newText = currentText.slice(0, pos) + inserted + currentText.slice(pos);
    const targetIdx = snippet.indexOf(target);
    const selStart = pos + prefix.length + (targetIdx >= 0 ? targetIdx : 0);

    return {
      text: newText,
      selectionStart: selStart,
      selectionEnd: selStart + target.length,
    };
  }

  // Sub-case B: Inside an object ({ ... })
  if (braceDepth > 0) {
    let prevChar = '';
    for (let i = pos - 1; i >= 0; i--) {
      if (!/\s/.test(currentText[i])) {
        prevChar = currentText[i];
        break;
      }
    }
    let nextChar = '';
    for (let i = pos; i < currentText.length; i++) {
      if (!/\s/.test(currentText[i])) {
        nextChar = currentText[i];
        break;
      }
    }

    const needPrefixComma = prevChar !== '' && prevChar !== '{' && prevChar !== ',';
    const needSuffixComma = nextChar !== '' && nextChar !== '}' && nextChar !== ',';

    let objSnippet = snippet;
    if (type === 'and') {
      objSnippet = `"and": [\n  "conditionA",\n  "conditionB"\n]`;
    } else if (type === 'or') {
      objSnippet = `"or": [\n  "optionA",\n  "optionB"\n]`;
    }

    const prefix = needPrefixComma ? ', ' : '';
    const suffix = needSuffixComma ? ', ' : '';
    const inserted = prefix + objSnippet + suffix;

    const newText = currentText.slice(0, pos) + inserted + currentText.slice(pos);
    const targetIdx = objSnippet.indexOf(target);
    const selStart = pos + prefix.length + (targetIdx >= 0 ? targetIdx : 0);

    return {
      text: newText,
      selectionStart: selStart,
      selectionEnd: selStart + target.length,
    };
  }

  // Sub-case C: At top-level
  try {
    const parsed = JSON.parse(currentText);
    const combined = { [type]: [parsed, type === 'and' ? 'conditionB' : 'optionB'] };
    const combinedStr = JSON.stringify(combined, null, 2);
    target = type === 'and' ? 'conditionB' : 'optionB';
    const targetIdx = combinedStr.indexOf(target);
    return {
      text: combinedStr,
      selectionStart: targetIdx >= 0 ? targetIdx : 0,
      selectionEnd: (targetIdx >= 0 ? targetIdx : 0) + target.length,
    };
  } catch {
    const combined = {
      [type]: [trimmed, type === 'and' ? 'conditionB' : 'optionB'],
    };
    const combinedStr = JSON.stringify(combined, null, 2);
    target = type === 'and' ? 'conditionB' : 'optionB';
    const targetIdx = combinedStr.indexOf(target);
    return {
      text: combinedStr,
      selectionStart: targetIdx >= 0 ? targetIdx : 0,
      selectionEnd: (targetIdx >= 0 ? targetIdx : 0) + target.length,
    };
  }
};

/** Properties for the {@linkcode GuardsInput} component. */
export type GuardsInputProps = {
  /** Guard value (single key, logic object, or array). */
  value?: GuardConfig | GuardConfig[] | string | string[];
  /** Callback fired when the guard structure changes. */
  onChange: (value: GuardConfig[] | undefined) => void;
  /** Whether to render in compact mode for narrow sidebars. */
  compact?: boolean;
  /** Custom label text (defaults to 'Guards'). */
  label?: string;
  /** Custom placeholder text. */
  placeholder?: string;
};

/**
 * Modern, clean JSON input component for state machine transition and action guards.
 * Supports cursor-aware insertion of AND, OR, and simple guard keys, with automatic
 * disabling when cursor is at an invalid syntax position. Always renders on its own
 * dedicated full-width line.
 *
 * @param props - Component properties of type {@linkcode GuardsInputProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode insertGuardAtCursor}, {@linkcode canInsertGuardAtCursor}
 */
export const GuardsInput: Component<GuardsInputProps> = props => {
  let textareaRef: HTMLTextAreaElement | undefined;
  const [isInternalChange, setIsInternalChange] = createSignal(false);
  const [text, setText] = createSignal(formatGuardValue(props.value));
  const [jsonError, setJsonError] = createSignal<string | null>(null);
  const [cursorPos, setCursorPos] = createSignal<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const updateCursor = () => {
    if (textareaRef) {
      setCursorPos({
        start: textareaRef.selectionStart,
        end: textareaRef.selectionEnd,
      });
    }
  };

  onMount(() => {
    updateCursor();
  });

  // Synchronize internal text whenever incoming value changes externally
  createEffect(() => {
    const incoming = props.value;

    // If the textarea is currently focused or an internal input just triggered this, do not overwrite user's typing
    if (
      isInternalChange() ||
      (textareaRef && document.activeElement === textareaRef)
    ) {
      setIsInternalChange(false);
      return;
    }

    const incomingArr = toGuardArray(incoming);
    let currentArr: GuardConfig[] = [];
    const trimmed = text().trim();
    if (trimmed) {
      try {
        if (
          trimmed.startsWith('{') ||
          trimmed.startsWith('[') ||
          trimmed.startsWith('"')
        ) {
          currentArr = toGuardArray(JSON.parse(trimmed));
        } else {
          currentArr = toGuardArray(trimmed);
        }
      } catch {
        // syntax error in text, do not overwrite while user is typing
      }
    }
    if (!deepEqual(incomingArr, currentArr)) {
      setText(formatGuardValue(incoming));
      setJsonError(null);
      updateCursor();
    }
  });

  const canAdd = () => {
    const t = text();
    const { start, end } = cursorPos();
    return canInsertGuardAtCursor(t, start, end);
  };

  const notifyParsed = (val: GuardConfig | GuardConfig[] | undefined) => {
    const cleaned = cleanGuardConfig(val);
    if (!cleaned) {
      props.onChange(undefined);
    } else if (Array.isArray(cleaned)) {
      props.onChange(cleaned);
    } else {
      props.onChange([cleaned]);
    }
  };

  const handleInput = (raw: string) => {
    setText(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      setJsonError(null);
      props.onChange(undefined);
      return;
    }

    if (
      trimmed.startsWith('{') ||
      trimmed.startsWith('[') ||
      trimmed.startsWith('"')
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        setJsonError(null);
        notifyParsed(parsed);
      } catch (err: any) {
        setJsonError(err?.message || 'Invalid JSON syntax');
      }
      return;
    }

    setJsonError(null);
    const list = trimmed
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    notifyParsed(list);
  };

  const handlePrettify = () => {
    const trimmed = text().trim();
    if (!trimmed) return;
    try {
      let parsed: any;
      if (
        trimmed.startsWith('{') ||
        trimmed.startsWith('[') ||
        trimmed.startsWith('"')
      ) {
        parsed = JSON.parse(trimmed);
      } else {
        parsed = trimmed
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      setText(formatGuardValue(parsed));
      setJsonError(null);
      notifyParsed(parsed);
      queueMicrotask(() => {
        if (textareaRef) {
          textareaRef.focus();
          updateCursor();
        }
      });
    } catch (err: any) {
      setJsonError(err?.message || 'Cannot format invalid JSON');
    }
  };

  const handleInsert = (type: InsertGuardType) => {
    if (!canAdd()) return;

    const textarea = textareaRef;
    const start = textarea ? textarea.selectionStart : text().length;
    const end = textarea ? textarea.selectionEnd : text().length;

    const res = insertGuardAtCursor(text(), start, end, type);
    setText(res.text);

    try {
      if (
        res.text.trim().startsWith('{') ||
        res.text.trim().startsWith('[') ||
        res.text.trim().startsWith('"')
      ) {
        const parsed = JSON.parse(res.text);
        setJsonError(null);
        notifyParsed(parsed);
      } else {
        const list = res.text
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        setJsonError(null);
        notifyParsed(list);
      }
    } catch (err: any) {
      setJsonError(err?.message || 'Invalid JSON syntax');
    }

    queueMicrotask(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(res.selectionStart, res.selectionEnd);
        updateCursor();
      }
    });
  };

  const handleClear = () => {
    setText('');
    setJsonError(null);
    props.onChange(undefined);
    queueMicrotask(() => {
      if (textareaRef) {
        textareaRef.focus();
        updateCursor();
      }
    });
  };

  const preview = () => {
    if (!props.value) return '';
    try {
      const arr = toGuardArray(props.value);
      if (arr.length === 0) return '';
      return formatGuards(arr);
    } catch {
      return '';
    }
  };

  return (
    <div class='flex w-full flex-col gap-1 text-left'>
      {/* Header bar: Label, live preview badge, and quick action toolbar */}
      <div class='flex flex-wrap items-center justify-between gap-1'>
        <div class='flex items-center gap-1.5'>
          <label
            class={
              props.compact
                ? 'text-[10px] font-semibold text-gray-600'
                : 'text-xs font-semibold text-gray-700'
            }
          >
            {props.label ?? 'Guards'}{' '}
            <span class='font-normal text-gray-400'>(JSON or key)</span>
          </label>
          <Show when={preview()}>
            <span
              title={`Preview: ${preview()}`}
              class='py-0.2 max-w-[150px] truncate rounded border border-indigo-100 bg-indigo-50 px-1 font-mono text-[9px] font-semibold text-indigo-700'
            >
              {preview()}
            </span>
          </Show>
        </div>

        {/* Quick action toolbar with cursor insertion and disabled states */}
        <div class='flex items-center gap-1'>
          <button
            type='button'
            onMouseDown={e => e.preventDefault()}
            onClick={handlePrettify}
            title='Prettify / Format JSON'
            class='cursor-pointer rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-gray-600 shadow-2xs transition-all hover:bg-gray-50 active:scale-95'
          >
            {'{ }'} Format
          </button>
          <button
            type='button'
            disabled={!canAdd()}
            onMouseDown={e => e.preventDefault()}
            onClick={() => handleInsert('key')}
            title={
              canAdd()
                ? 'Add simple guard at cursor position'
                : 'Cannot add guard at current cursor position'
            }
            class={cn(
              'rounded border px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs transition-all',
              canAdd()
                ? 'cursor-pointer border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 active:scale-95'
                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60',
            )}
          >
            + Guard
          </button>
          <button
            type='button'
            disabled={!canAdd()}
            onMouseDown={e => e.preventDefault()}
            onClick={() => handleInsert('and')}
            title={
              canAdd()
                ? 'Add AND guard at cursor position'
                : 'Cannot add AND guard at current cursor position'
            }
            class={cn(
              'rounded border px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs transition-all',
              canAdd()
                ? 'cursor-pointer border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95'
                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60',
            )}
          >
            + AND
          </button>
          <button
            type='button'
            disabled={!canAdd()}
            onMouseDown={e => e.preventDefault()}
            onClick={() => handleInsert('or')}
            title={
              canAdd()
                ? 'Add OR guard at cursor position'
                : 'Cannot add OR guard at current cursor position'
            }
            class={cn(
              'rounded border px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs transition-all',
              canAdd()
                ? 'cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95'
                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60',
            )}
          >
            + OR
          </button>
          <Show when={text().trim().length > 0}>
            <button
              type='button'
              onMouseDown={e => e.preventDefault()}
              onClick={handleClear}
              title='Clear guards'
              class='cursor-pointer rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-red-600 shadow-2xs transition-all hover:bg-red-100 active:scale-95'
            >
              ✕
            </button>
          </Show>
        </div>
      </div>

      {/* JSON Textarea with ref and cursor tracking */}
      <textarea
        ref={el => (textareaRef = el)}
        rows={props.compact ? 2 : 3}
        value={text()}
        placeholder={props.placeholder ?? 'e.g. "isValid" or {"and": ["a", "b"]}'}
        onSelect={updateCursor}
        onKeyUp={updateCursor}
        onKeyDown={updateCursor}
        onClick={updateCursor}
        onFocus={updateCursor}
        onBlur={() => setIsInternalChange(false)}

        class='w-full rounded-lg border border-gray-300 bg-white p-2 font-mono text-[11px] leading-relaxed text-gray-800 placeholder-gray-400 shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none'

        onInput={e => {
          const target = e.currentTarget;
          const start = target.selectionStart;
          const end = target.selectionEnd;
          setIsInternalChange(true);
          handleInput(target.value);
          setCursorPos({ start, end });

          queueMicrotask(() => {
            if (textareaRef && document.activeElement === textareaRef) {
              textareaRef.setSelectionRange(start, end);
            }
          });
        }}
      />

      {/* Inline JSON error alert */}
      <Show when={jsonError()}>
        <p class='text-[10px] font-semibold text-red-500'>⚠️ {jsonError()}</p>
      </Show>
    </div>
  );
};
